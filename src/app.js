import express from 'express';
import passport from 'passport';
import passportLocal from 'passport-local';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import Sequelize from 'sequelize';

var sequelize = new Sequelize('sqlite', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',

  storage: './db.sqlite'
});

var User = sequelize.define('user', {
  username: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING }
});

User.sync({force: true}).then(function () {
  // Table created
  return User.create({
    id: 1,
    username: 'testabc',
    password: '123'
  });
});

const LocalStrategy = passportLocal.Strategy;

const app = express();

app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findOne({
    where: { id }
  }).then(function (user) {
    done(null, user);
  }).catch(function (err) {
    done(err, null);
  });
  //done(null, { username: "deserialized-user", id: id });
});

function isAuthenticated(req, res, next) {
  if (req && req.user && req.user.id) {
    return next();
  }
  res.send(401);
}

passport.use(new LocalStrategy(function (username, password, done) {
  console.log(`auth request: ${username}, ${password}`);
  User.findOne({
    where: { username }
  });
  return done(null, { username: "test-user", id: "1" });
}));

app.get('/', (req, res) => res.send("Hello World!"));

app.post('/login', passport.authenticate('local'), function (req, res) {
  res.json({ msg: "success", user: req.user });
});

app.get('/api/users/me',
  isAuthenticated,
  function(req, res) {
    res.json({ id: req.user.id, username: req.user.username, user: req.user });
  });

app.post('/logout', function(req, res){
  req.logout();
  res.json({ msg: "loggout success" });
});

app.listen(3000, () => console.log('listening on 3000'));

export default app;
