const Worktype = require("../models/worktype.model")

exports.getAll = (req, res) => {
  Worktype.get((err, data) => {
        if (err)
          res.send({
            success:false,
            message:
              err.message || "Some error occurred while getting worktypes.",
          });
        else res.send({success:true, data:data});
    });
};
