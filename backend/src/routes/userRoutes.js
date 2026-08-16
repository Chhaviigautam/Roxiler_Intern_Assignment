"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _userController = require("../controllers/userController");
var _auth = require("../middleware/auth");
const router = (0, _express.Router)();
router.get('/', _auth.authenticate, (0, _auth.authorize)('admin'), _userController.getUsers);
router.post('/', _auth.authenticate, (0, _auth.authorize)('admin'), _userController.createUser);
router.get('/:id', _auth.authenticate, (0, _auth.authorize)('admin'), _userController.getUserById);
var _default = exports.default = router;