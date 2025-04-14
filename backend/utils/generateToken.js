const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => {
  return jwt.sign({ id }, 'e-videoteka-secret-key-2025', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
