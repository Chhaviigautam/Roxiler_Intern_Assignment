"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _helmet = _interopRequireDefault(require("helmet"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _authRoutes = _interopRequireDefault(require("./routes/authRoutes"));
var _userRoutes = _interopRequireDefault(require("./routes/userRoutes"));
var _storeRoutes = _interopRequireDefault(require("./routes/storeRoutes"));
var _ratingRoutes = _interopRequireDefault(require("./routes/ratingRoutes"));
var _dashboardRoutes = _interopRequireDefault(require("./routes/dashboardRoutes"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_dotenv.default.config();
const app = (0, _express.default)();
const PORT = process.env.PORT || 5000;
app.use((0, _helmet.default)());
app.use((0, _cors.default)({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(_express.default.json());
app.use((0, _cookieParser.default)());

app.use('/api/v1/auth', _authRoutes.default);
app.use('/api/v1/users', _userRoutes.default);
app.use('/api/v1/stores', _storeRoutes.default);
app.use('/api/v1/ratings', _ratingRoutes.default);
app.use('/api/v1/dashboard', _dashboardRoutes.default);

app.get(['/health', '/api/v1/health', '/'], (req, res) => {
  res.json({
    success: true,
    message: 'Store Rating Platform API is running.'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'not_found'
  });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
var _default = exports.default = app;
