import bcrypt from 'bcrypt';

export const hashPassword = password =>
  new Promise((resolve, reject) =>
    bcrypt.genSalt(10, (saltError, salt) =>
      saltError ? reject(saltError) :
        bcrypt.hash(password, salt, (hashError, hash) =>
          hashError ? reject(hashError) :
            resolve(hash))));
