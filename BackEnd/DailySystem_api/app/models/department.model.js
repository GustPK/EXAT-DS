
const sql = require("../db");

const sqlType = require('mssql')

const Department = function (model) {
    this.id = model.id;
    this.name = model.name;
};

Department.get = result => {

    sql.connect()
        .then(async function () {

            var str = "SELECT DEPARTMENT_ID"
            str += ", DEPARTMENT_NAME"
            str += " FROM DEPARTMENT"

            sql.query(str, (err, res) => {

                if (err) {
                    result(err, null)
                }
                else {
                    result(null, res.recordset)
                }
            });
        })
        .catch(function (err) {
            result(err, null)
        }
        );
};



module.exports = Department;