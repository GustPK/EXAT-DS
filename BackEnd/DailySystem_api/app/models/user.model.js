const sql = require('../db');
const sqlType = require('mssql');

const User = function (model) {
  this.USER_ID = model.USER_ID;
  this.USER_NAME = model.USER_NAME;
  this.EMAIL = model.EMAIL;
  this.PASSWORD = model.PASSWORD;
  this.PHONENUMBER = model.PHONENUMBER;
  this.DEPARTMENT_ID = model.DEPARTMENT_ID;
  this.POSITION = model.POSITION;
  this.ROLE = model.ROLE;
};

// Static method for user signup
User.signup = async (newUser, result) => {
  try {
    const pool = await sql.connect();
    const request = pool.request()
      .input('USER_ID', sqlType.VarChar(8), newUser.USER_ID)
      .input('USER_NAME', sqlType.VarChar(30), newUser.USER_NAME)
      .input('EMAIL', sqlType.VarChar(30), newUser.EMAIL)
      .input('PASSWORD', sqlType.VarChar(30), newUser.PASSWORD)
      .input('PHONENUMBER', sqlType.VarChar(10), newUser.PHONENUMBER)
      .input('DEPARTMENT_ID', sqlType.VarChar(5), newUser.DEPARTMENT_ID)
      .input('POSITION', sqlType.VarChar(30), newUser.POSITION)
      .input('ROLE', sqlType.VarChar(10), newUser.ROLE);

    const query = `
      INSERT INTO [USER]
      ([USER_ID], [USER_NAME], [EMAIL], [PASSWORD],
       [PHONENUMBER], [DEPARTMENT_ID], [POSITION], [ROLE])
      VALUES
      (@USER_ID, @USER_NAME, @EMAIL, @PASSWORD,
       @PHONENUMBER, @DEPARTMENT_ID, @POSITION, @ROLE)
    `;

    await request.query(query);
    result(null, { success: true, id: newUser.USER_ID });
  } catch (err) {
    console.error('Error inserting user:', err);
    result(err, null);
  }
};

User.login = async (email, password, result) => {
  try {
    const pool = await sql.connect();
    const request = pool.request()
      .input('EMAIL', sqlType.VarChar(30), email)
      .input('PASSWORD', sqlType.VarChar(30), password);

    const query = `
  SELECT U.*, D.DEPARTMENT_NAME
  FROM [USER] U
  LEFT JOIN DEPARTMENT D ON U.DEPARTMENT_ID = D.DEPARTMENT_ID
  WHERE U.EMAIL = @EMAIL AND U.PASSWORD = @PASSWORD
`;


    const res = await request.query(query);

    if (res.recordset.length > 0) {
      result(null, res.recordset[0]);
    } else {
      result({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, null);
    }
  } catch (err) {
    console.error('Error during login:', err);
    result(err, null);
  }
};

User.update = async (user, result) => {
  try {
    const pool = await sql.connect(); // เชื่อมต่อฐานข้อมูล
    const request = pool.request(); // ✅ แบบที่ถูกต้อง

    request.input("USER_ID", sqlType.VarChar, user.USER_ID);
    request.input("USER_NAME", sqlType.NVarChar, user.USER_NAME || "");
    request.input("POSITION", sqlType.NVarChar, user.POSITION || "");
    request.input("DEPARTMENT_ID", sqlType.VarChar, user.DEPARTMENT_ID || "");
    request.input("EMAIL", sqlType.VarChar, user.EMAIL || "");
    request.input("PHONENUMBER", sqlType.VarChar, user.PHONENUMBER || "");

    const query = `
      UPDATE [USER]
      SET
        USER_NAME = @USER_NAME,
        POSITION = @POSITION,
        DEPARTMENT_ID = @DEPARTMENT_ID,
        EMAIL = @EMAIL,
        PHONENUMBER = @PHONENUMBER
      WHERE USER_ID = @USER_ID
    `;

    await request.query(query);
    result(null, { message: 'Update successful' });
  } catch (err) {
    console.error("Update error:", err);
    result(err, null);
  }
};


// ดึงข้อมูล User ตาม DEPARTMENT_ID
User.get = async (DEPARTMENT_ID, result) => {
  try {
    const pool = await sql.connect();
    const request = pool.request()
      .input('DEPARTMENT_ID', sqlType.VarChar(8), DEPARTMENT_ID);

    const query = `
      SELECT [USER_ID], [USER_NAME], [EMAIL], [PHONENUMBER], [DEPARTMENT_ID], [POSITION], [ROLE]
      FROM [USER]
      WHERE DEPARTMENT_ID = @DEPARTMENT_ID
      ORDER BY USER_ID ASC
    `;

    // ดำเนินการ query และส่งผลลัพธ์กลับ
    const resultSet = await request.query(query);
    result(null, resultSet.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    result(err, null);
  }
};


module.exports = User;
