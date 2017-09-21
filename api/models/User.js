/**
 * User.js
 *
 * @description :: Represents a single user with likes.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const bcrypt = require('bcrypt');

async function hashPassword(values, cb) {
  try {
    if (values.password) {
      const hashedPassword = await promisify(bcrypt.hash)(values.password, 10);
      values.password = hashedPassword;
      cb();
    }
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
      const obj = this.toObject();
      // Don't expose password to the outside world.
      delete obj.password;
      return obj;
    },

    validatePassword: function(password) {
      return promisify(bcrypt.compare)(password, this.password);
    }
  },

  beforeCreate: hashPassword,
  beforeUpdate: hashPassword
};
