import { Router } from "express";
import {
  getDispatchBoardController, getAllChallansController, getChallanByIdController, createChallanController,
} from "../controllers/challanController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Static routes FIRST
router.get("/board", authenticate, authorize("dispatch:read"), getDispatchBoardController);

router.get("/challans", authenticate, authorize("dispatch:read"), getAllChallansController);
router.get("/challans/:id", authenticate, authorize("dispatch:read"), getChallanByIdController);
router.post("/challans", authenticate, authorize("dispatch:write"), createChallanController);

export default router;
