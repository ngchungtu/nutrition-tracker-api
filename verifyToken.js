import jwt from 'jsonwebtoken';
import { isEmptyOrNil } from "./common/function.js";
import * as err_types from './errLog/index.js'

export function verifyToken(req, res, next) {
    if (!isEmptyOrNil(req.headers.authorization)) {
        // console.log("user token: ", req.headers.authorization.split(" ")[1]);
        // res.send({ message: 'Token user has been loged in' })
        let token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, result) => {
            if (!err) {
                next()
            } else {
                console.log(err_types.errLog[403]);
                res.status(403).send({ message: "Token invalid" })
            }
        })
    } else {
        console.log(err_types.errLog[401]);
        res.send({ message: 'Please send a token' })
    }
}