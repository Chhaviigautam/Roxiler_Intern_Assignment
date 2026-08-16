"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _ratingController = require("../controllers/ratingController");
var _auth = require("../middleware/auth");
const router = (0, _express.Router)();
router.get('/me', _auth.authenticate, (0, _auth.authorize)('normal_user'), _ratingController.getMyRatings);
var _default = exports.default = router;