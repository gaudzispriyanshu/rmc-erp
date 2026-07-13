import { Request, Response } from "express";
import { createTrip, getAllTrips, getTripById, updateTrip, deleteTrip, changeTripStatus, getTripUpdates } from "../services/tripService";

// type TripWithCustomerAndVehicle = Database['public']['Tables']['trips']['Row'];

export const createTripController = async (req: Request, res: Response) => {
    try {
        const { order_id, vehicle_id, driver_id, status, eta, started_at, completed_at, volume_delivered, fuel_cost_estimate } = req.body;
        // Default the assigner to the authenticated user when the client doesn't send one.
        const assigned_by = req.body.assigned_by ?? req.user?.userId;

        const trip = await createTrip({
            order_id, vehicle_id, driver_id, assigned_by, status, eta, started_at, completed_at, volume_delivered, fuel_cost_estimate
        });
        res.status(201).json(trip);

    } catch (err: any) {
        console.error("Trip Creation Error:", err.message);
        res.status(500).json({ error: "Failed to create trip." });
    }
}

export const getAllTripController = async (req: Request, res: Response) => {
    try {
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
        }
        const trip = await getAllTrips(filters);
        res.status(200).json(trip);
    } catch (err: any) {
        console.error("Trip Records not fetched:", err.message);
        res.status(500).json({ error: "Failed to fetch trip." });
    }
}

export const getTripByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const trip = await getTripById(parseInt(id));
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }
        return res.status(200).json(trip);
    } catch (err: any) {
        console.error("Trip Record not fetched:", err.message);
        res.status(500).json({ error: "Failed to fetch trip." });
    }
}

export const updateTripController = async (req: Request, res: Response) => {
    try {
        const updated = await updateTrip(parseInt(req.params.id), req.body);
        if (!updated) return res.status(400).json({ error: "No valid fields to update, or trip not found." });
        res.status(200).json(updated);
    } catch (err: any) {
        console.error("Update Trip Error:", err.message);
        res.status(500).json({ error: "Failed to update trip." });
    }
}

export const deleteTripController = async (req: Request, res: Response) => {
    try {
        const deleted = await deleteTrip(parseInt(req.params.id));
        if (!deleted) return res.status(404).json({ error: "Trip not found" });
        res.status(200).json({ message: "Trip deleted.", trip: deleted });
    } catch (err: any) {
        console.error("Delete Trip Error:", err.message);
        res.status(500).json({ error: "Failed to delete trip." });
    }
}

// Advance a trip along its workflow. Body: { workflow_state_id, note?, location? }
export const changeTripStatusController = async (req: Request, res: Response) => {
    try {
        const { workflow_state_id, note, location } = req.body;
        const trip = await changeTripStatus(parseInt(req.params.id), workflow_state_id, { note, location });
        res.status(200).json(trip);
    } catch (err: any) {
        if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Trip not found" });
        if (err.message === "ILLEGAL_TRANSITION") {
            return res.status(400).json({ error: "That status change is not allowed by the workflow." });
        }
        console.error("Change Trip Status Error:", err.message);
        res.status(500).json({ error: "Failed to change trip status." });
    }
}

export const getTripUpdatesController = async (req: Request, res: Response) => {
    try {
        res.status(200).json(await getTripUpdates(parseInt(req.params.id)));
    } catch (err: any) {
        console.error("Get Trip Updates Error:", err.message);
        res.status(500).json({ error: "Failed to fetch trip updates." });
    }
}