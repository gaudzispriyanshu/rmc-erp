import { Request, Response } from "express";
import {
  getAllMixDesigns, getMixDesignById, createMixDesign, updateMixDesign, deleteMixDesign,
  getMixRequirements, setMixRequirements,
} from "../services/mixDesignService";

export const getAllMixDesignsController = async (_req: Request, res: Response) => {
  try {
    res.status(200).json(await getAllMixDesigns());
  } catch (err: any) {
    console.error("Get Mix Designs Error:", err.message);
    res.status(500).json({ error: "Failed to fetch mix designs." });
  }
};

export const getMixDesignByIdController = async (req: Request, res: Response) => {
  try {
    const mix = await getMixDesignById(parseInt(req.params.id));
    if (!mix) return res.status(404).json({ error: "Mix design not found" });
    const requirements = await getMixRequirements(mix.id);
    res.status(200).json({ ...mix, requirements });
  } catch (err: any) {
    console.error("Get Mix Design Error:", err.message);
    res.status(500).json({ error: "Failed to fetch mix design." });
  }
};

export const createMixDesignController = async (req: Request, res: Response) => {
  try {
    if (!req.body.grade_name) return res.status(400).json({ error: "grade_name is required." });
    res.status(201).json(await createMixDesign(req.body));
  } catch (err: any) {
    console.error("Create Mix Design Error:", err.message);
    if (err.code === "23505") return res.status(409).json({ error: "A mix design with this grade name already exists." });
    res.status(500).json({ error: "Failed to create mix design." });
  }
};

export const updateMixDesignController = async (req: Request, res: Response) => {
  try {
    const updated = await updateMixDesign(parseInt(req.params.id), req.body);
    if (!updated) return res.status(400).json({ error: "No valid fields to update, or mix design not found." });
    res.status(200).json(updated);
  } catch (err: any) {
    console.error("Update Mix Design Error:", err.message);
    res.status(500).json({ error: "Failed to update mix design." });
  }
};

export const deleteMixDesignController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteMixDesign(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Mix design not found" });
    res.status(200).json({ message: "Mix design deleted.", mixDesign: deleted });
  } catch (err: any) {
    console.error("Delete Mix Design Error:", err.message);
    res.status(500).json({ error: "Failed to delete mix design." });
  }
};

export const getMixRequirementsController = async (req: Request, res: Response) => {
  try {
    res.status(200).json(await getMixRequirements(parseInt(req.params.id)));
  } catch (err: any) {
    console.error("Get Mix Requirements Error:", err.message);
    res.status(500).json({ error: "Failed to fetch mix requirements." });
  }
};

export const setMixRequirementsController = async (req: Request, res: Response) => {
  try {
    const { requirements } = req.body;
    if (!Array.isArray(requirements)) {
      return res.status(400).json({ error: "requirements must be an array." });
    }
    res.status(200).json(await setMixRequirements(parseInt(req.params.id), requirements));
  } catch (err: any) {
    console.error("Set Mix Requirements Error:", err.message);
    res.status(500).json({ error: "Failed to set mix requirements." });
  }
};
