
const sql = require("../db");

const sqlType = require('mssql')

const Location = function (model) {
    this.id = model.id;
    this.name = model.name;
};

Location.get = result => {

    sql.connect()
        .then(async function () {

            var str = "SELECT LOCATION_ID"
            str += ", LOCATION_NAME"
            str += " FROM LOCATION"

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



module.exports = Location;