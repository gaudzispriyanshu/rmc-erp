import { Router } from "express";
import {
  getAllCustomersController, getCustomerByIdController, createCustomerController,
  updateCustomerController, deleteCustomerController,
} from "../controllers/customerController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../schemas/common";
import {
  createCustomerSchema, updateCustomerSchema, listCustomersQuerySchema,
} from "../schemas/customerSchemas";

const router = Router();

router.get("/", authenticate, authorize("customers:read"), validate({ query: listCustomersQuerySchema }), getAllCustomersController);
router.get("/:id", authenticate, authorize("customers:read"), validate({ params: idParamSchema }), getCustomerByIdController);
router.post("/", authenticate, authorize("customers:write"), validate({ body: createCustomerSchema }), createCustomerController);
router.put("/:id", authenticate, authorize("customers:update"), validate({ params: idParamSchema, body: updateCustomerSchema }), updateCustomerController);
router.delete("/:id", authenticate, authorize("customers:delete"), validate({ params: idParamSchema }), deleteCustomerController);

export default router;
