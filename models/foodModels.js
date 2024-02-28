import mongoose from 'mongoose';

// const schema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     calories: {
//         type: Number,
//         required: true
//     },
//     protein: {
//         type: Number,
//         required: true
//     },
//     carbonhydrates: {
//         type: Number,
//         required: true,
//     },
//     fat: {
//         type: Number,
//         required: true,
//     },
//     fiber: {
//         type: Number,
//         required: true,
//     },
//     imgUrl: {
//         type: String,
//         required: true,
//     }
// }, { timestamps: true })

// export default mongoose.models.FoodModel || mongoose.model("foods", schema)

const foodSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    calories: {
        type: Number,
        required: true
    },
    protein: {
        type: Number,
        required: true
    },
    carbonhydrates: {
        type: Number,
        required: true,
    },
    fat: {
        type: Number,
        required: true,
    },
    fiber: {
        type: Number,
        required: true,
    },
    imgUrl: {
        type: String,
        required: false,
    }

}, { timestamps: true })


export const foodModel = mongoose.model("foods", foodSchema)