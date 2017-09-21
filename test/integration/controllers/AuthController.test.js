const sails = require('sails');
const expect = require('expect.js');
const request = require('supertest');

describe('AuthController', function() {
  beforeEach(function(done) {
    // Drops database between each test.  This works because we use the memory database
    sails.once('hook:orm:reloaded', done);
    sails.emit('hook:orm:reload');
  });

  describe('#signup()', function() {
    it('should create a new user', async function() {
      await request(sails.hooks.http.app)
        .post('/signup')
        .send({ username: 'test', password: 'test123' })
        .expect(201)
        .then((response) => {
          expect(response.body.user.username).to.equal('test');
          expect(response.body.token).to.not.be.empty;
        });
    });

    it('should return error if user already exists', async function() {
      await User.create({ username: 'test', password: 'test' });
      await request(sails.hooks.http.app)
        .post('/signup')
        .send({ username: 'test', password: 'test123' })
        .expect(400);
    });
  });
});
