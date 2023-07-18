const JWT = require('jsonwebtoken')
const createError = require('http-errors')

// ham tao access Token
const signAccessToken = async (userId) =>{
    return new Promise((resolve, reject)=>{
        const payload ={
            userId
        }
        const secret = process.env.secret;
        const options = {
            expiresIn: '10m'
        }
        JWT.sign(payload, secret, options, (err, token)=>{
            if(err) reject(err)
            resolve(token)
        })
    })
}

// Verify accesstoken
// xử lí rõ nỗi đúng ý như hết hạn , ko valid

const verifyAccessToken = (req, res, next) =>{
    if(!req.headers['authorization']){
        return next(createError.Unauthorized())
    }
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    // nos thuoc authorization cua req.header
    JWT.verify(token, process.env.secret, (err,payload)=>{
        if(err){
            if(err.name === 'JsonWebTokenError'){
                return next(createError.Unauthorized()) // co function ()
            }
            return next(createError.Unauthorized(err.message));
            // trả về lỗi rằng  à expired
        }
        req.payload = payload;
        console.log(`day neeeeeeeeeeeeeeeeee ${payload}`)
        next();// ko lỗi thì next
    })
}

// lấy accessToken sau khi hết hạn bằng refreshtoken
// const signRefreshToken = async (userId) =>{
//     return new Promise((resolve, reject)=>{
//         const payload ={
//             userId
//         }
//         const secret = process.env.REFRESH_TOKEN_SECRET;
//         const options = {
//             expiresIn: '1y'
//         }
//         JWT.sign(payload, secret, options, (err, token)=>{
//             if(err) reject(err)
//             // tostring vì userID ddag là Objectid
//             // tajo token thoi han 1 nam
//             client.set(userId.toString(), token, "EX", 365*24*60*60,(err, reply)=>{
//                 if(err){
//                     return reject(createError.InternalServerError())
//                 }
//                 resolve(token)
//             })
            
//         })
//     })
// }

// const verifyRefreshToken = async (refreshToken)=>{
//     return new Promise((resolve,reject)=>{
//         JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,(err, payload)=>{
//             if(err) reject(err)
//             client.get(payload.userId, (err, reply)=>{
//                 // reply la cai tra laji, la RT
//                 if(err) reject(createError.InternalServerError());
//                 // dam bao RT hop le trong redis, con trong redis
//                 if(refreshToken === reply){ // xem no nam trong Db khong
//                     return resolve(payload)
//                 }
//                 return reject(createError.Unauthorized())
//             })
//              //thành công
//         })
//     })
    
// }

module.exports = {
    signAccessToken,
    verifyAccessToken
    // signRefreshToken
    // verifyRefreshToken
}