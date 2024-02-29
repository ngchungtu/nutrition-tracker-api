import express from 'express';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import * as err_types from './errLog/index.js'
import { connectToMongo } from './lib/index.js'
import { foodModel } from './models/foodModels.js';
import { verifyToken } from './verifyToken.js';
import { trackingModel } from './models/trackingModels.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from './models/userModels.js';

dotenv.config()
const app = express();
app.use(cors())

const cors = require('cors');
const corsOptions ={
    origin:'https://nutrition-tracking.vercel.app', 
    credentials:true,
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

const PORT = process.env.PORT
let refeshTokens = []

app.use(express.json({ limit: '350mb' })) // giới hạn dữ liệu truyền lên

app.use(express.urlencoded({ extended: true, limit: '350mb' })) 
//Nó mang ý nghĩa là một đối tượng body chứa dữ liệu mà đã được parsed sẽ được đưa vào request (có thể hiểu là req.body). Dữ liệu đó là một cặp key-value, trong đó value có thể là array hoặc string nếu extended: false và các loại còn lại nếu extended: true.

connectToMongo()
app.listen(PORT, () => {
    try {
        connectToMongo()
        console.log(`Connect to DB successfully, port: ${PORT}`);
    } catch (error) {
        console.log(err_types.errLog[500]);
    }
});

/* #region  food API */
app.get("/foods", verifyToken, async (req, res) => {
    try {
        let foods = await foodModel.find()
        res.status(200).send(foods)
    } catch (error) {
        console.log(err_types.errLog[500])
        res.status(500).send({ message: 'Cannot get foods list' })
    }
})

app.post("/foods", verifyToken, async (req, res) => {
    let food = req.body
    try {
        let foods = await foodModel.create(food)
        res.status(200).send({ message: 'Create food successfully', foods })
    } catch (error) {
        console.log(err_types.errLog[500])
        res.status(500).send({ message: 'Cannot get foods list' })
    }
})

app.get("/foods/:name", verifyToken, async (req, res) => {
    try {
        // let food = await FoodModel.find({ name: req.params.name }) //tìm chi tiết đúng tên
        let food = await foodModel.find({ name: { $regex: req.params.name, $options: "i" } }) // tìm item có cùng tên, $options: "i" - giúp tìm đúng tên ko phân biệt viết hoa hay thường
        if (!isEmptyOrNil(food) && food.length !== 0) {
            res.status(200).send({ message: 'Food found', food })
        } else {
            console.log(err_types.errLog[404]);
            res.status(404).send({ message: "Food not found" })
        }
    } catch (error) {
        console.log(err_types.errLog[500]);
        res.status(500).send({ message: 'Cannot find food' })
    }
})
/* #endregion */

/* #region  track API */
app.post('/track', verifyToken, async (req, res) => {
    let trackingData = req.body
    try {
        let data = await trackingModel.create(trackingData)
        res.status(200).send({ message: 'Create tracking successfully', data })
        res.send(data)
    } catch (error) {
        console.log(err_types.errLog[500])
        res.status(500).send({ message: 'Cannot tracking' })
    }
})

app.get('/track/:userid/:date', verifyToken, async (req, res) => {
    let userid = req.params.userid
    let date = new Date(req.params.date);
    let strDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    try {
        let data = await trackingModel.find({ userId: userid, eatenDate: strDate }).populate('_id').populate('foodId')
        res.send(data)
    } catch (error) {
        console.log(err_types.errLog[500])
        res.status(500).send({ message: 'Cannot tracking food' })
    }
})
/* #endregion */

/* #region  user login */
app.post('/register',  async (req, res) => {
    let user = req.body
    console.log('user', user);
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
    console.log(userCred);
    try {
        const user = await userModel.findOne({ email: userCred.email })
        if (user !== null) {
            bcrypt.compare(userCred.password, user.password, (err, success) => {
                if (success == true) {

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
/* #endregion */