import type { RequestHandler } from "express";

export const asyncHandler =
  (fn: any): RequestHandler =>
  (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
