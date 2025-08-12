  const mysql = require("mssql");
  const dbConfig = require("./configs/mssql.config");

  // Create a connection to the database

  const config = {
    user: dbConfig.USER,
    password: dbConfig.PASSSWORD,
    server: dbConfig.SERVER,
    database: dbConfig.DATABASE,
    options: {
      encrypt: false // please add this for ms sql
    }
  };

  const sqlConn = new mysql.ConnectionPool(config);

  // sqlConn.connect()
  //   .then(async function () {
  //     console.log("Connected to SQL Server");

  //       //let result = await sqlConn.query('SELECT * FROM WEL_TRX_BENEFIT')  // subject is my database table name

  //   //console.log(result )

  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   }
  // );
  
module.exports = sqlConn