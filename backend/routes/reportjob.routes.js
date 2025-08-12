const express = require("express")
const router = express.Router()
const reportjob = require("../controllers/reportjob.controller")
const authenBasic = require('../middlewares/authentication.middleware')

router.post("/v1/reportjob/record",authenBasic, reportjob.record)

module.exports = router
