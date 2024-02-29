import express from 'express';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import * as err_types from './errLog/index.js'
import { connectToMongo } from './lib/index.js'
import { foodModel } from './models/foodModels.js';

dotenv.config()
const app = express();
app.use(cors())

// const API_URL = process.env.MONGO
const PORT = process.env.PORT

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
/* #region  func connection to MongoDB */
// const connectToMongo = async () => {
//     try {
//         await mongoose.connect(API_URL)
//         console.log('Connect Successfully!');
//     } catch (error) {
//         console.log(err_types.errLog[404]);
//     }
// }
/* #endregion */
connectToMongo()
// app.listen(PORT, () => {
//     try {
//         connectToMongo()
//         console.log(`Connect to DB successfully, port: ${PORT}`);
//     } catch (error) {
//         console.log(err_types.errLog[500]);
//     }
// });

app.get("/foods", async (req, res) => {
    try {
        let foods = await foodModel.find()
        res.status(200).send(foods)
    } catch (error) {
        console.log(err_types.errLog[500])
        res.status(500).send({ message: 'Cannot get foods list' })
    }
})