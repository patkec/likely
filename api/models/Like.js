/**
 * Like.js
 *
 * @description :: Represents a single like from one user to another.
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

      modifier: {
        type: 'integer',
        required: true,
        in: [-1, 1]
      }
    }
  };

