"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _authController = require("../controllers/authController");
var _auth = require("../middleware/auth");
const router = (0, _express.Router)();
router.post('/register', _authController.register);
router.post('/login', _authController.login);
router.post('/logout', _auth.authenticate, _authController.logout);
router.put('/password', _auth.authenticate, _authController.changePassword);
var _default = exports.default = router;