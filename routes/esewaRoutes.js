// routes/esewaRoutes.js
import express from "express";
import { createOrder, verifyPayment } from "../controllers/esewaController.js";

const router = express.Router();

router.post("/success", verifyPayment); // POST /success
router.post("/create", createOrder);

export default router;