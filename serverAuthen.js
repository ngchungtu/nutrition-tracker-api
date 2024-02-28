import express from 'express';
import { userModel } from './models/userModels.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as err_types from './errLog/index.js'
import dotenv from 'dotenv';
import cors from 'cors';
import { connectToMongo } from './lib/index.js'

const app = express();
app.use(cors())
dotenv.config()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

const PORT = process.env.PORT_AUTHEN

app.listen(PORT, () => {
    try {
        connectToMongo()
        console.log(`Connect to DB successfully, port: ${PORT}`);
    } catch (error) {
        console.log(err_types.errLog[500]);
    }
});

let refeshTokens = []

app.post('/register', (req, res) => {
    // const newToday = moment(new Date()).format('DD/MM/YYYY, h:mm:ss a')
    let user = req.body

    bcrypt.genSalt(10, (err, salt) => {
        if (!err) {
            bcrypt.hash(user.password, salt, async (err, hpass) => {
                if (!err) {
                    user.password = hpass;
                    try {
                        await userModel.create(user)
                        res.status(201).send({ message: "Regist Successfully" })
                    } catch (error) {
                        console.log(err_types.errLog[408]);
                        res.status(500).send({ message: "Some error..." })
                    }
                }
            })
        }
    })
})

/* #region  func access, refesh token */
// const accessToken = (data) => {
//     const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_KEY, { expiresIn: "60s" }, (err, token) => {
//         if (!err) {
//             console.log('user token', token);
//         }
//     })
//     return accessToken
// }

// const refreshToken = (data) => {
//     const refeshToken = jwt.sign(data, { expiresIn: "120s" })
//     return refeshToken
// }

/* #endregion */

app.post("/refeshToken", (req, res) => {
    const refeshToken = req.body.token
    if (!refeshToken) res.status(401) // kiểm tra có token được truyền lên từ client hay không
    if (!refeshTokens.includes(refeshToken)) res.status(403) // kiểm tra token có trong array refeshTokens hay không

    jwt.verify(refeshToken, process.env.REFRESH_TOKEN_KEY, (err, result) => {
        if (!err) {
            const newAccessToken = jwt.sign({ email: result.email }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "2h" })
            res.status(200).json({ newAccessToken })
        } else {
            console.log(err_types.errLog[403]);
            res.status(403).send({ message: "Token invalid" })
        }
    })
})

app.post('/login', async (req, res) => {
    let userCred = req.body
    // console.log(userCred);
    try {
        const user = await userModel.findOne({ email: userCred.email })
        if (user !== null) {
            bcrypt.compare(userCred.password, user.password, (err, success) => {
                if (success == true) {
                    // jwt.sign({ email: userCred.email }, "nutrifyapp", { expiresIn: '30s' }, (err, token) => {
                    //     if (!err) {
                    //         res.send({ message: 'Login successful', token: token })
                    //     }
                    // })

                    // accessToken({ email: userCred.email })

                    const accessToken = jwt.sign({ email: userCred.email }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "1h" })
                    const refeshToken = jwt.sign({ email: userCred.email }, process.env.REFRESH_TOKEN_KEY)
                    refeshTokens.push(refeshToken)
                    const userArr = new Array();
                    userArr.push(user)
                    // console.log('user', user);
                    const newUserData = userArr.map((i) => {
                        const data = {
                            name: i.name,
                            id: i._id,
                            email: i.email,
                            accessToken,
                            refeshToken
                        }
                        // console.log('user login', data);
                        return data
                    })
                    res.status(200).json({ ...newUserData[0] })
                } else {
                    console.log(err_types.errLog[403]);
                    res.status(403).send({ message: 'Incorrect password' })
                }
            })
        } else {
            console.log(err_types.errLog[404]);
            res.status(404).send({ message: 'Cannot find User' })
        }
    } catch (error) {
        console.log(err_types.errLog[404]);
        res.status(500).send({ message: 'Cannot Login' })
    }
})

app.post('/logout', (req, res) => {
    const refreshToken = req.body.token
    refeshTokens = refeshTokens.filter(refToken => refToken !== refreshToken)
    res.status(200).send({ message: "Success logout" })
})