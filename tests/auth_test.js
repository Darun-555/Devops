const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../src/app');

describe('Authentication Tests', () => {

  it('GET /health - should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
  });

  it('POST /api/auth/login - valid admin credentials should return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: '123456' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('role').equal('admin');
  });

  it('POST /api/auth/login - wrong password should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: 'wrongpass' });
    expect(res.status).to.equal(401);
  });

  it('POST /api/auth/login - unknown email should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@gmail.com', password: '123456' });
    expect(res.status).to.equal(401);
  });

  it('POST /api/auth/login - empty body should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).to.be.oneOf([400, 401]);
  });

  it('POST /api/auth/register - admin can register new user', async () => {
    // Login first
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: '123456' });
    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Test Doctor',
        email: 'testdoctor@gmail.com',
        password: '123456',
        role: 'doctor',
        department: 'Surgery'
      });
    expect(res.status).to.be.oneOf([201, 400]); // 400 if already exists
  });

  it('POST /api/auth/register - non-admin cannot register users', async () => {
    const clerkLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'clerk1@test.com', password: 'Pass@123' });
    const clerkToken = clerkLogin.body.token;

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${clerkToken}`)
      .send({
        fullName: 'Fake User',
        email: 'fake@gmail.com',
        password: '123456',
        role: 'nurse',
        department: 'Surgery'
      });
    expect(res.status).to.equal(403);
  });

});
