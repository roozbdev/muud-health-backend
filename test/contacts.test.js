const request = require('supertest');
const app = require('../src/index');
const db = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  pool: {
    end: jest.fn(),
  },
}));

describe('Contacts API Endpoints', () => {
  afterAll(() => {
    db.pool.end();
  });

  describe('POST /contacts/add', () => {
    it('should add a new contact', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const response = await request(app)
        .post('/contacts/add')
        .send({
          user_id: 'user1',
          contact_name: 'Test Contact',
          contact_email: 'test@example.com',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('contact_id');
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/contacts/add')
        .send({
          user_id: 'user1',
          contact_name: 'Test Contact',
          contact_email: 'invalid-email', // Invalid email format
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /contacts/user/:id', () => {
    it('should get all contacts for a user', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: '1',
            contact_name: 'Test Contact',
            contact_email: 'test@example.com',
          },
        ],
      });

      const response = await request(app).get('/contacts/user/user1');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('contacts');
      expect(response.body.contacts).toBeInstanceOf(Array);
    });
  });
});