import { Request, Response } from "express";
import {
  getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer,
} from "../services/customerService";

export const getAllCustomersController = async (req: Request, res: Response) => {
  try {
    const result = await getAllCustomers({
      start: req.query.start ? parseInt(req.query.start as string) : undefined,
      end: req.query.end ? parseInt(req.query.end as string) : undefined,
      search: req.query.search as string | undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Get Customers Error:", err.message);
    res.status(500).json({ error: "Failed to fetch customers." });
  }
};

export const getCustomerByIdController = async (req: Request, res: Response) => {
  try {
    const customer = await getCustomerById(parseInt(req.params.id));
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer);
  } catch (err: any) {
    console.error("Get Customer Error:", err.message);
    res.status(500).json({ error: "Failed to fetch customer." });
  }
};

export const createCustomerController = async (req: Request, res: Response) => {
  try {
    const customer = await createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err: any) {
    console.error("Create Customer Error:", err.message);
    if (err.code === "23505") return res.status(409).json({ error: "A customer with this GST number already exists." });
    res.status(500).json({ error: "Failed to create customer." });
  }
};

export const updateCustomerController = async (req: Request, res: Response) => {
  try {
    const updated = await updateCustomer(parseInt(req.params.id), req.body);
    if (!updated) return res.status(400).json({ error: "No valid fields to update, or customer not found." });
    res.status(200).json(updated);
  } catch (err: any) {
    console.error("Update Customer Error:", err.message);
    if (err.code === "23505") return res.status(409).json({ error: "A customer with this GST number already exists." });
    res.status(500).json({ error: "Failed to update customer." });
  }
};

export const deleteCustomerController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteCustomer(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json({ message: "Customer deleted.", customer: deleted });
  } catch (err: any) {
    console.error("Delete Customer Error:", err.message);
    res.status(500).json({ error: "Failed to delete customer." });
  }
};
