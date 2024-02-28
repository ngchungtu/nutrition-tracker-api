import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import * as err_types from './errLog/index.js'
import { foodModel } from './models/foodModels.js';
import { trackingModel } from './models/trackingModels.js';
import { verifyToken } from './verifyToken.js';
import { isEmptyOrNil } from './common/function.js';
import { connectToMongo } from './lib/index.js'

dotenv.config()
const app = express();
app.use(cors())

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

const PORT = process.env.PORT_DATA

app.listen(PORT, () => {
    try {
        connectToMongo()
        console.log(`Connect to DB successfully, port: ${PORT}`);
    } catch (error) {
        console.log(err_types.errLog[500]);
    }
});

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


app.get("/foods", verifyToken, async (req, res) => {
    try {
        let foods = await foodModel.find()
        res.status(200).send(foods)
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

app.post('/track', verifyToken, async (req, res) => {
    let trackingData = req.body
    // console.log("trackingData", trackingData);
    try {
        let data = await trackingModel.create(trackingData)
        res.status(200).send({ message: 'Create tracking successfully', data })
        // console.log('tracking data', data);
        res.send(data)
    } catch (error) {
        console.log(err_types.errLog[500])
        res.status(500).send({ message: 'Cannot tracking' })
    }
})

app.get('/track/:userid/:date', verifyToken, async (req, res) => {
    let userid = req.params.userid
    let date = new Date(req.params.date);
    // let date2 = new Date(req.params.date).toLocaleDateString();
    let strDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    // console.log('date',strDate);
    try {
        let data = await trackingModel.find({ userId: userid, eatenDate:strDate }).populate('_id').populate('foodId')
        // .then((res)=>{
        //     console.log('res', res);
        // })
        // console.log('data tracking userid', data);
        res.send(data)
    } catch (error) {
        console.log(err_types.errLog[500])
        res.status(500).send({ message: 'Cannot tracking food' })
    }
})