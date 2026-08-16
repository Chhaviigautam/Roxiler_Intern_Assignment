"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStores = exports.getStoreRaters = exports.getStoreById = exports.createStore = void 0;
var _uuid = require("uuid");
var _db = _interopRequireDefault(require("../config/db"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }

const getStores = async (req, res) => {
  try {
    const {
      name,
      address,
      email,
      search,
      sortBy = 'name',
      sortDir = 'asc',
      page = 1,
      pageSize = 10
    } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const allowedSortBy = ['name', 'email', 'address', 'avg_rating'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'name';
    const safeSortDir = sortDir === 'desc' ? 'DESC' : 'ASC';
    let conditions = [];
    let params = [];
    if (search) {
      conditions.push('(s.name LIKE ? OR s.address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    } else {
      if (name) {
        conditions.push('s.name LIKE ?');
        params.push(`%${name}%`);
      }
      if (address) {
        conditions.push('s.address LIKE ?');
        params.push(`%${address}%`);
      }
    }
    if (email && userRole === 'admin') {
      conditions.push('s.email LIKE ?');
      params.push(`%${email}%`);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10)));
    const offset = (pageNum - 1) * pageSizeNum;
    const [countResult] = await _db.default.query(`SELECT COUNT(*) as total FROM stores s ${where}`, params);
    const total = countResult[0].total;

    let selectExtra = '';
    let joinExtra = '';
    if (userRole === 'normal_user' && userId) {
      selectExtra = `, myRating.rating_value as my_rating`;
      joinExtra = `LEFT JOIN ratings myRating ON myRating.store_id = s.id AND myRating.user_id = '${userId}'`;
    }
    const [rows] = await _db.default.query(`SELECT s.id, s.name, s.email, s.address, s.owner_id,
              AVG(r.rating_value) as avg_rating,
              COUNT(r.id) as total_ratings
              ${selectExtra}
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       ${joinExtra}
       ${where}
       GROUP BY s.id
       ORDER BY ${safeSortBy === 'avg_rating' ? 'avg_rating' : `s.${safeSortBy}`} ${safeSortDir}
       LIMIT ? OFFSET ?`, [...params, pageSizeNum, offset]);
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

exports.getStores = getStores;
const getStoreById = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const [rows] = await _db.default.query(`SELECT s.id, s.name, s.email, s.address, s.owner_id,
              AVG(r.rating_value) as avg_rating, COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id`, [id]);
    const stores = rows;
    if (stores.length === 0) return res.status(404).json({
      success: false,
      error: 'not_found'
    });
    const store = stores[0];

    if (userRole === 'store_owner' && store.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'forbidden'
      });
    }
    return res.status(200).json({
      success: true,
      data: store
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
};

exports.getStoreById = getStoreById;
const createStore = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      owner_id,
      ownerEmail,
      ownerName,
      ownerPassword,
      ownerAddress
    } = req.body;

    let storeEmail = email ? email.trim().toLowerCase() : (ownerEmail ? ownerEmail.trim().toLowerCase() : null);

    if (!name || !address) {
      return res.status(422).json({
        success: false,
        error: 'Store name and address are required.'
      });
    }

    let finalOwnerId = owner_id;

    if (ownerEmail && ownerPassword) {
      const trimmedOwnerEmail = ownerEmail.trim().toLowerCase();
      if (!storeEmail) storeEmail = trimmedOwnerEmail;
      const [existingOwner] = await _db.default.query('SELECT id, role FROM users WHERE LOWER(email) = ?', [trimmedOwnerEmail]);
      
      if (existingOwner.length > 0) {
        if (existingOwner[0].role !== 'store_owner') {
          return res.status(422).json({
            success: false,
            error: 'User with this email already exists and is not a Store Owner.',
            field: 'ownerEmail'
          });
        }
        finalOwnerId = existingOwner[0].id;
      } else {

        const _bcrypt = require('bcrypt');
        const defaultName = (ownerName && ownerName.trim().length >= 2) ? ownerName.trim() : `${name.trim()} Owner`;
        const defaultAddress = (ownerAddress && ownerAddress.trim()) ? ownerAddress.trim() : address.trim();
        const hash = await _bcrypt.hash(ownerPassword, 10);
        finalOwnerId = (0, _uuid.v4)();
        await _db.default.query(
          'INSERT INTO users (id, name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?, ?)',
          [finalOwnerId, defaultName, trimmedOwnerEmail, hash, defaultAddress, 'store_owner']
        );
      }
    } else if (ownerEmail) {

      const trimmedOwnerEmail = ownerEmail.trim().toLowerCase();
      if (!storeEmail) storeEmail = trimmedOwnerEmail;
      const [existingOwner] = await _db.default.query('SELECT id, role FROM users WHERE LOWER(email) = ?', [trimmedOwnerEmail]);
      if (existingOwner.length === 0 || existingOwner[0].role !== 'store_owner') {
        return res.status(422).json({
          success: false,
          error: 'No Store Owner found with this email. Please provide password to create a new one.',
          field: 'ownerEmail'
        });
      }
      finalOwnerId = existingOwner[0].id;
    }

    if (!finalOwnerId) {
      return res.status(422).json({
        success: false,
        error: 'Store Owner email is required.',
        field: 'ownerEmail'
      });
    }

    const [ownerRows] = await _db.default.query('SELECT id, role, email FROM users WHERE id = ?', [finalOwnerId]);
    if (ownerRows.length === 0 || ownerRows[0].role !== 'store_owner') {
      return res.status(422).json({
        success: false,
        error: 'Owner must be a valid Store Owner user.',
        field: 'ownerEmail'
      });
    }

    if (!storeEmail) {
      storeEmail = ownerRows[0].email;
    }

    const [existing] = await _db.default.query('SELECT id FROM stores WHERE LOWER(email) = ?', [storeEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'A store with this email already exists.',
        field: 'ownerEmail'
      });
    }

    const id = (0, _uuid.v4)();
    await _db.default.query('INSERT INTO stores (id, name, email, address, owner_id) VALUES (?, ?, ?, ?, ?)', [id, name.trim(), storeEmail, address.trim(), finalOwnerId]);
    return res.status(201).json({
      success: true,
      data: {
        id,
        name: name.trim(),
        email: storeEmail,
        address: address.trim(),
        owner_id: finalOwnerId
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

const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const [storeRows] = await _db.default.query('SELECT id FROM stores WHERE id = ?', [id]);
    if (storeRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Store not found.'
      });
    }

    await _db.default.query('DELETE FROM ratings WHERE store_id = ?', [id]);
    await _db.default.query('DELETE FROM stores WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Store deleted successfully.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
};
exports.deleteStore = deleteStore;

exports.createStore = createStore;
const getStoreRaters = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const [storeRows] = await _db.default.query('SELECT id, owner_id FROM stores WHERE id = ?', [id]);
    const stores = storeRows;
    if (stores.length === 0) return res.status(404).json({
      success: false,
      error: 'not_found'
    });
    if (userRole === 'store_owner' && stores[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'forbidden'
      });
    }
    const [rows] = await _db.default.query(`SELECT u.id as user_id, u.name, u.email, r.rating_value, r.created_at as rated_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`, [id]);
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
};
exports.getStoreRaters = getStoreRaters;