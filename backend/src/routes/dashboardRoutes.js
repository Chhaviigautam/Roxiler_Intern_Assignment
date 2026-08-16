"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _dashboardController = require("../controllers/dashboardController");
var _auth = require("../middleware/auth");
const router = (0, _express.Router)();
router.get('/admin', _auth.authenticate, (0, _auth.authorize)('admin'), _dashboardController.getAdminDashboard);
router.get('/owner', _auth.authenticate, (0, _auth.authorize)('store_owner'), _dashboardController.getOwnerDashboard);
var _default = exports.default = router;