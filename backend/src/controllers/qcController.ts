import { Request, Response } from "express";
import {
  getCubeTests, createCubeTest, deleteCubeTest,
  getSlumpTests, createSlumpTest, deleteSlumpTest,
  getNonConformances, createNonConformance, updateNonConformance,
} from "../services/qcService";
import { AppError } from "../errors/AppError";

// ===== cube tests =====

export const getCubeTestsController = async (req: Request, res: Response) => {
  const order_id = req.query.order_id ? parseInt(req.query.order_id as string) : undefined;
  res.status(200).json(await getCubeTests({ order_id }));
};

export const createCubeTestController = async (req: Request, res: Response) => {
  res.status(201).json(await createCubeTest(req.body));
};

export const deleteCubeTestController = async (req: Request, res: Response) => {
  const deleted = await deleteCubeTest(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Cube test not found");
  res.status(200).json({ message: "Cube test deleted." });
};

// ===== slump tests =====

export const getSlumpTestsController = async (req: Request, res: Response) => {
  const order_id = req.query.order_id ? parseInt(req.query.order_id as string) : undefined;
  res.status(200).json(await getSlumpTests({ order_id }));
};

export const createSlumpTestController = async (req: Request, res: Response) => {
  res.status(201).json(await createSlumpTest(req.body));
};

export const deleteSlumpTestController = async (req: Request, res: Response) => {
  const deleted = await deleteSlumpTest(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Slump test not found");
  res.status(200).json({ message: "Slump test deleted." });
};

// ===== non-conformance =====

export const getNonConformancesController = async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  res.status(200).json(await getNonConformances({ status }));
};

export const createNonConformanceController = async (req: Request, res: Response) => {
  // reported_by is set from the authenticated user, not the client body.
  const reported_by = req.user?.userId;
  res.status(201).json(await createNonConformance({ ...req.body, reported_by }));
};

export const updateNonConformanceController = async (req: Request, res: Response) => {
  const updated = await updateNonConformance(parseInt(req.params.id), req.body);
  if (!updated) throw new AppError(404, "Non-conformance record not found");
  res.status(200).json(updated);
};
