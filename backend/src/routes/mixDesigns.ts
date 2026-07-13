import { Router } from "express";
import {
  getAllMixDesignsController, getMixDesignByIdController, createMixDesignController,
  updateMixDesignController, deleteMixDesignController,
  getMixRequirementsController, setMixRequirementsController,
} from "../controllers/mixDesignController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idempotency } from "../middleware/idempotency";
import { idParamSchema } from "../schemas/common";
import {
  createMixDesignSchema, updateMixDesignSchema, setMixRequirementsSchema,
} from "../schemas/mixDesignSchemas";

const router = Router();

router.get("/", authenticate, authorize("mix_designs:read"), getAllMixDesignsController);
router.get("/:id", authenticate, authorize("mix_designs:read"), validate({ params: idParamSchema }), getMixDesignByIdController);
router.get("/:id/requirements", authenticate, authorize("mix_designs:read"), validate({ params: idParamSchema }), getMixRequirementsController);
router.post("/", authenticate, authorize("mix_designs:write"), validate({ body: createMixDesignSchema }), idempotency, createMixDesignController);
router.put("/:id", authenticate, authorize("mix_designs:update"), validate({ params: idParamSchema, body: updateMixDesignSchema }), updateMixDesignController);
router.put("/:id/requirements", authenticate, authorize("mix_designs:update"), validate({ params: idParamSchema, body: setMixRequirementsSchema }), setMixRequirementsController);
router.delete("/:id", authenticate, authorize("mix_designs:delete"), validate({ params: idParamSchema }), deleteMixDesignController);

export default router;
