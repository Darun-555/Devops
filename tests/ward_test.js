const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../src/app');

describe('Ward Tests', () => {

  let adminToken;

  before(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: '123456' });
    adminToken = res.body.token;
  });

  it('POST /api/wards - admin can create a ward', async () => {
    const res = await request(app)
      .post('/api/wards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        wardName: 'Test Ward',
        department: 'Surgery',
        type: 'general',
        totalBeds: 20,
        availableBeds: 20
      });
    expect(res.status).to.be.oneOf([200, 201]);
  });

  it('POST /api/wards - should return 400 if required fields missing', async () => {
    const res = await request(app)
      .post('/api/wards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ wardName: 'Incomplete Ward' }); // missing department & totalBeds
    expect(res.status).to.equal(400);
  });

  it('POST /api/wards - should return 400 for invalid type', async () => {
    const res = await request(app)
      .post('/api/wards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        wardName: 'Bad Ward',
        department: 'Surgery',
        type: 'invalid_type',
        totalBeds: 10
      });
    expect(res.status).to.equal(400);
  });

  it('GET /api/wards - admin can list all wards', async () => {
    const res = await request(app)
      .get('/api/wards')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
  });

  it('GET /api/wards - should return 401 without token', async () => {
    const res = await request(app).get('/api/wards');
    expect(res.status).to.equal(401);
  });

});
