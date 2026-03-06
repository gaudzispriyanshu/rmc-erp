declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        roleId: number;
      };
    }
  }
}

export {};
