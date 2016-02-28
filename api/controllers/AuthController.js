import passport from 'passport';

module.exports = {
  login(req, res) {
    passport.authenticate('local', function (err, user, info) {
      if ((err) || (!user)) {
        return res.send({
          message: 'login failed'
        });
        res.send(err);
      }
      req.logIn(user, function (err) {
        if (err) res.send(err);
        return res.send({
          message: 'login successful'
        });
      });
    })(req, res);
  },

  logout(req, res) {
    req.logout();
    res.json({ status: "success" });
  },

  register(req, res) {
    const username = req.param('username');
    const password = req.param('password');

    if (!username || !password) {
      return res.json(400, { error: "Username and Password are both required fields" });
    }

    User.create({ username, password })
      .then(user => res.json({ user: user.toJSON() }))
      .catch(error => res.json({ error }));
  },

  session(req, res) {
    res.json({ user: req.user.toJSON() });
  }
};
