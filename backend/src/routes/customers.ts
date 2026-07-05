import { Router } from "express";
import {
  getAllCustomersController, getCustomerByIdController, createCustomerController,
  updateCustomerController, deleteCustomerController,
} from "../controllers/customerController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, authorize("customers:read"), getAllCustomersController);
router.get("/:id", authenticate, authorize("customers:read"), getCustomerByIdController);
router.post("/", authenticate, authorize("customers:write"), createCustomerController);
router.put("/:id", authenticate, authorize("customers:update"), updateCustomerController);
router.delete("/:id", authenticate, authorize("customers:delete"), deleteCustomerController);

export default router;
