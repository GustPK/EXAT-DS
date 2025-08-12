const sql = require("../db");
const sqlType = require("mssql");

const Reportjob = function (model) {
  this.ref = model.ref;
  this.type = model.type;
  this.status = model.status;
  this.from = model.from;
  this.to = model.to;
  this.created_by = model.created_by;
  this.user_id = model.user_id;
  this.job_code = model.job_code;
};

Reportjob.record = (newImport, result) => {
  sql
    .connect()
    .then(async function () {
      const request = sql.request();

      request.input("REPORTJOB_FROMDATE", sqlType.Date, newImport.from);
      request.input("REPORTJOB_TODATE", sqlType.Date, newImport.to);
      request.input("REPORTJOB_REF", sqlType.VarChar, newImport.ref);
      request.input("REPORTJOB_TYPE", sqlType.VarChar, newImport.type);
      request.input("REPORTJOB_STATUS", sqlType.VarChar, newImport.status);
      request.input("USER_ID", sqlType.VarChar, newImport.user_id);
      request.input("JOB_CODE", sqlType.VarChar, newImport.job_code);

      const datenow = new Date();
      const year = datenow.getFullYear();

      getNextId(year, async (err, data) => {
        if (err !== null) {
          result(err, null);
        } else {
          request.input("REPORTJOB_ID", sqlType.VarChar, data.nextid);
          request.input("CREATED_BY", sqlType.VarChar, newImport.created_by);
          request.input("FLAG", sqlType.VarChar, "0");

          try {
            await sql.query(`
              UPDATE SYS_MT_REPORTJOB
              SET REPORTJOB_STATUS = 'F'
              WHERE REPORTJOB_TYPE = 'SYS003'
                AND REPORTJOB_STATUS = 'W'
            `);

            request.query(
              `INSERT INTO SYS_MT_REPORTJOB 
              (REPORTJOB_ID, REPORTJOB_FROMDATE, REPORTJOB_TODATE, REPORTJOB_REF,
               REPORTJOB_TYPE, REPORTJOB_STATUS,
               CREATED_BY, CREATED_DATE, FLAG, USER_ID, JOB_CODE)
              VALUES 
              (@REPORTJOB_ID, @REPORTJOB_FROMDATE, @REPORTJOB_TODATE, @REPORTJOB_REF,
               @REPORTJOB_TYPE, @REPORTJOB_STATUS,
               @CREATED_BY, GETDATE(), @FLAG, @USER_ID, @JOB_CODE)`,
              (err, res) => {
                if (err) {
                  result(err, null);
                } else {
                  result(null, res);
                }
              }
            );
          } catch (e) {
            result(e, null);
          }
        }
      });
    })
    .catch(function (err) {
      result(err, null);
    });
};

async function getNextId(prefix, result) {
  sql
    .connect()
    .then(async function () {
      try {
        const str = `
          SELECT ISNULL(MAX(REPORTJOB_ID), '${prefix}0000') AS MAXID
          FROM SYS_MT_REPORTJOB
          WHERE REPORTJOB_ID LIKE '${prefix}%'
        `;
        const res = await sql.query(str);
        const maxIdRaw = res.recordset[0].MAXID;
        const maxId = maxIdRaw?.toString();

        let lastNum = parseInt(maxId.slice(-4));
        let newId;

        while (true) {
          lastNum += 1;
          newId = prefix + lastNum.toString().padStart(4, "0");

          const checkQuery = `
            SELECT COUNT(*) AS COUNT
            FROM SYS_MT_REPORTJOB
            WHERE REPORTJOB_ID = '${newId}'
          `;
          const checkRes = await sql.query(checkQuery);
          if (checkRes.recordset[0].COUNT === 0) {
            break;
          }
        }

        result(null, { nextid: newId });
      } catch (err) {
        result(err, null);
      }
    })
    .catch(function (err) {
      result(err, null);
    });
}

module.exports = Reportjob;
