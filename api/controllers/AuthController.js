/**
 * AuthController
 *
 * @description :: Server-side logic for managing user accounts.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /** Signs up a new user with username and password. */
  signup: async function(req, res) {
    try {
      const user = await User.create({
        username: req.body.username,
        password: req.body.password
      });
      const token = await JWT.issue({ sub: user.id });

      return res.created({ user, token });
    } catch (err) {
      return res.negotiate(err);
    }
  },

  /** Performs a login of a user with username and password. */
  login: async function(req, res) {
    return res.serverError('Not implemented!');
  },

  /** Updates password for current user. */
  updatePassword: async function(req, res) {
    return res.serverError('Not implemented!');
  },

  /** Retrieves user information about current user. */
  profile: async function(req, res) {
    return res.serverError('Not implemented!');
  }
}
