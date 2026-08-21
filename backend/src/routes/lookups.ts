import { Router } from "express";
import {
  getSingleLookupController, getBatchLookupsController,
} from "../controllers/lookupController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  lookupEntityParamSchema, lookupQuerySchema,
} from "../schemas/lookupSchemas";
import { getPermissionsForEntity } from "../services/lookupService";
import { Request, Response, NextFunction } from "express";

const router = Router();

// Dynamic authorize wrapper — resolves permission slugs from LOOKUP_CONFIG at request time
const authorizeLookup = (req: Request, res: Response, next: NextFunction) => {
  const entity = req.params.entity;
  const permissions = getPermissionsForEntity(entity);
  if (permissions.length === 0) return next();
  return authorize(permissions)(req, res, next);
};

// Batch lookups: GET /api/lookups?types=customers,vehicles,mix-designs
// Permission is checked per-entity inside the controller (partial success pattern)
router.get("/", authenticate, validate({ query: lookupQuerySchema }), getBatchLookupsController);

// Single/Cascading lookup: GET /api/lookups/:entity?customer_id=1
router.get("/:entity", authenticate, authorizeLookup, validate({ params: lookupEntityParamSchema, query: lookupQuerySchema }), getSingleLookupController);

export default router;
