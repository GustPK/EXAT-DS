const sql = require('../db');
const sqlType = require('mssql');

// Constructor
const Worklog = function (model) {
  this.WORKLOG_ID = model.WORKLOG_ID;
  this.USER_ID = model.USER_ID;
  this.WORK_DATE = model.WORK_DATE;
  this.TIME_START = model.TIME_START;
  this.TIME_END = model.TIME_END;
  this.TASK_DETAIL = model.TASK_DETAIL;
  this.LOCATION_ID = model.LOCATION_ID;
  this.WORKTYPE_ID = model.WORKTYPE_ID;
  this.JOB_CODE = model.JOB_CODE;
  this.COORDINATOR = model.COORDINATOR;
  this.ACTION_TAKEN = model.ACTION_TAKEN;
  this.PROBLEM = model.PROBLEM;
};

// INSERT new record
Worklog.record = async (newWorklog, result) => {
  try {
    const datenow = new Date();
    // เปลี่ยน prefix เป็น W{2digitYear}
    const year = datenow.getFullYear();
    const year2digit = year.toString().slice(-2);
    const prefix = 'W' + year2digit;

    getNextWorklogId(prefix, async (err, idData) => {
      if (err) return result(err, null);

      const worklogId = idData.nextid;
      const pool = await sql.connect();

      // ฟังก์ชันเติม "-" อัตโนมัติถ้าไม่กรอก
      const safe = v => (v && v.toString().trim() !== "" ? v : "-----");

      const request = pool.request()
        .input('WORKLOG_ID', sqlType.VarChar(10), worklogId)
        .input('USER_ID', sqlType.VarChar(8), newWorklog.USER_ID)
        .input('WORK_DATE', sqlType.Date, newWorklog.WORK_DATE)
        .input('TIME_START', sqlType.Time, parseLocalTimeToDate(newWorklog.TIME_START))
        .input('TIME_END', sqlType.Time, parseLocalTimeToDate(newWorklog.TIME_END))
        .input('TASK_DETAIL', sqlType.NVarChar(sqlType.MAX), newWorklog.TASK_DETAIL)
        .input('LOCATION_ID', sqlType.VarChar(5), newWorklog.LOCATION_ID)
        .input('WORKTYPE_ID', sqlType.VarChar(5), newWorklog.WORKTYPE_ID)
        .input('JOB_CODE', sqlType.VarChar(5), safe(newWorklog.JOB_CODE))
        .input('COORDINATOR', sqlType.NVarChar(30), safe(newWorklog.COORDINATOR))
        .input('ACTION_TAKEN', sqlType.NVarChar(sqlType.MAX), safe(newWorklog.ACTION_TAKEN))
        .input('PROBLEM', sqlType.NVarChar(sqlType.MAX), safe(newWorklog.PROBLEM))

      const query = `
        INSERT INTO WORKLOG
        ([WORKLOG_ID], [USER_ID], [WORK_DATE], [TIME_START], [TIME_END], [TASK_DETAIL],
         [LOCATION_ID], [WORKTYPE_ID], [JOB_CODE], [COORDINATOR], [ACTION_TAKEN], [PROBLEM])
        VALUES
        (@WORKLOG_ID, @USER_ID, @WORK_DATE, @TIME_START, @TIME_END, @TASK_DETAIL,
         @LOCATION_ID, @WORKTYPE_ID, @JOB_CODE, @COORDINATOR, @ACTION_TAKEN, @PROBLEM)
      `;

      await request.query(query);
      result(null, { success: true, id: worklogId });
    });
  } catch (err) {
    console.error('Error inserting worklog:', err);
    result(err, null);
  }
};

async function getNextWorklogId(prefix, result) {
  getMaxWorklogId(prefix, (err, data) => {
    if (err != null) {
      result(err, null);
    } else {
      const maxid = data.data[0].MAXID;
      nextWorklogId(prefix, maxid, result);
    }
  });
}

async function getMaxWorklogId(prefix, result) {
  sql.connect()
    .then(async () => {
      // เปลี่ยน default MAXID เป็น W{2digitYear}000000
      const str = `
        SELECT ISNULL(MAX(WORKLOG_ID), '${prefix}000000') AS MAXID
        FROM WORKLOG
        WHERE WORKLOG_ID LIKE '${prefix}%'
      `;
      sql.query(str, (err, res) => {
        if (err) result(err, null);
        else result(null, { data: res.recordset });
      });
    })
    .catch(err => result(err, null));
}

async function nextWorklogId(prefix, maxid, result) {
  // maxid = W{2digitYear}{6digits}
  if (maxid.length >= prefix.length + 6) {
    const last6 = maxid.slice(-6);
    const next = (parseInt(last6) + 1).toString().padStart(6, '0');
    result(null, { nextid: prefix + next });
  } else {
    result(null, { nextid: prefix + '000001' });
  }
}

function parseLocalTimeToDate(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  date.setSeconds(0);
  date.setMilliseconds(0);

  // ปรับเวลาให้กลายเป็น UTC เทียม (ลบ offset ออก)
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
}

Worklog.get = async (USER_ID, result) => {
  try {
    const pool = await sql.connect();
    
    const request = pool.request()
      .input('USER_ID', sqlType.VarChar(8), USER_ID);

    const query = `
      SELECT W.[WORKLOG_ID], W.[USER_ID], W.[WORK_DATE], W.[TIME_START], W.[TIME_END], W.[TASK_DETAIL],
             W.[LOCATION_ID], W.[WORKTYPE_ID], W.[JOB_CODE], W.[COORDINATOR], W.[ACTION_TAKEN], W.[PROBLEM], L.[LOCATION_NAME], T.[WORKTYPE_NAME], U.[USER_NAME]
      FROM WORKLOG W
      LEFT JOIN LOCATION L ON L.LOCATION_ID = W.LOCATION_ID
      LEFT JOIN WORKTYPE T ON T.WORKTYPE_ID = W.WORKTYPE_ID
      LEFT JOIN [USER] U ON U.USER_ID = W.USER_ID
      WHERE W.USER_ID = @USER_ID
      ORDER BY W.WORK_DATE DESC, W.TIME_START ASC
    `;

    const resultSet = await request.query(query);
    result(null, resultSet.recordset);
  } catch (err) {
    console.error('Error fetching worklogs:', err);
    result(err, null);
  }
};

Worklog.remove = (id, result) => {
  sql.connect()
    .then(async function () { 
      const request = sql.request();

      request.input('WORKLOG_ID', sqlType.VarChar, id)
      request.query('DELETE FROM WORKLOG WHERE WORKLOG_ID=@WORKLOG_ID', (err, res) => {
        if (err) {        
          result(err, null)        
        } else {
          result(null, res)
        }     
      })
    })
    .catch(function (err) {
        result(err, null)       
      }
    );  
};

Worklog.update = async (worklog, result) => {
  try {
    const pool = await sql.connect();
    const request = pool.request();

    // แปลง TIME_START, TIME_END เป็น Date object (เหมือน insert)
    function parseLocalTimeToDate(timeStr) {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(":");
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      date.setSeconds(0);
      date.setMilliseconds(0);
      // ปรับเวลาให้กลายเป็น UTC เทียม (ลบ offset ออก)
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    }

    request.input("WORKLOG_ID", sqlType.VarChar, worklog.WORKLOG_ID || '');
    request.input("WORK_DATE", sqlType.Date, worklog.WORK_DATE || null);
    request.input("TIME_START", sqlType.Time, parseLocalTimeToDate(worklog.TIME_START) || null);
    request.input("TIME_END", sqlType.Time, parseLocalTimeToDate(worklog.TIME_END) || null);
    request.input("TASK_DETAIL", sqlType.NVarChar, worklog.TASK_DETAIL || null);
    request.input("LOCATION_ID", sqlType.VarChar, worklog.LOCATION_ID || null);
    request.input("WORKTYPE_ID", sqlType.VarChar, worklog.WORKTYPE_ID || null);
    request.input("JOB_CODE", sqlType.VarChar, worklog.JOB_CODE || null);
    request.input("COORDINATOR", sqlType.NVarChar, worklog.COORDINATOR || null);
    request.input("ACTION_TAKEN", sqlType.NVarChar, worklog.ACTION_TAKEN || null);
    request.input("PROBLEM", sqlType.NVarChar, worklog.PROBLEM || null);

    const query = `
      UPDATE WORKLOG
      SET
        WORK_DATE = @WORK_DATE,
        TIME_START = @TIME_START,
        TIME_END = @TIME_END,
        TASK_DETAIL = @TASK_DETAIL,
        LOCATION_ID = @LOCATION_ID,
        WORKTYPE_ID = @WORKTYPE_ID,
        JOB_CODE = @JOB_CODE,
        COORDINATOR = @COORDINATOR,
        ACTION_TAKEN = @ACTION_TAKEN,
        PROBLEM = @PROBLEM
      WHERE WORKLOG_ID = @WORKLOG_ID
    `;

    await request.query(query);
    result(null, { message: 'Update successful' });
  } catch (err) {
    console.error("Update error:", err);
    result(err, null);
  }
};




module.exports = Worklog;