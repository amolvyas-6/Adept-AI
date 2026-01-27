import { ApiError } from "../types/apiError.types.js";
import { supabase } from "../utils/dbClient.js";

export const authMiddleware = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const { data, error } = await supabase.auth.getUser(token);
  const { user } = data;
  if (error || !user) {
    throw new ApiError(401, "Unauthorized");
  }

  req.user = user;
  return next();
};
