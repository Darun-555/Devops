pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    tools {
        nodejs 'NodeJS20'
    }

    environment {
        IMAGE_NAME      = 'hospital-system-app'
        K8S_SERVICE_NAME = 'hospital-system-app-service'
        CONTAINER_PORT  = '3000'
        HOST_PORT       = '3000'
        K8S_PORT        = '30000'
        PORT_FORWARD_PORT = '18080'
        KUBECONFIG      = '/var/jenkins_home/.kube/config'
        K8S_CONTEXT     = 'docker-desktop'
        K8S_NAMESPACE   = 'default'
        NAGIOS_URL      = 'http://localhost:8090'
        ZAP_REPORT_DIR  = "${WORKSPACE}/zap-reports"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'JWT_EXPIRE', variable: 'JWT_EXPIRE')
                ]) {
                    sh '''
                        echo "MONGO_URI=${MONGO_URI}" > .env
                        echo "JWT_SECRET=${JWT_SECRET}" >> .env
                        echo "JWT_EXPIRE=${JWT_EXPIRE}" >> .env
                        npm test
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level=high || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${IMAGE_NAME} .'
            }
        }

        stage('Kubernetes Auth Check') {
            steps {
                sh '''
                    set -e
                    test -f "${KUBECONFIG}"
                    kubectl config use-context "${K8S_CONTEXT}"
                    kubectl cluster-info
                    kubectl get namespace "${K8S_NAMESPACE}"
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    string(credentialsId: 'MONGO_URI',  variable: 'MONGO_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'JWT_EXPIRE', variable: 'JWT_EXPIRE')
                ]) {
                    sh '''
                        set -e
                        kubectl config use-context "${K8S_CONTEXT}"

                        # Apply ConfigMap
                        kubectl apply -f k8s/configmap.yaml

                        # Create/update Secret imperatively (never store real secret.yaml in git)
                        kubectl create secret generic hospital-app-secret \
                            --from-literal=MONGO_URI="${MONGO_URI}" \
                            --from-literal=JWT_SECRET="${JWT_SECRET}" \
                            --from-literal=JWT_EXPIRE="${JWT_EXPIRE}" \
                            --namespace=${K8S_NAMESPACE} \
                            --dry-run=client -o yaml | kubectl apply -f -

                        # Apply Deployment and Service
                        kubectl apply -f k8s/deployment.yaml
                        kubectl apply -f k8s/service.yaml

                        # Force rolling update with latest image
                        kubectl rollout restart deployment/${IMAGE_NAME} \
                            --namespace=${K8S_NAMESPACE}

                        # Wait for rollout to complete
                        kubectl rollout status deployment/${IMAGE_NAME} \
                            --namespace=${K8S_NAMESPACE} \
                            --timeout=120s
                    '''
                }
            }
        }

         stage('Health Check') {
            steps {
                sh '''
                    set -e
                    kubectl config use-context "${K8S_CONTEXT}"
                    echo "Waiting for Kubernetes pods to be ready..."
                    kubectl wait --for=condition=ready pod -l app=${IMAGE_NAME} -n ${K8S_NAMESPACE} --timeout=120s

                    kubectl port-forward --address 127.0.0.1 \
                        service/${K8S_SERVICE_NAME} \
                        ${PORT_FORWARD_PORT}:${CONTAINER_PORT} \
                        -n ${K8S_NAMESPACE} > port-forward.log 2>&1 &
                    PF_PID=$!

                    cleanup() {
                        kill ${PF_PID} >/dev/null 2>&1 || true
                        wait ${PF_PID} >/dev/null 2>&1 || true
                    }

                    trap cleanup EXIT
                    sleep 5
                    RETRIES=5
                    COUNT=0
                    until curl -sf http://127.0.0.1:${PORT_FORWARD_PORT}/health; do
                        COUNT=$((COUNT+1))
                        if [ $COUNT -ge $RETRIES ]; then
                            echo "Health check failed after ${RETRIES} attempts"
                            kubectl get pods -n ${K8S_NAMESPACE}
                            kubectl describe deployment/${IMAGE_NAME} -n ${K8S_NAMESPACE}
                            cat port-forward.log || true
                            exit 1
                        fi
                        echo "Retrying ($COUNT/$RETRIES)..."
                        sleep 5
                    done
                    echo "Kubernetes deployment is healthy!"
                    kubectl get pods -n ${K8S_NAMESPACE} -l app=${IMAGE_NAME}
                '''
            }
        }

        stage('DAST - OWASP ZAP Scan') {
            steps {
                sh '''
                    set -e
                    kubectl config use-context "${K8S_CONTEXT}"
                    mkdir -p "${ZAP_REPORT_DIR}"
                    chmod 0777 "${ZAP_REPORT_DIR}" || true

                    kubectl port-forward --address 127.0.0.1 \
                        service/${K8S_SERVICE_NAME} \
                        ${PORT_FORWARD_PORT}:${CONTAINER_PORT} \
                        -n ${K8S_NAMESPACE} > zap-port-forward.log 2>&1 &
                    PF_PID=$!

                    cleanup() {
                        kill ${PF_PID} >/dev/null 2>&1 || true
                        wait ${PF_PID} >/dev/null 2>&1 || true
                    }

                    trap cleanup EXIT
                    sleep 5

                    if [ -f /.dockerenv ]; then
                        ZAP_NETWORK="container:$(hostname)"
                    else
                        ZAP_NETWORK="host"
                    fi

                    docker run --rm \
                        --user 0:0 \
                        --network ${ZAP_NETWORK} \
                        -v "${ZAP_REPORT_DIR}:/zap/wrk:rw" \
                        ghcr.io/zaproxy/zaproxy:stable \
                        zap-baseline.py \
                        -t http://127.0.0.1:${PORT_FORWARD_PORT} \
                        -r zap_report.html \
                        -J zap_report.json \
                        -I
                '''
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${ZAP_REPORT_DIR}",
                        reportFiles: 'zap_report.html',
                        reportName: 'OWASP ZAP Security Report'
                    ])
                }
            }
        }
            stage('Verify Nagios Monitoring') {
            steps {
                sh '''
                    echo "Checking Nagios is reachable at ${NAGIOS_URL}..."
                    if curl -sf --max-time 10 ${NAGIOS_URL}/nagios/ > /dev/null; then
                        echo "Nagios is UP and reachable at ${NAGIOS_URL}"
                    else
                        echo "WARNING: Nagios is NOT reachable at ${NAGIOS_URL}. Start your Nagios Docker container."
                        exit 1
                    fi
                '''
            }
        }

    }

    post {
        success { 
            echo 'Pipeline completed successfully!' 
            sh '''
                if kubectl config use-context "${K8S_CONTEXT}" >/dev/null 2>&1; then
                    kubectl get pods -n ${K8S_NAMESPACE} -l app=${IMAGE_NAME}
                    kubectl get services -n ${K8S_NAMESPACE}
                else
                    echo "Skipping Kubernetes summary because cluster auth is unavailable."
                fi
            '''
        }

        failure { 
            echo 'Pipeline failed. Check logs.'
            sh '''
                if kubectl config use-context "${K8S_CONTEXT}" >/dev/null 2>&1; then
                    kubectl get pods -n ${K8S_NAMESPACE} || true
                    kubectl logs deployment/${IMAGE_NAME} -n ${K8S_NAMESPACE} --tail=50 || true
                else
                    echo "Skipping Kubernetes diagnostics because cluster auth is unavailable."
                fi
            '''
        }
    }
}
