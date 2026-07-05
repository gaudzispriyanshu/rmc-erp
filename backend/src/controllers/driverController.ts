import { Request, Response } from "express";
import {
  getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver,
} from "../services/driverService";

export const getAllDriversController = async (req: Request, res: Response) => {
  try {
    const result = await getAllDrivers({
      start: req.query.start ? parseInt(req.query.start as string) : undefined,
      end: req.query.end ? parseInt(req.query.end as string) : undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Get Drivers Error:", err.message);
    res.status(500).json({ error: "Failed to fetch drivers." });
  }
};

export const getDriverByIdController = async (req: Request, res: Response) => {
  try {
    const driver = await getDriverById(parseInt(req.params.id));
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.status(200).json(driver);
  } catch (err: any) {
    console.error("Get Driver Error:", err.message);
    res.status(500).json({ error: "Failed to fetch driver." });
  }
};

export const createDriverController = async (req: Request, res: Response) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: "Name is required." });
    const driver = await createDriver(req.body);
    res.status(201).json(driver);
  } catch (err: any) {
    console.error("Create Driver Error:", err.message);
    res.status(500).json({ error: "Failed to create driver." });
  }
};

export const updateDriverController = async (req: Request, res: Response) => {
  try {
    const updated = await updateDriver(parseInt(req.params.id), req.body);
    if (!updated) return res.status(400).json({ error: "No valid fields to update, or driver not found." });
    res.status(200).json(updated);
  } catch (err: any) {
    console.error("Update Driver Error:", err.message);
    res.status(500).json({ error: "Failed to update driver." });
  }
};

export const deleteDriverController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteDriver(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Driver not found" });
    res.status(200).json({ message: "Driver deleted.", driver: deleted });
  } catch (err: any) {
    console.error("Delete Driver Error:", err.message);
    res.status(500).json({ error: "Failed to delete driver." });
  }
};
