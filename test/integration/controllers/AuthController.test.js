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
    it('should create a new user and generate auth token', async function() {
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

  describe('#login()', function() {
    it('should return auth token on valid credentials', async function() {
      await User.create({ username: 'test', password: 'test' });
      await request(sails.hooks.http.app)
        .post('/login')
        .send({ username: 'test', password: 'test' })
        .expect(200)
        .then((response) => {
          expect(response.body.token).to.not.be.empty;
        });
    });

    const errorTests = [
      { username: 'test123', password: 'test', desc: 'invalid username' },
      { password: 'test', desc: 'empty username' },
      { username: 'test', password: 'test123', desc: 'invalid password' },
      { username: 'test', desc: 'empty password' }
    ];
    errorTests.forEach((test) => {
      it(`should return error on ${test.desc}`, async function() {
        await User.create({ username: 'test', password: 'test' });
        await request(sails.hooks.http.app)
          .post('/login')
          .send({ username: test.username, password: test.password })
          .expect(403);
      });
    });
  });

  describe('#updatePassword', function() {
    it('should return error if auth token not provided', async function(){
      await request(sails.hooks.http.app)
        .put('/me/update-password')
        .expect(401);
    });

    it('should return error if auth token invalid', async function(){
      await request(sails.hooks.http.app)
        .put('/me/update-password')
        .set('Authorization', 'Bearer someWeirdToken')
        .expect(401);
    });

    describe('with valid token', function() {
      let token;
      let oldPassword;

      beforeEach(async function() {
        const user = await User.create({ username: 'test', password: 'test' });
        oldPassword = user.password;
        token = await JWT.issue({ sub: user.id });
      });

      it('should return error if old password is invalid', async function() {
        await request(sails.hooks.http.app)
          .put('/me/update-password')
          .set('Authorization', `Bearer ${token}`)
          .send({ oldPassword: 'test123', newPassword: 'test435' })
          .expect(400);

        const user = await User.findOneByUsername('test');
        expect(user.password).to.be.equal(oldPassword);
      });

      describe('and valid old password', function() {
        it('should change password to new password', async function() {
          await request(sails.hooks.http.app)
            .put('/me/update-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'test', newPassword: 'test123' })
            .expect(200);

          const user = await User.findOneByUsername('test');
          expect(user.password).not.to.be.equal(oldPassword);
        });

        it('should return error if new password is empty', async function() {
          await request(sails.hooks.http.app)
            .put('/me/update-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'test' })
            .expect(400);

          const user = await User.findOneByUsername('test');
          expect(user.password).to.be.equal(oldPassword);
        });
      });
    });
  });
});
