"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authorize = exports.authenticate = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const authenticate = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'unauthorized'
    });
  }
  try {
    const decoded = _jsonwebtoken.default.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: 'unauthorized'
    });
  }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'forbidden'
      });
    }
    next();
  };
};
exports.authorize = authorize;