import { Request, Response } from "express";
import {
  getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver,
} from "../services/driverService";
import { AppError } from "../errors/AppError";

// A duplicate license number surfaces as a unique violation -> 409 via errorHandler.

export const getAllDriversController = async (req: Request, res: Response) => {
  const result = await getAllDrivers({
    start: req.query.start ? parseInt(req.query.start as string) : undefined,
    end: req.query.end ? parseInt(req.query.end as string) : undefined,
    search: req.query.search as string | undefined,
    status: req.query.status as string | undefined,
  });
  res.status(200).json(result);
};

export const getDriverByIdController = async (req: Request, res: Response) => {
  const driver = await getDriverById(parseInt(req.params.id));
  if (!driver) throw new AppError(404, "Driver not found");
  res.status(200).json(driver);
};

export const createDriverController = async (req: Request, res: Response) => {
  const driver = await createDriver(req.body);
  res.status(201).json(driver);
};

export const updateDriverController = async (req: Request, res: Response) => {
  const updated = await updateDriver(parseInt(req.params.id), req.body);
  if (!updated) throw new AppError(404, "Driver not found");
  res.status(200).json(updated);
};

export const deleteDriverController = async (req: Request, res: Response) => {
  const deleted = await deleteDriver(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Driver not found");
  res.status(200).json({ message: "Driver deleted.", driver: deleted });
};
