import mongoose from 'mongoose'

 const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    products: [
        {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            required: true,
        },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['PENDING', 'APPROVED', 'CANCELLED', 'DELIVERED'],
        default: 'pending',
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, { timestamps: true });   

export const Order = mongoose.model('Order', orderSchema);