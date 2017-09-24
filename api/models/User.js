/**
 * User.js
 *
 * @description :: Represents a single user with likes.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const bcrypt = require('bcrypt');
const Promise = require('bluebird');

async function hashPassword(values, cb) {
  try {
    if (values.password) {
      const hashedPassword = await Promise.promisify(bcrypt.hash)(values.password, 10);
      values.password = hashedPassword;
    }
    cb();
  } catch (err) {
    cb(err);
  }
}

module.exports = {

  attributes: {
    username: {
      type: 'string',
      required: true,
      unique: true
    },

    password: {
      type: 'string',
      required: true
    },

    numLikes: {
      type: 'integer',
      defaultsTo: 0
    },

    toJSON: function() {
      // Only return public properties.
      const obj = _.pick(this, [ 'id', 'username', 'numLikes' ]);
      return obj;
    },

    validatePassword: function(password) {
      return Promise.promisify(bcrypt.compare)(password, this.password);
    }
  },

  beforeCreate: hashPassword,
  beforeUpdate: hashPassword
};

