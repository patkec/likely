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
    try {
      if (req.body.username && req.body.password) {
        const user = await User.findOneByUsername(req.body.username);
        if (user && await user.validatePassword(req.body.password)) {
          const token = await JWT.issue({ sub: user.id });
          return res.ok({ token });
        }
      }
      return res.unauthorized('Invalid username or password.');
    } catch (err) {
      return res.negotiate(err);
    }
  },

  /** Updates password for current user. */
  updatePassword: async function(req, res) {
    try {
      const user = await User.findOneById(req.userId);
      if (!user) {
        return res.serverError('Current user not valid.')
      }

      if (req.body.newPassword && await user.validatePassword(req.body.oldPassword)) {
        user.password = req.body.newPassword;
        await user.save();
        return res.ok();
      }
      return res.badRequest('Invalid password.');
    } catch (err) {
      return res.negotiate(err);
    }
  },

  /** Retrieves user information about current user. */
  profile: async function(req, res) {
    try {
      const user = await User.findOneById(req.userId);
      if (!user) {
        return res.serverError('Current user not valid.')
      }
      return res.ok(user);
    } catch (err) {
      return res.negotiate(err);
    }
  }
}
