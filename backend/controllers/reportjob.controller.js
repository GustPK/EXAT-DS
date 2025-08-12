const Reportjob = require("../models/reportjob.model");

function generateRandomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.record = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const randomRef = generateRandomString(8);
  const type = "SYS003";
  const status = "W";
  const currentDate = new Date();
  const creator = "User";

  const model = new Reportjob({
    ref: randomRef,
    type: type,
    status: status,
    from: req.body.from || currentDate,
    to: req.body.to || currentDate,
    created_by: creator,
    user_id: req.body.USER_ID || null,
    job_code: req.body.JOB_CODE || null
  });

  Reportjob.record(model, (err, data) => {
    if (err) {
      res.send({
        success: false,
        message: err.message || "Some error occurred.",
        data: req.body,
      });
    } else {
      if (data.rowsAffected > 0)
        res.send({
          success: true,
          data: {
            ref: model.ref,
            ...data,
          },
          message: "The transaction was successful.",
        });
      else
        res.send({
          success: false,
          message: "No rows affected",
        });
    }
  });
};

// เพิ่ม endpoint สำหรับเช็ค status ของ refcode
exports.checkStatusByRef = (req, res) => {
  const refcode = req.params.refcode;
  if (!refcode) {
    return res.status(400).send({ success: false, message: "refcode is required" });
  }
  Reportjob.checkStatusByRef(refcode, (err, status) => {
    if (err) {
      res.status(500).send({ success: false, message: err.message || "Some error occurred." });
    } else if (status === null) {
      res.status(404).send({ success: false, message: "Not found" });
    } else {
      res.send({ success: true, status });
    }
  });
};