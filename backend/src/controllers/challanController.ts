import { Request, Response } from "express";
import { getAllChallans, getChallanById, createChallan, getDispatchBoard } from "../services/challanService";

export const getDispatchBoardController = async (_req: Request, res: Response) => {
  try {
    res.status(200).json(await getDispatchBoard());
  } catch (err: any) {
    console.error("Get Dispatch Board Error:", err.message);
    res.status(500).json({ error: "Failed to fetch dispatch board." });
  }
};

export const getAllChallansController = async (req: Request, res: Response) => {
  try {
    const result = await getAllChallans({
      start: req.query.start ? parseInt(req.query.start as string) : undefined,
      end: req.query.end ? parseInt(req.query.end as string) : undefined,
      trip_id: req.query.trip_id ? parseInt(req.query.trip_id as string) : undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Get Challans Error:", err.message);
    res.status(500).json({ error: "Failed to fetch challans." });
  }
};

export const getChallanByIdController = async (req: Request, res: Response) => {
  try {
    const challan = await getChallanById(parseInt(req.params.id));
    if (!challan) return res.status(404).json({ error: "Challan not found" });
    res.status(200).json(challan);
  } catch (err: any) {
    console.error("Get Challan Error:", err.message);
    res.status(500).json({ error: "Failed to fetch challan." });
  }
};

export const createChallanController = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await createChallan(req.body));
  } catch (err: any) {
    console.error("Create Challan Error:", err.message);
    res.status(500).json({ error: "Failed to create challan." });
  }
};
