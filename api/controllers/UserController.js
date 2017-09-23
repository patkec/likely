/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

async function processLike(req, res, modifier, requireEvents) {
  const id = req.param('id');
  if (req.userId === id) {
    return res.badRequest('User can only like/unlike other users.');
  }

  try {
    let user = await User.findOneById(id);
    if (!user) {
      return res.notFound(`User with id ${id} not found.`);
    }

    // User can only like another user once. User can also not unlike other user if not liked previously.
    // Check the list of events what is the last event and act accordingly.
    const where = { fromUser: req.userId, toUser: user.id };
    const lastLikeEvent = await LikeEvent.find({ where, sort: 'id DESC', limit: 1 });
    if ((requireEvents && lastLikeEvent.length === 0) || (lastLikeEvent.length && lastLikeEvent[0].modifier === modifier)) {
      return res.badRequest('Cannot like/unlike user multiple times.');
    }

    const likeEvent = await LikeEvent.create({ fromUser: req.userId, toUser: user.id, modifier });
    // We do a classical loop of "interlocked compare exchange". We want to update the user from the state when it was loaded
    // (same number of likes). If it was changed during our processing then we load fresh copy of the user and try again.
    let updatedRecords = await User.update({ id: user.id, numLikes: user.numLikes }, { numLikes: user.numLikes + modifier });
    while (updatedRecords.length !== 1) {
      user = await User.findOneById(id);
      updatedRecords = await User.update({ id: user.id, numLikes: user.numLikes }, { numLikes: user.numLikes + modifier });
    }

    return res.ok();
  } catch (err) {
    return res.negotiate(err);
  }
}

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
    await processLike(req, res, 1, false /* requireEvents */);
  },

  /** Removes a like from current user to specified user. */
  unlike: async function(req, res) {
    await processLike(req, res, -1, true /* requireEvents */);
  },

  /** Retrieves users with likes, sorted by most liked to least liked. */
  mostLiked: async function(req, res) {
    try {
      const users = await User.find({ sort: { numLikes: -1, id: 1 }});
      return res.ok(users);
    } catch (err) {
      return res.negotiate(err);
    }
  }
};

