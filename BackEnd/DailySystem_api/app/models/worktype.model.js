
const sql = require("../db");

const sqlType = require('mssql')

const Worktype = function (model) {
    this.id = model.id;
    this.name = model.name;
};

Worktype.get = result => {

    sql.connect()
        .then(async function () {

            var str = "SELECT WORKTYPE_ID"
            str += ", WORKTYPE_NAME"
            str += " FROM WORKTYPE"

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



module.exports = Worktype;