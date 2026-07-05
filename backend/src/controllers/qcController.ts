import { Request, Response } from "express";
import {
  getCubeTests, createCubeTest, deleteCubeTest,
  getSlumpTests, createSlumpTest, deleteSlumpTest,
  getNonConformances, createNonConformance, updateNonConformance,
} from "../services/qcService";

// ===== cube tests =====

export const getCubeTestsController = async (req: Request, res: Response) => {
  try {
    const order_id = req.query.order_id ? parseInt(req.query.order_id as string) : undefined;
    res.status(200).json(await getCubeTests({ order_id }));
  } catch (err: any) {
    console.error("Get Cube Tests Error:", err.message);
    res.status(500).json({ error: "Failed to fetch cube tests." });
  }
};

export const createCubeTestController = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await createCubeTest(req.body));
  } catch (err: any) {
    console.error("Create Cube Test Error:", err.message);
    res.status(500).json({ error: "Failed to create cube test." });
  }
};

export const deleteCubeTestController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteCubeTest(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Cube test not found" });
    res.status(200).json({ message: "Cube test deleted." });
  } catch (err: any) {
    console.error("Delete Cube Test Error:", err.message);
    res.status(500).json({ error: "Failed to delete cube test." });
  }
};

// ===== slump tests =====

export const getSlumpTestsController = async (req: Request, res: Response) => {
  try {
    const order_id = req.query.order_id ? parseInt(req.query.order_id as string) : undefined;
    res.status(200).json(await getSlumpTests({ order_id }));
  } catch (err: any) {
    console.error("Get Slump Tests Error:", err.message);
    res.status(500).json({ error: "Failed to fetch slump tests." });
  }
};

export const createSlumpTestController = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await createSlumpTest(req.body));
  } catch (err: any) {
    console.error("Create Slump Test Error:", err.message);
    res.status(500).json({ error: "Failed to create slump test." });
  }
};

export const deleteSlumpTestController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteSlumpTest(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Slump test not found" });
    res.status(200).json({ message: "Slump test deleted." });
  } catch (err: any) {
    console.error("Delete Slump Test Error:", err.message);
    res.status(500).json({ error: "Failed to delete slump test." });
  }
};

// ===== non-conformance =====

export const getNonConformancesController = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    res.status(200).json(await getNonConformances({ status }));
  } catch (err: any) {
    console.error("Get Non-Conformances Error:", err.message);
    res.status(500).json({ error: "Failed to fetch non-conformances." });
  }
};

export const createNonConformanceController = async (req: Request, res: Response) => {
  try {
    if (!req.body.description) return res.status(400).json({ error: "description is required." });
    const reported_by = req.user?.userId;
    res.status(201).json(await createNonConformance({ ...req.body, reported_by }));
  } catch (err: any) {
    console.error("Create Non-Conformance Error:", err.message);
    res.status(500).json({ error: "Failed to create non-conformance." });
  }
};

export const updateNonConformanceController = async (req: Request, res: Response) => {
  try {
    const updated = await updateNonConformance(parseInt(req.params.id), req.body);
    if (!updated) return res.status(400).json({ error: "No valid fields to update, or record not found." });
    res.status(200).json(updated);
  } catch (err: any) {
    console.error("Update Non-Conformance Error:", err.message);
    res.status(500).json({ error: "Failed to update non-conformance." });
  }
};
