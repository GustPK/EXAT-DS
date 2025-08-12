
const express = require("express")
const router = express.Router()
const department = require("../controllers/department.controller")

router.post("/v1/department/get", department.getAll)

module.exports = router
