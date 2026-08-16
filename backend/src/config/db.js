"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _promise = _interopRequireDefault(require("mysql2/promise"));
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_dotenv.default.config();
const pool = _promise.default.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false
});
var _default = exports.default = pool;