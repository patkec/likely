const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

const issuer = 'likely';
const secret = 'urbIMPAedHcBSOKYE6ZgWZJg9lQYikoTnih48aDoADviLuiB3nAlPiObbAHyrOG';

module.exports = {
  issue: function(payload) {
    payload = payload || {};
    // Use the identifier field as a subject.
    if (payload.id && !payload.sub) {
      payload.sub = payload.id;
    }
    return Promise.promisify(jwt.sign)(payload, secret, { issuer, expiresIn: '1d' })
  },

  verify: function(token) {
    return Promise.promisify(jwt.verify)(token, secret, { issuer });
  }
};
