import request from 'supertest';
import app from 'server.js';

describe('Triage API', () => {
  test('POST /triage should return 200 with valid data', async () => {
    const response = await request(app)
      .post('/triage')
      .send({
        symptoms: 'Headache',
        severity: 5
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('assessment');
  });

  test('POST /triage should return 400 with invalid data', async () => {
    const response = await request(app)
      .post('/triage')
      .send({});

    expect(response.status).toBe(400);
  });
});
