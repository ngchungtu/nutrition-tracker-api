import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import * as err_types from './errLog/index.js'
import { connectToMongo } from './lib/index.js'
import { foodModel } from './models/foodModels.js';

dotenv.config()
const app = express();
app.use(cors())

const PORT = process.env.PORT
const URI = process.env.MONGO

// app.use(express.json({ limit: '50mb' }))
// app.use(express.urlencoded({ extended: true, limit: '50mb' }))

connectToMongo()
app.listen(PORT, () => {
    try {
        connectToMongo()
        console.log(`Connect to DB successfully, port: ${PORT}`);
    } catch (error) {
        console.log(err_types.errLog[500]);
    }
});

// mongoose
//     .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('Connected to DB');
//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     })
//     .catch((err) => {
//         console.log('err', err);
//     });

app.get("/foods", async (req, res) => {
    try {
        let foods = await foodModel.find()
        res.status(200).send(foods)
    } catch (error) {
        console.log(err_types.errLog[500])
        res.status(500).send({ message: 'Cannot get foods list' })
    }
})