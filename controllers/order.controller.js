import express from 'express';
import {Order} from '../models/order.model.js';
const app=express();

app.use(express.json())
app.use(express.urlencoded({ extended: true })); 

export const createOrder = async (req, res) => {
    try {
        const { userId, products, totalAmount, orderStatus } = req.body;
        if (!userId || !products || !totalAmount || !orderStatus) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const order = new Order({
            userId,
            products,
            totalAmount,
            orderStatus,
        });

        const savedOrder = await order.save();
        console.log("Order saved:", savedOrder);
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}