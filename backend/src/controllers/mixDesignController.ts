import { Request, Response } from "express";
import {
  getAllMixDesigns, getMixDesignById, createMixDesign, updateMixDesign, deleteMixDesign,
  getMixRequirements, setMixRequirements,
} from "../services/mixDesignService";
import { AppError } from "../errors/AppError";

// A duplicate grade_name surfaces as a unique violation -> 409 via errorHandler.

export const getAllMixDesignsController = async (_req: Request, res: Response) => {
  res.status(200).json(await getAllMixDesigns());
};

export const getMixDesignByIdController = async (req: Request, res: Response) => {
  const mix = await getMixDesignById(parseInt(req.params.id));
  if (!mix) throw new AppError(404, "Mix design not found");
  const requirements = await getMixRequirements(mix.id);
  res.status(200).json({ ...mix, requirements });
};

export const createMixDesignController = async (req: Request, res: Response) => {
  res.status(201).json(await createMixDesign(req.body));
};

export const updateMixDesignController = async (req: Request, res: Response) => {
  const updated = await updateMixDesign(parseInt(req.params.id), req.body);
  if (!updated) throw new AppError(404, "Mix design not found");
  res.status(200).json(updated);
};

export const deleteMixDesignController = async (req: Request, res: Response) => {
  const deleted = await deleteMixDesign(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Mix design not found");
  res.status(200).json({ message: "Mix design deleted.", mixDesign: deleted });
};

export const getMixRequirementsController = async (req: Request, res: Response) => {
  res.status(200).json(await getMixRequirements(parseInt(req.params.id)));
};

export const setMixRequirementsController = async (req: Request, res: Response) => {
  const { requirements } = req.body;
  res.status(200).json(await setMixRequirements(parseInt(req.params.id), requirements));
};
