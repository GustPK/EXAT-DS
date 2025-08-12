const User = require("../models/user.model");
const jwt = require('jsonwebtoken');

exports.signup = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      success: false,
      message: "Content can not be empty!",
    });
  }

  // สร้าง Object จาก req.body
  const model = new User({
    USER_ID: req.body.USER_ID,
    USER_NAME: req.body.USER_NAME,
    EMAIL: req.body.EMAIL,
    PASSWORD: req.body.PASSWORD,
    PHONENUMBER: req.body.PHONENUMBER,
    DEPARTMENT_ID: req.body.DEPARTMENT_ID,
    POSITION: req.body.POSITION,
    ROLE: req.body.ROLE,
  });

  // เรียกใช้ model
  User.signup(model, (err, data) => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Some error occurred while creating user.",
        data: req.body,
      });
    }

    // ส่งกลับผลลัพธ์สำเร็จ
    res.send({
      success: true,
      message: data.message || "User created successfully.",
      data: req.body,
    });
  });
};

exports.login = (req, res) => {
  const { EMAIL, PASSWORD } = req.body;

  if (!EMAIL || !PASSWORD) {
    return res.status(400).send({ success: false, message: "กรอกอีเมลและรหัสผ่านให้ครบ" });
  }

  User.login(EMAIL, PASSWORD, (err, user) => {
    if (err) {
      return res.status(401).send({
        success: false,
        message: err.message || "เข้าสู่ระบบไม่สำเร็จ"
      });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { USER_ID: user.USER_ID, EMAIL: user.EMAIL, ROLE: user.ROLE },
      process.env.JWT_SECRET || 'Exat2023',
      { expiresIn: '2h' }
    );

    res.send({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      data: user,
      token // ส่ง token กลับไปด้วย
    });
  });
};



exports.update = (req, res) => {
  const user = req.body;

  if (!user || !user.USER_ID) {
    return res.status(400).send({
      success: false,
      message: "ต้องระบุ USER_ID และข้อมูลที่ต้องการอัปเดต",
    });
  }

  User.update(user, (err, result) => {
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


exports.get = (req, res) => {
  if (!req.body.DEPARTMENT_ID) {
    return res.status(400).send({
      success: false,
      message: "DEPARTMENT_ID is required!",
    });
  }

  User.get(req.body.DEPARTMENT_ID, (err, data) => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "เกิดข้อผิดพลาดขณะดึงข้อมูล User",
      });
    }

    res.send({
      success: true,
      message: "ข้อมูล User ดึงสำเร็จ",
      data: data,
    });
  });
};