import express from 'express';
import passport from 'passport';
import passportLocal from 'passport-local';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';

const LocalStrategy = passportLocal.Strategy;

const app = express();

//app.configure(function() {
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  //app.use(app.router);
//});

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  done(null, { username: "deserialized-user", id: id });
});

passport.use(new LocalStrategy(function (username, password, done) {
  console.log(`auth request: ${username}, ${password}`);
  return done(null, { username: "test-user", id: "1" });
}));


app.get('/', (req, res) => res.send("Hello World!"));
app.listen(3000, () => console.log('listening on 3000'));

export default app;
