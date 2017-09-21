const sails = require('sails');
const expect = require('expect.js');
const request = require('supertest');

describe('UserController', function() {
  beforeEach(function(done) {
    // Drops database between each test.  This works because we use the memory database
    sails.once('hook:orm:reloaded', done);
    sails.emit('hook:orm:reload');
  });

  describe('#findOne', function() {
    it('should return notFound if user with id does not exist', async function() {
      await request(sails.hooks.http.app)
        .get('/user/666')
        .expect(404);
    });

    it('should return error if id is not specified', async function() {
      await request(sails.hooks.http.app)
        .get('/user/')
        .expect(404);
    });

    it('should return user with specified id', async function() {
      const user = await User.create({ username: 'test', password: 'test' });

      await request(sails.hooks.http.app)
        .get(`/user/${user.id}`)
        .expect(200, user.toJSON());
    });
  });
});
