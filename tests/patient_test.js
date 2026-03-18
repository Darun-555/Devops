const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../src/app');

describe('Patient Tests', () => {

  let adminToken;
  let clerkToken;

  before(async () => {
    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: '123456' });
    adminToken = adminRes.body.token;

    // Login as registration_clerk
    const clerkRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'clerk1@test.com', password: 'Pass@123' });
    clerkToken = clerkRes.body.token;
  });

  it('POST /api/patients/register - should register patient as clerk', async () => {
    const res = await request(app)
      .post('/api/patients/register')
      .set('Authorization', `Bearer ${clerkToken}`)
      .send({
      firstName: 'Sarah',
      lastName: 'Connor',
      dob: '1984-05-12',
      gender: 'Female',
      contactNumber: '0559876543',
      entryPoint: 'A&E',
      servicePoint: 'ICU',
      knownDiseases: ['None'],
      initialComplaints: ['Laceration', 'Dizziness'],
      registeredBy: 'Clerk Ali'
      });
    expect(res.status).to.be.oneOf([201, 200]);
  });

  it('POST /api/patients/register - should return 403 if not clerk', async () => {
    const res = await request(app)
      .post('/api/patients/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Jane Doe', age: 25 });
    expect(res.status).to.equal(403);
  });

  it('GET /api/patients - should return all patients for admin', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
  });

  it('GET /api/patients - should return 401 without token', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).to.equal(401);
  });
describe('Patient Referral Tests', () => {

  let doctorToken;
  let clerkToken;
  let testPatientID;

  before(async () => {
    // Doctor login
    const doctorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor1@test.com', password: 'Pass@123' });
    doctorToken = doctorRes.body.token;

    // Clerk login
    const clerkRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'clerk1@test.com', password: 'Pass@123' });
    clerkToken = clerkRes.body.token;

    // Register a patient to get a valid patientID
    const patientRes = await request(app)
      .post('/api/patients/register')
      .set('Authorization', `Bearer ${clerkToken}`)
      .send({
        firstName: 'Referral',
        lastName: 'TestPatient',
        dob: '1985-06-15',
        gender: 'Male',
        contactNumber: '0501112233',
        entryPoint: 'OPD',
        servicePoint: 'Pathology',
        knownDiseases: ['Hypertension'],
        initialComplaints: ['Chest pain'],
        registeredBy: 'Clerk Ali'
      });
    testPatientID = patientRes.body?.data?.patientID || patientRes.body?.patientID;
    console.log('Test Patient ID:', testPatientID); // helps debug
  });

  it('POST /api/patients/:patientID/referrals - doctor can add referral', async () => {
    const res = await request(app)
      .post(`/api/patients/${testPatientID}/referrals`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        service: 'Radiology',
        reason: 'Suspected fracture in left arm',
        referredBy: 'Test Doctor',
        notes: 'Urgent X-ray needed'
      });
    expect(res.status).to.be.oneOf([200, 201]);
  });

  it('POST /api/patients/:patientID/referrals - clerk cannot add referral', async () => {
    const res = await request(app)
      .post(`/api/patients/${testPatientID}/referrals`)
      .set('Authorization', `Bearer ${clerkToken}`)
      .send({
        service: 'Radiology',
        reason: 'Test',
        referredBy: 'Clerk Ali'
      });
    expect(res.status).to.equal(403);
  });

  it('POST /api/patients/:patientID/referrals - missing fields returns 400', async () => {
    const res = await request(app)
      .post(`/api/patients/${testPatientID}/referrals`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ service: 'Radiology' }); // missing reason and referredBy
    expect(res.status).to.equal(400);
  });

  it('POST /api/patients/:patientID/referrals - no token returns 401', async () => {
    const res = await request(app)
      .post(`/api/patients/${testPatientID}/referrals`)
      .send({});
    expect(res.status).to.equal(401);
  });

});

});
