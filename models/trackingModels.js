import mongoose from 'mongoose';

// const schema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     foodId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Food',
//         required: true
//     },
//     quantity: {
//         type: Number,
//         min: 1,
//         required: true
//     },
// }, { timestamps: true })

// export default mongoose.models.Tracking || mongoose.model("trackings", schema)

const trackingSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foods',
        required: true
    },
    details: {
        calories: Number,
        protein: Number,
        carbohydrates: Number,
        fat: Number,
        fiber: Number,
    },
    eatenDate: {
        type: String,
        default: new Date().toLocaleDateString()
    },
    quantity: {
        type: Number,
        min: 1,
        required: true
    }
}, { timestamps: true })


export const trackingModel = mongoose.model("trackings", trackingSchema);