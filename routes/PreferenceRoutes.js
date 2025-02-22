import express from "express";
import { deleteById, findAll, findById, save, update } from "../controllers/PreferenceController.js";
const router = express.Router();

router.post("/", save);
router.get("/", findAll);
router.get("/:id", findById);
router.delete("/:id", deleteById);
router.put("/:id", update);

export default router;