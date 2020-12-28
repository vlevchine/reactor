const express = require('express'),
  os = require('os');

const router = express.Router();

router.route('/username').get((req, res) => {
  res.send({ username: os.userInfo().username });
});

module.exports = router;
