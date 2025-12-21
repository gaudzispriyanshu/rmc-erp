import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  createOrderController,
  getAllOrdersController
} from "../controllers/orderController";

const router = Router();

router.post("/", authMiddleware, createOrderController);
router.get("/", authMiddleware, getAllOrdersController);

export default router;
