import { hashPassword } from '../helpers/password-validation';

module.exports = {
  attributes: {
    username: {
      type: 'string',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      required: true
    },
    toJSON() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
  },

  beforeCreate(user, done) {
    hashPassword(user.password)
      .then(hash => {
        user.password = hash;
        return done(null, user);
      })
      .catch(done);
  }
};
