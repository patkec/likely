/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/** Public methods */
module.exports = {
  /** Retrieves information about specified user. */
  findOne: async function(req, res) {
    try {
      const id = req.param('id');
      const user = await User.findOneById(id)
      if (!user) {
        return res.notFound();
      }
      return res.ok(user);
    } catch (err) {
      return res.negotiate(err);
    }
  },

  /** Adds a like from current user to specified user. */
  like: async function(req, res) {
    return res.serverError('Not implemented!');
  },

  /** Removes a like from current user to specified user. */
  unlike: async function(req, res) {
    return res.serverError('Not implemented!');
  },

  /** Retrieves users with likes, sorted by most liked to least liked. */
  mostLiked: async function(req, res) {
    try {
      const users = await User.find();

      users.sort((userA, userB) => {
        // Most liked to least liked.
        let result = userB.numLikes - userA.numLikes;
        if (result === 0) {
          // Always return in the same order, even if users have equal number of likes.
          // Users with smaller id to bigger id.
          result = userA.id - userB.id;
        }
        return result;
      });
      return res.ok(users);
    } catch (err) {
      return res.negotiate(err);
    }
  }
};

