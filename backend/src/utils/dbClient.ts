import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types.js";

const supabaseUrl = process.env.DATABASE_URL as string;
const supabaseApiKey = process.env.DATABASE_API_KEY as string;

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseApiKey
)
