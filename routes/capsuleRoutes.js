import express from "express";
import {
  getCapsulesController,
  getCapsuleByIdController,
  createCapsuleController,
  updateCapsuleController,
  deleteCapsuleController,
} from "../controllers/capsuleController.js";
import validateCapsule from "../middlewares/validateCapsule.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateUser, getCapsulesController);
router.get("/:id", authenticateUser, getCapsuleByIdController);
router.post("/", authenticateUser, validateCapsule, createCapsuleController);
router.put("/:id", authenticateUser, validateCapsule, updateCapsuleController);
router.delete("/:id", authenticateUser, deleteCapsuleController);

export default router;
