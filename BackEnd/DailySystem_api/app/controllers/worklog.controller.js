const Worklog = require("../models/worklog.model");

exports.record = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      success: false,
      message: "Content can not be empty!",
    });
  }

  // สร้าง Object จาก req.body
  const model = new Worklog({
    WORKLOG_ID: null,
    USER_ID: req.body.USER_ID,
    WORK_DATE: req.body.WORK_DATE,
    TIME_START: req.body.TIME_START,
    TIME_END: req.body.TIME_END,
    TASK_DETAIL: req.body.TASK_DETAIL,
    LOCATION_ID: req.body.LOCATION_ID,
    WORKTYPE_ID: req.body.WORKTYPE_ID,
    JOB_CODE: req.body.JOB_CODE,
    COORDINATOR: req.body.COORDINATOR,
    ACTION_TAKEN: req.body.ACTION_TAKEN,
    PROBLEM: req.body.PROBLEM,
  });

  // เรียกใช้ model
  Worklog.record(model, (err, data) => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Some error occurred while creating the Worklog.",
        data: req.body,
      });
    }

    res.send({
      success: true,
      message: data.message || "Worklog created successfully.",
      data: req.body,
    });
  });
};

exports.get = (req, res) => {
  if (!req.body.USER_ID) {
    return res.status(400).send({
      success: false,
      message: "USER_ID is required!",
    });
  }

  Worklog.get(req.body.USER_ID, (err, data) => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "เกิดข้อผิดพลาดขณะดึงข้อมูล Worklog",
      });
    }

    res.send({
      success: true,
      message: "ข้อมูล Worklog ดึงสำเร็จ",
      data: data,
    });
  });
};

exports.remove = (req, res) => {
  
  if (!req.body) {
      res.status(400).send({
      message: "Content can not be empty!"
      });
  }
  
  Worklog.remove(req.body.id, (err, data) => {
    if (err)
    res.send({
        success:false,        
        message:
        err.message || "Some error occurred while creating the Checkin",
        data:req.body
    });
    else {        

      if(data.rowsAffected > 0)
        res.send({success:true, data:req.body, message:'The item was successfully deleted.'});
      else
        res.send({success:false, data:req.body});
      
    }
  });
};


exports.update = (req, res) => {
  const worklog = req.body;

  if (!worklog || !worklog.WORKLOG_ID) {
    return res.status(400).send({
      success: false,
      message: "ต้องระบุ WORKLOG_ID และข้อมูลที่ต้องการอัปเดต",
    });
  }

  Worklog.update(worklog, (err, result) => {
    if (err) {
      res.status(500).send({
        success: false,
        message: err.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
      });
    } else {
      res.send({
        success: true,
        message: "อัปเดตข้อมูลสำเร็จ",
      });
    }
  });
};
