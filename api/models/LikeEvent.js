/**
 * LikeEvent.js
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

      /** Indicates a like modifier, +1 for like, -1 for unlike. */
      modifier: {
        type: 'integer',
        required: true,
        in: [-1, 1]
      }
    }
  };

