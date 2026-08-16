"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = exports.logout = exports.login = exports.changePassword = void 0;
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _uuid = require("uuid");
var _db = _interopRequireDefault(require("../config/db"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function validatePassword(password) {
  if (password.length < 8 || password.length > 16) return 'Password must be 8–16 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must include at least one special character.';
  return null;
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateName(name) {
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) return 'Name must be between 20 and 60 characters.';
  return null;
}

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      password
    } = req.body;
    if (!name || !email || !address || !password) {
      return res.status(422).json({
        success: false,
        error: 'All fields are required.'
      });
    }
    const nameErr = validateName(name);
    if (nameErr) return res.status(422).json({
      success: false,
      error: nameErr,
      field: 'name'
    });
    if (!validateEmail(email.trim())) {
      return res.status(422).json({
        success: false,
        error: 'Enter a valid email address.',
        field: 'email'
      });
    }
    const trimmedAddress = address.trim();
    if (!trimmedAddress || trimmedAddress.length > 400) {
      return res.status(422).json({
        success: false,
        error: 'Address must not exceed 400 characters.',
        field: 'address'
      });
    }
    const passErr = validatePassword(password);
    if (passErr) return res.status(422).json({
      success: false,
      error: passErr,
      field: 'password'
    });
    const [existing] = await _db.default.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'This email is already registered.',
        field: 'email'
      });
    }
    const password_hash = await _bcrypt.default.hash(password, 10);
    const id = (0, _uuid.v4)();
    await _db.default.query('INSERT INTO users (id, name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?, ?)', [id, name.trim(), email.trim().toLowerCase(), password_hash, trimmedAddress, 'normal_user']);
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please log in.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
};

exports.register = register;
const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        error: 'Email and password are required.'
      });
    }
    const [rows] = await _db.default.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    const users = rows;
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }
    const user = users[0];
    const valid = await _bcrypt.default.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }
    const token = _jsonwebtoken.default.sign({
      id: user.id,
      role: user.role,
      email: user.email
    }, JWT_SECRET, {
      expiresIn: '24h'
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
};

exports.login = login;
const logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(204).send();
};

exports.logout = logout;
const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword
    } = req.body;
    const userId = req.user?.id;
    if (!currentPassword || !newPassword) {
      return res.status(422).json({
        success: false,
        error: 'currentPassword and newPassword are required.'
      });
    }
    const passErr = validatePassword(newPassword);
    if (passErr) return res.status(422).json({
      success: false,
      error: passErr,
      field: 'newPassword'
    });
    const [rows] = await _db.default.query('SELECT * FROM users WHERE id = ?', [userId]);
    const users = rows;
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }
    const user = users[0];
    const valid = await _bcrypt.default.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect.',
        field: 'currentPassword'
      });
    }
    if (currentPassword === newPassword) {
      return res.status(422).json({
        success: false,
        error: 'New password must differ from current password.'
      });
    }
    const newHash = await _bcrypt.default.hash(newPassword, 10);
    await _db.default.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please log in again.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
};
exports.changePassword = changePassword;