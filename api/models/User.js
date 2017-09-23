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

    hasLikeFrom: async function(user) {
      const where = { fromUser: user, toUser: this.id };
      let lastLikeEvent = _.first(await LikeEvent.find({ where, sort: 'id DESC', limit: 1 }));
      return !!lastLikeEvent && lastLikeEvent.modifier === 1;
    },

    toJSON: function() {
      // Only return public properties.
      const obj = _.pick(this, [ 'id', 'username', 'numLikes' ]);
      return obj;
    },

    validatePassword: function(password) {
      return promisify(bcrypt.compare)(password, this.password);
    }
  },

  beforeCreate: hashPassword,
  beforeUpdate: hashPassword
};

