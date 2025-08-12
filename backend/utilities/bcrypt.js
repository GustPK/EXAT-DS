

const jwt = require('jsonwebtoken')
const moment = require('moment')
const base64url = require('base64url')
const MessageModel = require('../models/message.model')
const DASH_YMDHMS = 'YYYYMMDD@MMDY'
const key = 'testAABB'
const fix = 'CASE1@@###'

exports.doGetToken = function(user, pwd) {

    try{        

        if(user == 'e-welfare' && pwd == 'Exat2023'){
            var tmp = moment().format(DASH_YMDHMS)
            var tokenEncode = base64url.encode(tmp, 'utf8')
            var playload = {
                name:user,
                occpation:'develop',
                version:1.0,
                verify:tokenEncode + fix   
            }

            var token = jwt.sign(playload, key);  
            return new MessageModel(1, token) 
        }
        else{
            return new MessageModel(2, 'Username or Password is incorrect.')
        }
    }
    catch(error){
        return new MessageModel(0, error)
    }
};


exports.doValidateToken = function(token) {    
    try{        
        var playload = jwt.verify(token, key)
        var tmp = moment().format(DASH_YMDHMS)
        var verify = playload.verify

        verify = verify.toString().replace(fix, '')
        const tokenDecrypt = base64url.decode(verify, 'utf8')
                  
        if(tmp == tokenDecrypt){
            return new MessageModel(1, 'Success')
        }
        else{
            return new MessageModel(2, 'Failed to authenticate token.')
        }        
    }
    catch(error){
        return new MessageModel(0, error)
    }
};

