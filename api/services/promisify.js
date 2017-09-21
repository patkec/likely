/**
 * A lightweight method to convert Node.js style callbacks to promises.
 *
 * @param fn      Function to be promisified.
 * @param context Optional "this" argument for the function.
 */
module.exports = function(fn, thisArg) {
  if (typeof fn !== 'function') throw new Error('Function is required.');

  return function(...args) {
    return new Promise((resolve, reject) => {
      const callback = (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      };
      // Callback should always come as the last parameter.
      args.push(callback);

      fn.apply(thisArg, args);
    });
  }
}
