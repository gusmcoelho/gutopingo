import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface Sale {
  id: string;
  provider: "stripe" | "livepix";
  amount: number; // in BRL (reais)
  price_id: string;
  user_id: string;
  user_email: string | null;
  status: string;
  created_at: string;
}

interface AdminStats {
  totalRevenue: number;
  totalSales: number;
  livepixRevenue: number;
  stripeRevenue: number;
  pendingCount: number;
  sales: Sale[];
}

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminStats | { error: string }> => {
    const { userId } = context;

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return { error: "Acesso negado. Você não tem permissão de administrador." };
    }

    // Fetch all payment intents
    const { data: intents, error: intentsError } = await supabaseAdmin
      .from("payment_intents")
      .select("*")
      .order("created_at", { ascending: false });

    if (intentsError) {
      return { error: intentsError.message };
    }

    // Get user emails
    const userIds = [...new Set((intents || []).map((i) => i.user_id))];
    const emailMap: Record<string, string> = {};
    for (const uid of userIds) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(uid);
      if (u?.user?.email) emailMap[uid] = u.user.email;
    }

    const sales: Sale[] = (intents || []).map((i) => ({
      id: i.id,
      provider: i.provider as "stripe" | "livepix",
      amount: i.amount / 100, // cents -> reais
      price_id: i.price_id,
      user_id: i.user_id,
      user_email: emailMap[i.user_id] || null,
      status: i.status,
      created_at: i.created_at,
    }));

    const completed = sales.filter((s) => s.status === "completed");
    const totalRevenue = completed.reduce((sum, s) => sum + s.amount, 0);
    const livepixRevenue = completed
      .filter((s) => s.provider === "livepix")
      .reduce((sum, s) => sum + s.amount, 0);
    const stripeRevenue = completed
      .filter((s) => s.provider === "stripe")
      .reduce((sum, s) => sum + s.amount, 0);
    const pendingCount = sales.filter((s) => s.status === "pending").length;

    return {
      totalRevenue,
      totalSales: completed.length,
      livepixRevenue,
      stripeRevenue,
      pendingCount,
      sales,
    };
  });
