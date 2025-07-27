import { createClient } from "@supabase/supabase-js";

const serviceRoleSecret = process.env.SUPABASE_SECRET_KEY;
export function createServiceClient() {
  if (!serviceRoleSecret) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleSecret,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
