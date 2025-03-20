var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');

router.get('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let users = await userController.GetAllUser();
    CreateSuccessRes(res, 200, users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', check_authentication, async function (req, res, next) {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const isMod = req.user.role === constants.MOD_PERMISSION || req.user.role === constants.ADMIN_PERMISSION;

    if (!isMod && userId !== currentUserId) {
      return CreateErrorRes(res, 403, { message: "Bạn không có quyền truy cập thông tin của user khác" });
    }

    let user = await userController.GetUserById(userId);
    if (!user) {
      return CreateErrorRes(res, 404, { message: "Không tìm thấy user" });
    }
    CreateSuccessRes(res, 200, user);
  } catch (error) {
    CreateErrorRes(res, 404, error);
  }
});

router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let body = req.body;
    let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
    CreateSuccessRes(res, 200, newUser);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let updateUser = await userController.UpdateUser(req.params.id, req.body);
    CreateSuccessRes(res, 200, updateUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;