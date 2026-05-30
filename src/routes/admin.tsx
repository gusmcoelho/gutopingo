import { createFileRoute, useNavigate } from "@tanstack/react-router"; // forced refresh
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStats } from "@/lib/admin.functions";
import { ArrowLeft, DollarSign, ShoppingCart, Clock, Loader2, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Sale {
  id: string;
  provider: "stripe" | "livepix";
  amount: number;
  price_id: string;
  user_id: string;
  user_email: string | null;
  status: string;
  created_at: string;
}

interface Stats {
  totalRevenue: number;
  totalSales: number;
  livepixRevenue: number;
  stripeRevenue: number;
  pendingCount: number;
  sales: Sale[];
}

function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/auth" });
        return;
      }
      try {
        const result = await getAdminStats();
        if ("error" in result) {
          setError(result.error);
        } else {
          setStats(result);
        }
      } catch (e: any) {
        setError(e.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div style={{ minHeight: "100vh", background: "#09001a", color: "#e9d5ff", fontFamily: "'Courier New', monospace", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <button
          onClick={() => navigate({ to: "/" })}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "transparent", color: "#a855f7", border: "2px solid #4c1d95", cursor: "pointer", fontSize: 12, fontWeight: 700, marginBottom: 24 }}
        >
          <ArrowLeft size={14} /> VOLTAR
        </button>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32, letterSpacing: "-0.02em" }}>
          PAINEL <span style={{ color: "#a855f7" }}>ADMIN</span>
        </h1>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a855f7" }}>
            <Loader2 className="animate-spin" size={18} /> Carregando...
          </div>
        )}

        {error && (
          <div style={{ padding: 20, background: "rgba(239,68,68,0.1)", border: "2px solid #ef4444", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {stats && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
              <StatCard label="RECEITA TOTAL" value={fmt(stats.totalRevenue)} icon={<DollarSign size={20} />} color="#22c55e" />
              <StatCard label="VENDAS CONCLUÍDAS" value={String(stats.totalSales)} icon={<ShoppingCart size={20} />} color="#a855f7" />
              <StatCard label="PIX (LIVEPIX)" value={fmt(stats.livepixRevenue)} icon={<TrendingUp size={20} />} color="#22c55e" />
              <StatCard label="CARTÃO (STRIPE)" value={fmt(stats.stripeRevenue)} icon={<TrendingUp size={20} />} color="#7c3aed" />
              <StatCard label="PENDENTES" value={String(stats.pendingCount)} icon={<Clock size={20} />} color="#f59e0b" />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>HISTÓRICO DE TRANSAÇÕES</h2>
            <div style={{ background: "rgba(30,10,60,0.6)", border: "2px solid #4c1d95", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "rgba(124,58,237,0.2)", textAlign: "left" }}>
                    <th style={th}>DATA</th>
                    <th style={th}>USUÁRIO</th>
                    <th style={th}>MÉTODO</th>
                    <th style={th}>VALOR</th>
                    <th style={th}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.sales.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#7c3aed" }}>Nenhuma transação ainda.</td>
                    </tr>
                  )}
                  {stats.sales.map((s) => (
                    <tr key={s.id} style={{ borderTop: "1px solid #2e1065" }}>
                      <td style={td}>{new Date(s.created_at).toLocaleString("pt-BR")}</td>
                      <td style={td}>{s.user_email || s.user_id.slice(0, 8)}</td>
                      <td style={td}>
                        <span style={{ padding: "2px 8px", background: s.provider === "livepix" ? "#22c55e" : "#7c3aed", color: "#fff", fontWeight: 700, letterSpacing: "0.1em" }}>
                          {s.provider === "livepix" ? "PIX" : "CARD"}
                        </span>
                      </td>
                      <td style={td}>{fmt(s.amount)}</td>
                      <td style={td}>
                        <span style={{ color: s.status === "completed" ? "#22c55e" : s.status === "pending" ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, color: "#a855f7", letterSpacing: "0.1em" };
const td: React.CSSProperties = { padding: "12px 16px", color: "#ddd6fe" };

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: "rgba(30,10,60,0.7)", border: `2px solid ${color}`, padding: 20, boxShadow: `4px 4px 0 ${color}33` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color }}>
        {icon}
        <span style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#e9d5ff" }}>{value}</div>
    </div>
  );
}
