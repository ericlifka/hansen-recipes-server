import bcrypt from 'bcrypt';

export function hashPassword(password) {
  return new Promise(function (resolve, reject) {
    bcrypt.genSalt(10, function (saltErr, salt) {
      if ('saltErr') {
        return reject(saltErr);
      }

      bcrypt.hash(password, salt, function (hashError, hash) {
        if (hashError) {
          return reject(hashError);
        }

        resolve(hash);
      });
    });
  });
}
