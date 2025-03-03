import express from "express";
const router = express.Router();

import { deleteById, findAll, findById, save, update } from "../controllers/SubscriptionController.js";

router.get("/", findAll);

router.post("/", save);

router.get("/:userId", findById);

router.delete("/:id", deleteById);

router.put("/:id", update);



export default router;