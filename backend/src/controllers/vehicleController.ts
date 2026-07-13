import { Request, Response } from "express";
import {
  getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle,
} from "../services/vehicleService";
import { AppError } from "../errors/AppError";

// A duplicate plate number surfaces as a unique violation -> 409 via errorHandler.

export const getAllVehiclesController = async (req: Request, res: Response) => {
  const result = await getAllVehicles({
    start: req.query.start ? parseInt(req.query.start as string) : undefined,
    end: req.query.end ? parseInt(req.query.end as string) : undefined,
    search: req.query.search as string | undefined,
    status: req.query.status as string | undefined,
  });
  res.status(200).json(result);
};

export const getVehicleByIdController = async (req: Request, res: Response) => {
  const vehicle = await getVehicleById(parseInt(req.params.id));
  if (!vehicle) throw new AppError(404, "Vehicle not found");
  res.status(200).json(vehicle);
};

export const createVehicleController = async (req: Request, res: Response) => {
  const vehicle = await createVehicle(req.body);
  res.status(201).json(vehicle);
};

export const updateVehicleController = async (req: Request, res: Response) => {
  const updated = await updateVehicle(parseInt(req.params.id), req.body);
  if (!updated) throw new AppError(404, "Vehicle not found");
  res.status(200).json(updated);
};

export const deleteVehicleController = async (req: Request, res: Response) => {
  const deleted = await deleteVehicle(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Vehicle not found");
  res.status(200).json({ message: "Vehicle deleted.", vehicle: deleted });
};
