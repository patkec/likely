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
    return res.serverError('Not implemented!');
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
    return res.serverError('Not implemented!');
  }
};

