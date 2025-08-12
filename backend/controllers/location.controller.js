const Location = require("../models/location.model")

exports.getAll = (req, res) => {
  Location.get((err, data) => {
        if (err)
          res.send({
            success:false,
            message:
              err.message || "Some error occurred while getting locations.",
          });
        else res.send({success:true, data:data});
    });
};
