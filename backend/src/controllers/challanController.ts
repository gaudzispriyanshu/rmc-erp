import { Request, Response } from "express";
import { getAllChallans, getChallanById, createChallan, getDispatchBoard } from "../services/challanService";
import { AppError } from "../errors/AppError";

export const getDispatchBoardController = async (_req: Request, res: Response) => {
  res.status(200).json(await getDispatchBoard());
};

export const getAllChallansController = async (req: Request, res: Response) => {
  const result = await getAllChallans({
    start: req.query.start ? parseInt(req.query.start as string) : undefined,
    end: req.query.end ? parseInt(req.query.end as string) : undefined,
    trip_id: req.query.trip_id ? parseInt(req.query.trip_id as string) : undefined,
  });
  res.status(200).json(result);
};

export const getChallanByIdController = async (req: Request, res: Response) => {
  const challan = await getChallanById(parseInt(req.params.id));
  if (!challan) throw new AppError(404, "Challan not found");
  res.status(200).json(challan);
};

export const createChallanController = async (req: Request, res: Response) => {
  res.status(201).json(await createChallan(req.body));
};
