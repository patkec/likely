/**
 * 401 (Unauthorized) Handler
 *
 * Usage:
 * return res.unauthorized();
 * return res.unauthorized(data);
 * return res.unauthorized(data, 'some/specific/unauthorized/view');
 *
 * e.g.:
 * ```
 * return res.unauthorized(
 *   'Unauthorized for liking a user.'
 * );
 * ```
 */

module.exports = function unauthorized(data) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  // Set status code
  res.status(401);
  // Set a challenge
  res.set('WWW-Authenticate', 'Bearer');

  // Log error to console
  if (typeof data !== 'undefined') {
    sails.log.verbose('Sending 401 ("Unauthorized") response: \n', data);
  }
  else sails.log.verbose('Sending 401 ("Unauthorized") response');

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  if (sails.config.environment === 'production' && sails.config.keepResponseErrors !== true) {
    data = undefined;
  }

  // If the user-agent wants JSON, always respond with JSON
  // If views are disabled, revert to json
  if (req.wantsJSON) {
    return res.json(data);
  }

  // Render 401 view
  res.render('401', data, function(err) {
    // If the view doesn't exist, or an error occured, send json
    if (err) {
      return res.json(data);
    }

    // Otherwise, serve the `views/mySpecialView.*` page
    res.render('401');
  });
};

