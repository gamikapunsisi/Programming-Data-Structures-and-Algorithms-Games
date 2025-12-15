const request = require('supertest');
const app = require('./server');

describe('Eight Queens API Endpoints', () => {
  
  test('POST /compute-solutions should compute all solutions', async () => {
    const response = await request(app)
      .post('/compute-solutions')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('solutionsCount');
    expect(response. body.solutionsCount).toBe(92);
    expect(response.body).toHaveProperty('sequential');
    expect(response.body).toHaveProperty('threaded');
  }, 30000); // Increase timeout for computation

  test('GET /solutions-count should return count', async () => {
    const response = await request(app)
      .get('/solutions-count')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response. body).toHaveProperty('count');
    expect(response.body).toHaveProperty('total');
    expect(response.body.total).toBe(92);
  });

  test('POST /submit-solution should reject without username', async () => {
    const response = await request(app)
      .post('/submit-solution')
      .send({
        queenPositions: [[0,0], [1,4], [2,7], [3,5], [4,2], [5,6], [6,1], [7,3]]
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body. message).toContain('required');
  });

  test('POST /submit-solution should reject invalid solution', async () => {
    const response = await request(app)
      .post('/submit-solution')
      .send({
        username: 'testuser',
        queenPositions: [[0,0], [0,1], [2,7], [3,5], [4,2], [5,6], [6,1], [7,3]]
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response. body.message).toContain('Invalid solution');
  });

  test('GET /compare-performance should return performance metrics', async () => {
    // First compute solutions
    await request(app).post('/compute-solutions');

    const response = await request(app)
      .get('/compare-performance')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('sequentialTime');
    expect(response.body).toHaveProperty('threadedTime');
    expect(response.body).toHaveProperty('speedup');
  }, 30000);
});