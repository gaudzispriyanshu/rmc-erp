import { Request, Response } from "express";
import {
  getLookupByEntity, checkBatchPermissions, LookupFilters, LookupItem,
} from "../services/lookupService";
import { ALLOWED_LOOKUP_ENTITIES } from "../schemas/lookupSchemas";

export const getSingleLookupController = async (req: Request, res: Response) => {
  try {
    const { entity } = req.params;
    const filters: LookupFilters = req.query;

    const items = await getLookupByEntity(entity, filters);
    return res.json(items);
  } catch (err) {
    console.error("Single Lookup Error:", err);
    return res.status(500).json({ error: "Internal server error fetching lookup data." });
  }
};

export const getBatchLookupsController = async (req: Request, res: Response) => {
  try {
    const { types: rawTypes, ...filters } = req.query;

    let requestedTypes: string[] = [];
    if (typeof rawTypes === "string" && rawTypes.trim().length > 0) {
      requestedTypes = rawTypes
        .split(",")
        .map((t) => t.trim())
        .filter((t) => (ALLOWED_LOOKUP_ENTITIES as readonly string[]).includes(t));
    } else {
      requestedTypes = [...ALLOWED_LOOKUP_ENTITIES];
    }

    const roleId = req.user?.roleId;
    const { allowed, forbidden } = roleId
      ? await checkBatchPermissions(roleId, requestedTypes)
      : { allowed: requestedTypes, forbidden: [] };

    const data: Record<string, LookupItem[]> = {};
    for (const entity of allowed) {
      data[entity] = await getLookupByEntity(entity, filters);
    }

    return res.json({ data, forbidden });
  } catch (err) {
    console.error("Batch Lookup Error:", err);
    return res.status(500).json({ error: "Internal server error fetching batch lookup data." });
  }
};
