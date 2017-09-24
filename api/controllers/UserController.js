/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * Processes a like operation.
 *
 * @param req         Request object.
 * @param res         Response object.
 * @param updateLikes A function that either creates or deletes a like for a user and returns a like modifier or false if
 *                    operation cannot be completed.
 */
async function processLike(req, res, updateLikes) {
  const id = req.param('id');
  if (req.userId === id) {
    return res.badRequest('User can only like/unlike other users.');
  }

  try {
    let user = await User.findOneById(id);
    if (!user) {
      return res.notFound(`User with id ${id} not found.`);
    }

    const modifier = await updateLikes(req.userId, user.id);
    if (modifier === false) {
      return res.badRequest('Cannot like/unlike user multiple times.');
    }

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
    await processLike(req, res, async function(fromUser, toUser) {
      try {
        await Like.create({ fromUser, toUser });
        return 1; // Increase likes by 1.
      } catch (err) {
        return false;
      }
    });
  },

  /** Removes a like from current user to specified user. */
  unlike: async function(req, res) {
    await processLike(req, res, async function(fromUser, toUser) {
      try {
        const deletedLikes = await Like.destroy({ fromUser, toUser });
        // Make sure that this particular like was not deleted before.
        if (deletedLikes.length === 0) {
          return false;
        }
        return -1; // Decrease likes by 1.
      } catch (err) {
        return false;
      }
    });
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

