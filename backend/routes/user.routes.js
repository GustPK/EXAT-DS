
const express = require("express")
const router = express.Router()
const user = require("../controllers/user.controller")
const authenBasic = require('../middlewares/authentication.middleware')

router.post("/v1/user/signup", user.signup)
router.post("/v1/user/login", user.login);
router.put("/v1/user/update", authenBasic, user.update);
router.post("/v1/user/get", authenBasic, user.get);


module.exports = router
