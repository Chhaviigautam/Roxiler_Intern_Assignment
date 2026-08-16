"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOwnerDashboard = exports.getAdminDashboard = void 0;
var _db = _interopRequireDefault(require("../config/db"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }

const getAdminDashboard = async (req, res) => {
  try {
    const [userCount] = await _db.default.query('SELECT COUNT(*) as total FROM users');
    const [storeCount] = await _db.default.query('SELECT COUNT(*) as total FROM stores');
    const [ratingCount] = await _db.default.query('SELECT COUNT(*) as total FROM ratings');
    return res.status(200).json({
      success: true,
      data: {
        totalUsers: userCount[0].total,
        totalStores: storeCount[0].total,
        totalRatings: ratingCount[0].total
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

exports.getAdminDashboard = getAdminDashboard;
const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    const [storeRows] = await _db.default.query(`
      SELECT s.id, s.name, s.email, s.address, 
             AVG(r.rating_value) as avg_rating, 
             COUNT(r.id) as total_raters
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [userId]);
    const stores = storeRows;
    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          stores: [],
          store: null,
          averageRating: null,
          totalRaters: 0,
          raters: []
        }
      });
    }
    const store = stores[0];
    return res.status(200).json({
      success: true,
      data: {
        stores,
        store,
        averageRating: store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : null,
        totalRaters: store.total_raters || 0
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
exports.getOwnerDashboard = getOwnerDashboard;