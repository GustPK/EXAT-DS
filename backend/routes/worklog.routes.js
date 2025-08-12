const express = require("express")
const router = express.Router()
const worklog = require("../controllers/worklog.controller")
const authenBasic = require('../middlewares/authentication.middleware')

router.post("/v1/worklog/record", authenBasic, worklog.record)
router.post("/v1/worklog/get", authenBasic, worklog.get)
router.post("/v1/worklog/remove", authenBasic, worklog.remove)
router.put("/v1/worklog/update", authenBasic, worklog.update);



module.exports = router
