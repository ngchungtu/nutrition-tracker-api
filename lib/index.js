import mongoose from 'mongoose';
import * as err_types from '../errLog/index.js'

// const API_URL = process.env.MONGO || "mongodb+srv://admin:cRM9OhAQA7JIwSYK@cluster0.jpzvwzk.mongodb.net/nutrition-tracker?retryWrites=true&w=majority"

export const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO)
        console.log('Connect Successfully!');
    } catch (error) {
        console.log(err_types.errLog[404]);
    }
}