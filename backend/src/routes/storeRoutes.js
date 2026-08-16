"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _storeController = require("../controllers/storeController");
var _ratingController = require("../controllers/ratingController");
var _auth = require("../middleware/auth");
const router = (0, _express.Router)();
router.get('/', _auth.authenticate, (0, _auth.authorize)('admin', 'normal_user'), _storeController.getStores);
router.post('/', _auth.authenticate, (0, _auth.authorize)('admin'), _storeController.createStore);
router.delete('/:id', _auth.authenticate, (0, _auth.authorize)('admin'), _storeController.deleteStore);
router.get('/:id', _auth.authenticate, (0, _auth.authorize)('admin', 'store_owner'), _storeController.getStoreById);
router.get('/:id/raters', _auth.authenticate, (0, _auth.authorize)('admin', 'store_owner'), _storeController.getStoreRaters);
router.post('/:id/ratings', _auth.authenticate, (0, _auth.authorize)('normal_user'), _ratingController.submitRating);
var _default = exports.default = router;