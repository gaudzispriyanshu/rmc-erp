import { Request, Response } from "express";
import { createTrip, getAllTrips, getTripById, updateTrip, deleteTrip, changeTripStatus, getTripUpdates } from "../services/tripService";
import { AppError } from "../errors/AppError";

export const createTripController = async (req: Request, res: Response) => {
    const { order_id, vehicle_id, driver_id, status, eta, started_at, completed_at, volume_delivered, fuel_cost_estimate } = req.body;
    // Default the assigner to the authenticated user when the client doesn't send one.
    const assigned_by = req.body.assigned_by ?? req.user?.userId;
    const trip = await createTrip({
        order_id, vehicle_id, driver_id, assigned_by, status, eta, started_at, completed_at, volume_delivered, fuel_cost_estimate
    });
    res.status(201).json(trip);
};

export const getAllTripController = async (req: Request, res: Response) => {
    const filters = {
        start: req.query.start ? parseInt(req.query.start as string) : undefined,
        end: req.query.end ? parseInt(req.query.end as string) : undefined,
        status: req.query.status as string | undefined,
        order_id: req.query.order_id ? parseInt(req.query.order_id as string) : undefined,
        vehicle_id: req.query.vehicle_id ? parseInt(req.query.vehicle_id as string) : undefined,
        driver_id: req.query.driver_id ? parseInt(req.query.driver_id as string) : undefined,
        assigned_by: req.query.assigned_by ? parseInt(req.query.assigned_by as string) : undefined,
        started_at: req.query.started_at as Date | undefined,
        completed_at: req.query.completed_at as Date | undefined,
    };
    res.status(200).json(await getAllTrips(filters));
};

export const getTripByIdController = async (req: Request, res: Response) => {
    const trip = await getTripById(parseInt(req.params.id));
    if (!trip) throw new AppError(404, "Trip not found");
    res.status(200).json(trip);
};

export const updateTripController = async (req: Request, res: Response) => {
    const updated = await updateTrip(parseInt(req.params.id), req.body);
    if (!updated) throw new AppError(404, "Trip not found");
    res.status(200).json(updated);
};

export const deleteTripController = async (req: Request, res: Response) => {
    const deleted = await deleteTrip(parseInt(req.params.id));
    if (!deleted) throw new AppError(404, "Trip not found");
    res.status(200).json({ message: "Trip deleted.", trip: deleted });
};

// Advance a trip along its workflow. Body: { workflow_state_id, note?, location? }.
// changeTripStatus throws AppError(404/400) for not-found / illegal transition.
export const changeTripStatusController = async (req: Request, res: Response) => {
    const { workflow_state_id, note, location } = req.body;
    const trip = await changeTripStatus(parseInt(req.params.id), workflow_state_id, { note, location });
    res.status(200).json(trip);
};

export const getTripUpdatesController = async (req: Request, res: Response) => {
    res.status(200).json(await getTripUpdates(parseInt(req.params.id)));
};
