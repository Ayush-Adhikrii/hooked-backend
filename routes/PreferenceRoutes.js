import express from "express";
import { deleteById, findAll, findPreferenceByUserId, save, updatePreferenceByUserId } from "../controllers/PreferenceController.js";
const router = express.Router();

router.post("/", save);
router.get("/", findAll);
router.get("/:id", findPreferenceByUserId);
router.delete("/:id", deleteById);
router.put("/:id", updatePreferenceByUserId);

export default router;