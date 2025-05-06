const request = require('supertest');
const app = require('../src/index');
const db = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  pool: {
    end: jest.fn(),
  },
}));

describe('Journal API Endpoints', () => {
  afterAll(() => {
    db.pool.end();
  });

  describe('POST /journal/entry', () => {
    it('should create a new journal entry', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const response = await request(app)
        .post('/journal/entry')
        .send({
          user_id: 'user1',
          entry_text: 'Test journal entry',
          mood_rating: 4,
          timestamp: new Date().toISOString(),
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('entry_id');
    });

    it('should return 400 if mood_rating is invalid', async () => {
      const response = await request(app)
        .post('/journal/entry')
        .send({
          user_id: 'user1',
          entry_text: 'Test journal entry',
          mood_rating: 6, // Invalid (should be 1-5)
          timestamp: new Date().toISOString(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /journal/user/:id', () => {
    it('should get all journal entries for a user', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: '1',
            entry_text: 'Test journal entry',
            mood_rating: 4,
            timestamp: new Date().toISOString(),
          },
        ],
      });

      const response = await request(app).get('/journal/user/user1');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('entries');
      expect(response.body.entries).toBeInstanceOf(Array);
    });
  });
});