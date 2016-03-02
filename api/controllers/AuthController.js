import passport from 'passport';

module.exports = {
  login(req, res) {
    const authStrategy = passport.authenticate('local', function (authError, user) {
      if (authError) {
        return res.send(400, { error: authError });
      }

      req.logIn(user, function (loginError) {
        if (loginError) {
          return res.send(400, { error: loginError });
        }

        return res.send({ user });
      });
    });

    return authStrategy(req, res);
  },

  logout(req, res) {
    req.logout();
    res.json({ status: "success" });
  },

  register(req, res) {
    const username = req.param('username');
    const password = req.param('password');
    const signupKey = req.param('signupKey');

    if (sails.config.secrets.signupKey !== signupKey) {
      return res.json(401, { error: "Invalid signup key" });
    }

    if (!username || !password) {
      return res.json(400, { error: "Username and Password are both required fields" });
    }

    User.create({ username, password })
      .then(user => res.json({ user: user.toJSON() }))
      .catch(error => res.json(400, { error: "Couldn't create user" }));
  },

  session(req, res) {
    res.json({ user: req.user.toJSON() });
  }
};
