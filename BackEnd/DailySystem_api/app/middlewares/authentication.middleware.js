const base64url = require('base64url');
const { AuthenticationError  } = require('../errors/authentication.error');
const bcrypt = require("../utilities/bcrypt");
const jwt = require('jsonwebtoken');


const authenBasic = async (req, res, next) => {
    try {

        const { headers } = req;
        if (!headers) throw new Error("Failed to authenticate token.");

        const { authorization } = req.headers;
        if (!authorization) throw new Error("Failed to authenticate token.");
        if (!authorization.startsWith('Bearer ')) throw new Error("Failed to authenticate token.");

        const token = authorization.substring(7);
        // ลองตรวจสอบ JWT แบบมาตรฐานก่อน
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Exat2023');
            req.user = decoded; // แนบ user info จาก token
            return next();
        } catch (jwtErr) {
            // ถ้าไม่ใช่ JWT ปกติ ให้ fallback ไปใช้ bcrypt.doValidateToken แบบเดิม
            const verify = bcrypt.doValidateToken(token);
            if (verify.status_code !== 1) throw new Error("Failed to authenticate token.");
            return next();
        }
    } catch (error) {
        res.status(401).send({
            success: false,
            message: error.message || "Failed to authenticate token."
        });
    }
}

module.exports = authenBasic
