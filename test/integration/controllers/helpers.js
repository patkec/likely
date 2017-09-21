const sails = require('sails');
const request = require('supertest');

module.exports = {
  testAuthentication: function(prepareEndpoint) {
    it('should return error if auth token not provided', async function(){
      await prepareEndpoint(request(sails.hooks.http.app))
        .expect(401);
    });

    it('should return error if auth token invalid', async function(){
      await prepareEndpoint(request(sails.hooks.http.app))
        .set('Authorization', 'Bearer someWeirdToken')
        .expect(401);
    });
  }
};
