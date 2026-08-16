"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsers = exports.getUserById = exports.createUser = void 0;
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _uuid = require("uuid");
var _db = _interopRequireDefault(require("../config/db"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }

const getUsers = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = 'name',
      sortDir = 'asc',
      page = 1,
      pageSize = 10
    } = req.query;
    const allowedSortBy = ['name', 'email', 'address', 'role', 'created_at'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'name';
    const safeSortDir = sortDir === 'desc' ? 'DESC' : 'ASC';
    let conditions = [];
    let params = [];
    if (name) {
      conditions.push('name LIKE ?');
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push('email LIKE ?');
      params.push(`%${email}%`);
    }
    if (address) {
      conditions.push('address LIKE ?');
      params.push(`%${address}%`);
    }
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10)));
    const offset = (pageNum - 1) * pageSizeNum;
    const [countResult] = await _db.default.query(`SELECT COUNT(*) as total FROM users ${where}`, params);
    const total = countResult[0].total;
    const [rows] = await _db.default.query(`SELECT id, name, email, address, role, created_at FROM users ${where} ORDER BY ${safeSortBy} ${safeSortDir} LIMIT ? OFFSET ?`, [...params, pageSizeNum, offset]);
    return res.status(200).json({
      success: true,
      data: {
        items: rows,
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum)
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

exports.getUsers = getUsers;
const getUserById = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const [rows] = await _db.default.query('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [id]);
    const users = rows;
    if (users.length === 0) return res.status(404).json({
      success: false,
      error: 'not_found'
    });
    const user = users[0];
    if (user.role === 'store_owner') {
      const [storeRows] = await _db.default.query(`SELECT s.id, s.name, s.email, s.address, AVG(r.rating_value) as avg_rating, COUNT(r.id) as total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ?
         GROUP BY s.id`, [id]);
      const stores = storeRows;
      user.store = stores.length > 0 ? stores[0] : null;
    }
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
};

exports.getUserById = getUserById;
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      password,
      role
    } = req.body;
    const allowedRoles = ['admin', 'normal_user', 'store_owner'];
    if (!name || !email || !address || !password || !role) {
      return res.status(422).json({
        success: false,
        error: 'All fields are required.'
      });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(422).json({
        success: false,
        error: 'Select a valid role.',
        field: 'role'
      });
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      return res.status(422).json({
        success: false,
        error: 'Name must be between 20 and 60 characters.',
        field: 'name'
      });
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
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
    if (password.length < 8 || password.length > 16 || !/[A-Z]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      return res.status(422).json({
        success: false,
        error: 'Password must be 8–16 characters, including at least one uppercase letter and one special character.',
        field: 'password'
      });
    }
    const [existing] = await _db.default.query('SELECT id FROM users WHERE LOWER(email) = ?', [trimmedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'This email is already registered.',
        field: 'email'
      });
    }
    const password_hash = await _bcrypt.default.hash(password, 10);
    const id = (0, _uuid.v4)();
    await _db.default.query('INSERT INTO users (id, name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?, ?)', [id, trimmedName, trimmedEmail, password_hash, trimmedAddress, role]);
    return res.status(201).json({
      success: true,
      data: {
        id,
        name: trimmedName,
        email: trimmedEmail,
        address: trimmedAddress,
        role
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
exports.createUser = createUser;