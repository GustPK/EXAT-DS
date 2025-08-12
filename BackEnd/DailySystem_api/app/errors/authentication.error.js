class AuthenticationError extends Error {
    constructor(message) {
        super(message)
        this.status_code = 401
        this.name = "AuthenticationError"
    }
    setPasswordNotCorrectError() {
        this.message = 'รหัสผ่านไม่ถูกต้อง'
    }
    setSSOUserIncorrectError() {
        this.message = 'รหัสผู้ใช้ไม่มีในระบบ'
    }
    setSSOPasswordIncorrectError() {
        this.message = 'รหัสผ่านไม่ถูกต้อง'
    }
    setSSOUserUnauthorizedError() {
        this.message = 'ไม่มีสิทธิ์เข้าใช้ระบบงาน'
    }
    setSSOUserSuspendError() {
        this.message = 'บัญชีผู้ใช้ถูกระงับการเข้าใช้งานชั่วคราวเนื่องจากใส่รหัสไม่ถูกต้อง'
    }
    setSSOPasswordExpiredError() {
        this.message = 'รหัสผ่านหมดอายุ'
    }
}
module.exports = AuthenticationError
