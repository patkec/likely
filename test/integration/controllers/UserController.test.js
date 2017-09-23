const sails = require('sails');
const expect = require('expect.js');
const request = require('supertest');

const helpers = require('./helpers');

describe('UserController', function() {
  beforeEach(function(done) {
    // Drops database between each test.  This works because we use the memory database
    sails.once('hook:orm:reloaded', done);
    sails.emit('hook:orm:reload');
  });

  describe('#findOne()', function() {
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
        .expect(200, { id: 1, username: 'test', numLikes: 0 });
    });
  });

  describe('#like()', function() {
    helpers.testAuthentication((endpoint) => endpoint.post('/user/1/like'));

    describe('with valid token', function() {
      let token;
      let currentUser;
      let userToLike;

      beforeEach(async function() {
        currentUser = await User.create({ username: 'test1', password: 'test' });
        userToLike = await User.create({ username: 'test2', password: 'test' });
        token = await JWT.issue({ sub: currentUser.id });
      });

      it('should return error if specified user is not found', async function() {
        await request(sails.hooks.http.app)
          .post('/user/666/like')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });

      it('should return error if specified user is already liked by current user', async function() {
        await LikeEvent.create({ fromUser: currentUser, toUser: userToLike, modifier: 1 });

        await request(sails.hooks.http.app)
          .post(`/user/${userToLike.id}/like`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400);
      });

      it('should return success and update likes if like is successful', async function() {
        await request(sails.hooks.http.app)
          .post(`/user/${userToLike.id}/like`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        // Refresh the user to get correct likes.
        userToLike = await User.findOneById(userToLike.id);
        const likeEvents = await LikeEvent.find({ toUser: userToLike.id });

        expect(likeEvents.length).to.equal(1);
        expect(likeEvents[0].fromUser).to.equal(currentUser.id);
        expect(userToLike.numLikes).to.equal(1);
      });

      it('should handle multiple parallel requests', async () => {
        const responses = [];
        const requests = _.range(3).map(() => request(sails.hooks.http.app)
          .post(`/user/${userToLike.id}/like`)
          .set('Authorization', `Bearer ${token}`)
          .then((response) => {
            responses.push(response.status);
          })
        );

        await Promise.all(requests);

        // Expect exactly one 200 success and two 400 failures.
        const successResponses = _.without(responses, 400);
        expect(successResponses.length).to.equal(1);
        expect(successResponses[0]).to.equal(200);

        const user = await User.findOneById(userToLike.id);
        expect(user.numLikes).to.equal(1);
      });
    });
  });

  describe('#unlike()', function() {
    helpers.testAuthentication((endpoint) => endpoint.post('/user/1/unlike'));

    describe('with valid token', function() {
      let token;
      let currentUser;
      let userToUnlike;

      beforeEach(async function() {
        currentUser = await User.create({ username: 'test1', password: 'test' });
        userToUnlike = await User.create({ username: 'test2', password: 'test', numLikes: 1 });
        token = await JWT.issue({ sub: currentUser.id });
      });

      it('should return error if specified user is not found', async function() {
        await request(sails.hooks.http.app)
          .post('/user/666/unlike')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });

      it('should return error if specified user is not liked by current user', async function() {
        await request(sails.hooks.http.app)
          .post(`/user/${userToUnlike.id}/unlike`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400);
      });

      it('should return success and update likes if unlike is successful', async function() {
        await LikeEvent.create({ fromUser: currentUser, toUser: userToUnlike, modifier: 1 });

        await request(sails.hooks.http.app)
          .post(`/user/${userToUnlike.id}/unlike`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        // Refresh the user to get correct likes.
        userToUnlike = await User.findOneById(userToUnlike.id);
        const likeEvents = await LikeEvent.find({ toUser: userToUnlike.id });

        expect(likeEvents).to.be.empty;
        expect(userToUnlike.numLikes).to.equal(0);
      });
    });
  });

  describe('#mostLiked()', function() {
    it('should return users sorted from most to least liked', async function() {
      const userCount = 10;
      const tasks = _.range(userCount).map((i) =>
        User.create({ username: `user${i}`, password: 'test', numLikes: i })
      );

      await Promise.all(tasks);

      await request(sails.hooks.http.app)
        .get('/most-liked/')
        .expect(200)
        .then((response) => {
          expect(response.body.length).to.equal(userCount);
          for (i = 0; i < userCount; i++) {
            expect(response.body[i].numLikes).to.equal(userCount - i - 1);
          }
        });
    });
  });
});
