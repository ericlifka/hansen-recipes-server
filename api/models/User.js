import bcrypt from 'bcrypt';

export default {
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
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          console.log(err);
          done(err);
        } else {
          user.password = hash;
          done(null, user);
        }
      });
    });
  }
};
