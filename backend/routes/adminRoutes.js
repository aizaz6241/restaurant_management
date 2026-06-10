const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'SherAfghanAdmin786';
  
  if (username === adminUser && password === adminPass) {
    res.json({ token: 'sher-afghan-admin-session-token' });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

module.exports = router;
