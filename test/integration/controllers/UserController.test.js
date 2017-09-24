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

  const actions = [
    {
      name: 'like',
      modifier: 1,
      initialState: 0,
      prepareSuccess: function() {},
      prepareConflict: function(fromUser, toUser) {
        return Like.create({ fromUser, toUser });
      }
    },
    {
      name: 'unlike',
      modifier: -1,
      initialState: 2,
      prepareSuccess: function(fromUser, toUser) {
        return Like.create({ fromUser, toUser });
      },
      prepareConflict: function() {}
    }
  ];

  actions.forEach((action) => {
    describe(`#${action.name}()`, function() {
      helpers.testAuthentication((endpoint) => endpoint.post(`/user/1/${action.name}`));

      describe('with valid token', function() {
        let token;
        let currentUser;
        let targetUser;

        beforeEach(async function() {
          currentUser = await User.create({ username: 'test1', password: 'test' });
          token = await JWT.issue({ sub: currentUser.id });

          targetUser = await User.create({ username: 'test2', password: 'test', numLikes: action.initialState });
        });

        function callEndpoint(userId, token) {
          return request(sails.hooks.http.app).post(`/user/${userId}/${action.name}`).set('Authorization', `Bearer ${token}`);
        }

        it('should return error if specified user is not found', async function() {
          await callEndpoint(666, token).expect(404);
        });

        it(`should return error if specified user is ${action.name}d by current user`, async function() {
          await action.prepareConflict(currentUser, targetUser);

          await callEndpoint(targetUser.id, token).expect(400);
        });

        it(`should return success and update likes if ${action.name} is successful`, async function() {
          await action.prepareSuccess(currentUser, targetUser);

          await callEndpoint(targetUser.id, token).expect(200);

          // Refresh the user to get correct likes.
          targetUser = await User.findOneById(targetUser.id);
          expect(targetUser.numLikes).to.equal(action.initialState + action.modifier);
        });

        it('should handle multiple parallel requests from same user', async () => {
          await action.prepareSuccess(currentUser, targetUser);

          const responses = [];
          const requests = _.range(3).map(() =>
            callEndpoint(targetUser.id, token).then((response) => { responses.push(response.status); })
          );

          await Promise.all(requests);

          // Expect exactly one 200 success and two 400 failures.
          const successResponses = _.without(responses, 400);
          expect(successResponses.length).to.equal(1);
          expect(successResponses[0]).to.equal(200);

          const user = await User.findOneById(targetUser.id);
          expect(user.numLikes).to.equal(action.initialState + action.modifier);
        });

        it('should handle multiple parallel requests from different users', async () => {
          const anotherUser = await User.create({ username: 'test3', password: 'test' });
          const anotherToken = await JWT.issue({ sub: anotherUser.id });

          await action.prepareSuccess(currentUser, targetUser);
          await action.prepareSuccess(anotherUser, targetUser);

          const responses = [];
          const requests = [
            callEndpoint(targetUser.id, token).then((response) => { responses.push(response.status); }),
            callEndpoint(targetUser.id, anotherToken).then((response) => { responses.push(response.status); })
          ];

          await Promise.all(requests);

          responses.forEach((response) => {
            expect(response).to.equal(200);
          });

          const user = await User.findOneById(targetUser.id);
          expect(user.numLikes).to.equal(action.initialState + 2 * action.modifier);
        });
      });
    });
  });
});
