import { Router } from "express";
import {
  getAllMixDesignsController, getMixDesignByIdController, createMixDesignController,
  updateMixDesignController, deleteMixDesignController,
  getMixRequirementsController, setMixRequirementsController,
} from "../controllers/mixDesignController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, authorize("mix_designs:read"), getAllMixDesignsController);
router.get("/:id", authenticate, authorize("mix_designs:read"), getMixDesignByIdController);
router.get("/:id/requirements", authenticate, authorize("mix_designs:read"), getMixRequirementsController);
router.post("/", authenticate, authorize("mix_designs:write"), createMixDesignController);
router.put("/:id", authenticate, authorize("mix_designs:update"), updateMixDesignController);
router.put("/:id/requirements", authenticate, authorize("mix_designs:update"), setMixRequirementsController);
router.delete("/:id", authenticate, authorize("mix_designs:delete"), deleteMixDesignController);

export default router;
