import bcrypt from 'bcrypt';
import passport from 'passport';
import passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;

function findByUsername(u, fn) {
  User.findOne({
    username: u
  }).then(function (user) {
    return fn(null, user);
  }).catch(function (err) {
    return fn(null, null);
  });
}

passport.serializeUser((user, done) =>
  done(null, user.id));

passport.deserializeUser((id, done) =>
  User.findOne(id)
    .then(user => done(null, user))
    .catch(err => done(null, null)));

passport.use(new LocalStrategy(
  function (username, password, done) {
    findByUsername(username, function (err, user) {
      if (err)
        return done(null, err);
      if (!user) {
        return done(null, false, {
          message: 'Unknown user ' + username
        });
      }
      bcrypt.compare(password, user.password, function (err, res) {
        if (!res)
          return done(null, false, {
            message: 'Invalid Password'
          });
        var returnUser = {
          username: user.username,
          createdAt: user.createdAt,
          id: user.id
        };
        return done(null, returnUser, {
          message: 'Logged In Successfully'
        });
      });
    });
  }
));
