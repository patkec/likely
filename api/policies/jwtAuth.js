/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any user via Json Web Token authentication.
 *                 Assumes that token is present as part of the Authorization header.
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = async function(req, res, next) {
  let token = null;
  if (req.headers && req.headers.authorization) {
    const authHeaderParts = req.headers.authorization.split(' ');
    if (authHeaderParts.length === 2) {
      const scheme = authHeaderParts[0];
      if (/^Bearer$/i.test(scheme)) {
        token = authHeaderParts[1];
      } else {
        return res.unauthorized('Unsupported authorization scheme.');
      }
    } else {
      return res.unauthorized('Invalid authorization header.');
    }
  } else {
    return res.unauthorized('Authorization header is required.');
  }

  try {
    const decodedToken = await JWT.verify(token);
    req.userId = decodedToken.sub;
    return next();
  } catch (err) {
    return res.unauthorized('Invalid authorization token.');
  }
};
