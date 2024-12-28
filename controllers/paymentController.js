import stripe from "../config/stripe.js";
import express from "express";
const app = express();

app.use(express.json());

app.post("/payment", async (req, res) => {
    const { amount } = req.body;
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "inr",
      });
  
      res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });