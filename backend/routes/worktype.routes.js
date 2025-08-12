
const express = require("express")
const router = express.Router()
const worktype = require("../controllers/worktype.controller")
const authenBasic = require('../middlewares/authentication.middleware')

router.post("/v1/worktype/get", authenBasic, worktype.getAll)

module.exports = router
