const Department = require("../models/department.model")

exports.getAll = (req, res) => {
  Department.get((err, data) => {
        if (err)
          res.send({
            success:false,
            message:
              err.message || "Some error occurred while getting department.",
          });
        else res.send({success:true, data:data});
    });
};
