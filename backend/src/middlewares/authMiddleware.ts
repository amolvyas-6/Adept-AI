import { supabase } from "../utils/dbClient.js";

export const authMiddleware = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  const { user } = data;
  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("Authenticated user:", user);
  console.log(data);
  req.user = user;
  return next();
};
