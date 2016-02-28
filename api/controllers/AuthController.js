var passport = require('passport');
module.exports = {

  login: function (req, res) {
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
  logout: function (req, res) {
    req.logout();
    res.send('logout successful');
  },
  register: function (req, res) {
    var username = req.param('username');
    var password = req.param('password');
    User.create({
      username: username,
      password: password
    }).then(function (user) {
      res.json({ status: "success", msg: "login to continue" });
    }).catch(function (err) {
      res.json({ status: "error", error: err });
    });
  },
  session: function (req, res) {
    res.json({
      user: req.user.toJSON()
    });
  }
};

module.exports.blueprints = {

  // Expose a route for every method,
  // e.g.
  // `/auth/foo` =&gt; `foo: function (req, res) {}`
  actions: true,

  // Expose a RESTful API, e.g.
  // `post /auth` =&gt; `create: function (req, res) {}`
  rest: true,

  // Expose simple CRUD shortcuts, e.g.
  // `/auth/create` =&gt; `create: function (req, res) {}`
  // (useful for prototyping)
  shortcuts: true

};
