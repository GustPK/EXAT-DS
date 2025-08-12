const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const xss = require('xss-clean');
const moment = require('moment-timezone');
const helmet = require('helmet');
const router = express.Router()
const app = express();

const user = require('./routes/user.routes')
const worklog = require('./routes/worklog.routes')
const location = require('./routes/location.routes')
const department = require('./routes/department.routes')
const reportjob = require('./routes/reportjob.routes')
const worktype = require('./routes/worktype.routes')


//-- Config
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(xss());
// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
moment.tz.setDefault('Asia/Bangkok')

// Route for home page
app.get("/home", (req, res) => {
  res.json({ message: "!! RANDOM API" });
});


app.listen(4000, () => {
  console.log("Server is running on port 4000.");
});

app.use(user)
app.use(worklog)
app.use(location)
app.use(department)
app.use(reportjob)
app.use(worktype)
