import { Request, Response } from "express";
import {
  getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle,
} from "../services/vehicleService";

export const getAllVehiclesController = async (req: Request, res: Response) => {
  try {
    const result = await getAllVehicles({
      start: req.query.start ? parseInt(req.query.start as string) : undefined,
      end: req.query.end ? parseInt(req.query.end as string) : undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Get Vehicles Error:", err.message);
    res.status(500).json({ error: "Failed to fetch vehicles." });
  }
};

export const getVehicleByIdController = async (req: Request, res: Response) => {
  try {
    const vehicle = await getVehicleById(parseInt(req.params.id));
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (err: any) {
    console.error("Get Vehicle Error:", err.message);
    res.status(500).json({ error: "Failed to fetch vehicle." });
  }
};

export const createVehicleController = async (req: Request, res: Response) => {
  try {
    const vehicle = await createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (err: any) {
    console.error("Create Vehicle Error:", err.message);
    if (err.code === "23505") return res.status(409).json({ error: "A vehicle with this plate number already exists." });
    res.status(500).json({ error: "Failed to create vehicle." });
  }
};

export const updateVehicleController = async (req: Request, res: Response) => {
  try {
    const updated = await updateVehicle(parseInt(req.params.id), req.body);
    if (!updated) return res.status(400).json({ error: "No valid fields to update, or vehicle not found." });
    res.status(200).json(updated);
  } catch (err: any) {
    console.error("Update Vehicle Error:", err.message);
    res.status(500).json({ error: "Failed to update vehicle." });
  }
};

export const deleteVehicleController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteVehicle(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Vehicle not found" });
    res.status(200).json({ message: "Vehicle deleted.", vehicle: deleted });
  } catch (err: any) {
    console.error("Delete Vehicle Error:", err.message);
    res.status(500).json({ error: "Failed to delete vehicle." });
  }
};
