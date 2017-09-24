/**
 * Like.js
 *
 * @description :: Represents a single like event from one user to another.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
      fromUser: {
        model: 'User',
        required: true
      },

      toUser: {
        model: 'User',
        required: true
      },

      // Workaround for no support for composite keys in Waterline.
      identifier: {
        type: 'string',
        unique: true
      }
    },

    beforeCreate: function(values, cb) {
      values.identifier = `${values.fromUser}-${values.toUser}`;
      cb();
    },

    beforeUpdate: function(values, cb) {
      // Updates are not allowed, to unlike a user just delete the Like.
      cb(new Error('Not supported.'));
    }
  };

