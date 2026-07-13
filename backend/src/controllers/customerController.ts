import { Request, Response } from "express";
import {
  getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer,
} from "../services/customerService";
import { AppError } from "../errors/AppError";

// A duplicate GST number surfaces as a unique violation -> 409 via errorHandler.

export const getAllCustomersController = async (req: Request, res: Response) => {
  const result = await getAllCustomers({
    start: req.query.start ? parseInt(req.query.start as string) : undefined,
    end: req.query.end ? parseInt(req.query.end as string) : undefined,
    search: req.query.search as string | undefined,
  });
  res.status(200).json(result);
};

export const getCustomerByIdController = async (req: Request, res: Response) => {
  const customer = await getCustomerById(parseInt(req.params.id));
  if (!customer) throw new AppError(404, "Customer not found");
  res.status(200).json(customer);
};

export const createCustomerController = async (req: Request, res: Response) => {
  const customer = await createCustomer(req.body);
  res.status(201).json(customer);
};

export const updateCustomerController = async (req: Request, res: Response) => {
  const updated = await updateCustomer(parseInt(req.params.id), req.body);
  if (!updated) throw new AppError(404, "Customer not found");
  res.status(200).json(updated);
};

export const deleteCustomerController = async (req: Request, res: Response) => {
  const deleted = await deleteCustomer(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Customer not found");
  res.status(200).json({ message: "Customer deleted.", customer: deleted });
};
