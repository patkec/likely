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
 *   'Unauthorized for liking a user.',
 *   'user/1/like'
 * );
 * ```
 */

module.exports = function unauthorized(data, options) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = (typeof options === 'string') ? { view: options } : options || {};

  // Set status code
  res.status(401);
  // Set a challenge
  res.set('WWW-Authenticate', options.scheme || 'Bearer');

  // Log error to console
  if (data !== undefined) {
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
  if (req.wantsJSON || sails.config.hooks.views === false) {
    return res.jsonx(data);
  }

  // Attempt to prettify data for views, if it's a non-error object
  var viewData = data;
  if (!(viewData instanceof Error) && 'object' == typeof viewData) {
    try {
      viewData = require('util').inspect(data, {depth: null});
    }
    catch(e) {
      viewData = undefined;
    }
  }

  // If a view was provided in options, serve it.
  // Otherwise try to guess an appropriate view, or if that doesn't
  // work, just send JSON.
  if (options.view) {
    return res.view(options.view, { data: viewData, title: 'Unauthorized' });
  }

  // If no second argument provided, try to serve the implied view,
  // but fall back to sending JSON(P) if no view can be inferred.
  else return res.guessView({ data: viewData, title: 'Unauthorized' }, function couldNotGuessView () {
    return res.jsonx(data);
  });

};

