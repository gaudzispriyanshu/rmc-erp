import { Router } from "express";
import {
  getDispatchBoardController, getAllChallansController, getChallanByIdController, createChallanController,
} from "../controllers/challanController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../schemas/common";
import { createChallanSchema, listChallansQuerySchema } from "../schemas/challanSchemas";

const router = Router();

// Static routes FIRST
router.get("/board", authenticate, authorize("dispatch:read"), getDispatchBoardController);

router.get("/challans", authenticate, authorize("dispatch:read"), validate({ query: listChallansQuerySchema }), getAllChallansController);
router.get("/challans/:id", authenticate, authorize("dispatch:read"), validate({ params: idParamSchema }), getChallanByIdController);
router.post("/challans", authenticate, authorize("dispatch:write"), validate({ body: createChallanSchema }), createChallanController);

export default router;
