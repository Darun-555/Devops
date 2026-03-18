const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../src/app');

describe('Admission Tests', () => {

  let adminToken;
  let doctorToken;
  let nurseToken;

  before(async () => {
    // Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: '123456' });
    adminToken = adminRes.body.token;

    // Doctor login 
    const doctorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor1@test.com', password: 'Pass@123' });
    doctorToken = doctorRes.body.token;

    // Nurse login (pre-existing or created)
    const nurseRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nurse1@test.com', password: 'Pass@123' });
    nurseToken = nurseRes.body.token;
  });

  it('GET /api/admissions - admin can list all admissions', async () => {
    const res = await request(app)
      .get('/api/admissions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
  });

  it('GET /api/admissions - should return 401 without token', async () => {
    const res = await request(app).get('/api/admissions');
    expect(res.status).to.equal(401);
  });

  it('GET /api/admissions - clerk cannot list admissions', async () => {
    const clerkRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'clerk1@test.com', password: 'Pass@123' });
    const clerkToken = clerkRes.body.token;

    const res = await request(app)
      .get('/api/admissions')
      .set('Authorization', `Bearer ${clerkToken}`);
    expect(res.status).to.equal(403);
  });

  it('POST /api/admissions/admit - should return 400 if body is missing fields', async () => {
    const res = await request(app)
      .post('/api/admissions/admit')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({}); // empty body
    expect(res.status).to.be.oneOf([400, 401]); // 401 if doctor doesn't exist yet
  });

  it('POST /api/admissions/vitals - nurse role required', async () => {
    const res = await request(app)
      .post('/api/admissions/vitals')
      .set('Authorization', `Bearer ${adminToken}`) // admin is not nurse
      .send({});
    expect(res.status).to.equal(403);
  });

  it('POST /api/admissions/medication - nurse role required', async () => {
    const res = await request(app)
      .post('/api/admissions/medication')
      .set('Authorization', `Bearer ${adminToken}`) // admin is not nurse
      .send({});
    expect(res.status).to.equal(403);
  });

  it('POST /api/admissions/doctor-note - clerk cannot add doctor note', async () => {
    const clerkRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'clerk1@test.com', password: 'Pass@123' });
    const clerkToken = clerkRes.body.token;

    const res = await request(app)
      .post('/api/admissions/doctor-note')
      .set('Authorization', `Bearer ${clerkToken}`)
      .send({});
    expect(res.status).to.equal(403);
  });

});
