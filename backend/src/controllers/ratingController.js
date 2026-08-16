"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.submitRating = exports.getMyRatings = void 0;
var _uuid = require("uuid");
var _db = _interopRequireDefault(require("../config/db"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }

const submitRating = async (req, res) => {
  try {
    const {
      id: store_id
    } = req.params;
    const {
      ratingValue
    } = req.body;
    const user_id = req.user?.id;
    const ratingNum = parseInt(ratingValue, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(422).json({
        success: false,
        error: 'Rating must be between 1 and 5.',
        field: 'ratingValue'
      });
    }

    const [storeRows] = await _db.default.query('SELECT id FROM stores WHERE id = ?', [store_id]);
    if (storeRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Store not found.'
      });
    }

    const [existingRows] = await _db.default.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [user_id, store_id]);
    const existing = existingRows;
    if (existing.length > 0) {
      await _db.default.query('UPDATE ratings SET rating_value = ? WHERE user_id = ? AND store_id = ?', [ratingNum, user_id, store_id]);
      return res.status(200).json({
        success: true,
        message: 'Rating updated.'
      });
    } else {
      const id = (0, _uuid.v4)();
      await _db.default.query('INSERT INTO ratings (id, user_id, store_id, rating_value) VALUES (?, ?, ?, ?)', [id, user_id, store_id, ratingNum]);
      return res.status(201).json({
        success: true,
        message: 'Rating submitted.'
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'server_error'
    });
  }
};

exports.submitRating = submitRating;
const getMyRatings = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const [rows] = await _db.default.query(`SELECT r.id, r.store_id, s.name as store_name, r.rating_value, r.created_at, r.updated_at
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = ?`, [user_id]);
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
exports.getMyRatings = getMyRatings;