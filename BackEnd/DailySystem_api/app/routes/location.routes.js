
const express = require("express")
const router = express.Router()
const location = require("../controllers/location.controller")
const authenBasic = require('../middlewares/authentication.middleware')

router.post("/v1/location/get", authenBasic, location.getAll)

module.exports = router
