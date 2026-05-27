import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Zap,
  Infinity,
  Copy,
  Check,
  Star,
  Shield,
  Rocket,
  Clock,
  Globe,
  Lock,
  ChevronDown,
  Terminal,
  Cpu,
  Layers,
  Award,
  Gift,
  Timer,
  Key,
  LogOut,
  User,
} from "lucide-react";
import { createCheckoutSession } from "@/lib/payments.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LicenseKey {
  id: string;
  key: string;
  plan: string;
  expiresAt: string | null;
  isLifetime: boolean;
}

interface UserType {
  name: string;
  email: string;
  avatar?: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  duration: string;
  icon: React.ReactNode;
  featured?: boolean;
  badge?: string;
  features: string[];
  color: string;
  priceId: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "5min",
    priceId: "price_5min",
    name: "Guto Pingo - 5 Minutos (Teste)",
    price: "R$ 5,00",
    priceNote: "pagamento único",
    duration: "5 Minutos",
    icon: <Timer size={20} />,
    color: "#7c3aed",
    features: ["Acesso de 5 minutos", "Teste a ferramenta", "SaaS - Business Use"],
  },
  {
    id: "1day",
    priceId: "price_1day",
    name: "Guto Pingo - 1 Dia",
    price: "R$ 20,00",
    priceNote: "SaaS - Business Use",
    duration: "1 Dia",
    icon: <Clock size={20} />,
    color: "#6d28d9",
    features: ["Acesso de 1 dia", "Tudo liberado", "Suporte básico"],
  },
  {
    id: "1week",
    priceId: "price_1week",
    name: "Guto Pingo - 1 Semana",
    price: "R$ 45,00",
    priceNote: "SaaS - Business Use",
    duration: "1 Semana",
    icon: <Zap size={20} />,
    color: "#5b21b6",
    features: ["Acesso de 1 semana", "Melhor custo x benefício", "Suporte prioritário"],
  },
  {
    id: "30days",
    priceId: "price_30days",
    name: "Guto Pingo - 30 Dias",
    price: "R$ 100,00",
    priceNote: "SaaS - Business Use",
    duration: "30 Dias",
    icon: <Globe size={20} />,
    color: "#4c1d95",
    features: [
      "Acesso de 30 dias",
      "Ideal para profissionais",
      "Suporte VIP",
      "Discord exclusivo",
    ],
  },
  {
    id: "lifetime",
    priceId: "price_lifetime",
    name: "Guto Pingo - Vitalício (PROMO)",
    price: "R$ 169,99",
    priceNote: "SaaS - Business Use",
    duration: "Para sempre",
    icon: <Infinity size={20} />,
    featured: true,
    badge: "🔥 PROMOÇÃO LIMITADA",
    color: "#7c3aed",
    features: [
      "Acesso vitalício",
      "Pagamento único",
      "Suporte VIP lifetime",
      "Discord exclusivo",
      "Atualizações grátis",
      "Prioridade máxima",
    ],
  },
];

const FEATURES = [
  {
    icon: <Zap size={22} />,
    title: "Prompts Ilimitados",
    desc: "Sem travamentos. Sem limites. Crie o quanto quiser no Lovable.",
  },
  {
    icon: <Rocket size={22} />,
    title: "Ativação Instantânea",
    desc: "Copie a key, cole na extensão e pronto. Funciona em segundos.",
  },
  {
    icon: <Shield size={22} />,
    title: "100% Seguro",
    desc: "Extensão auditada, sem acesso a dados pessoais ou código privado.",
  },
  {
    icon: <Cpu size={22} />,
    title: "Alta Performance",
    desc: "Nenhum impacto no desempenho do Lovable ou do seu browser.",
  },
  {
    icon: <Layers size={22} />,
    title: "Multi-projeto",
    desc: "Uma key funciona em todos os seus projetos simultaneamente.",
  },
  {
    icon: <Terminal size={22} />,
    title: "Suporte Técnico",
    desc: "Time de suporte ativo no Discord e WhatsApp para te ajudar.",
  },
];

// ─── Pixel Penguin SVG ────────────────────────────────────────────────────────

function PixelPenguin({
  size = 120,
  animated = false,
  angry = false,
}: {
  size?: number;
  animated?: boolean;
  angry?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        animation: animated ? "pengFloat 3s ease-in-out infinite" : undefined,
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        style={{ imageRendering: "pixelated" }}
      >
        {/* Body */}
        <rect x="10" y="8" width="12" height="14" fill="#7c3aed" />
        <rect x="8" y="10" width="2" height="10" fill="#6d28d9" />
        <rect x="22" y="10" width="2" height="10" fill="#6d28d9" />
        <rect x="10" y="6" width="12" height="4" fill="#7c3aed" />
        {/* Head round */}
        <rect x="12" y="4" width="8" height="4" fill="#7c3aed" />
        {/* Belly */}
        <rect x="12" y="12" width="8" height="8" fill="#ddd6fe" />
        {/* Eyes */}
        {angry ? (
          <>
            <rect x="13" y="9" width="2" height="2" fill="#1e1b4b" />
            <rect x="17" y="9" width="2" height="2" fill="#1e1b4b" />
            <rect x="12" y="8" width="3" height="1" fill="#5b21b6" />
            <rect x="17" y="8" width="3" height="1" fill="#5b21b6" />
          </>
        ) : (
          <>
            <rect x="13" y="9" width="2" height="2" fill="#1e1b4b" />
            <rect x="17" y="9" width="2" height="2" fill="#1e1b4b" />
            <rect x="13" y="9" width="1" height="1" fill="#fff" />
            <rect x="17" y="9" width="1" height="1" fill="#fff" />
          </>
        )}
        {/* Beak */}
        <rect x="14" y="12" width="4" height="2" fill="#f59e0b" />
        <rect x="15" y="14" width="2" height="1" fill="#d97706" />
        {/* Feet */}
        <rect x="11" y="22" width="4" height="2" fill="#f59e0b" />
        <rect x="17" y="22" width="4" height="2" fill="#f59e0b" />
        <rect x="10" y="23" width="2" height="1" fill="#d97706" />
        <rect x="20" y="23" width="2" height="1" fill="#d97706" />
        {/* Wings */}
        <rect x="8" y="12" width="2" height="6" fill="#5b21b6" />
        <rect x="22" y="12" width="2" height="6" fill="#5b21b6" />
        {/* Purple flame effect */}
        {animated && (
          <>
            <rect
              x="9"
              y="18"
              width="2"
              height="4"
              fill="#a855f7"
              opacity="0.6"
            />
            <rect
              x="21"
              y="18"
              width="2"
              height="4"
              fill="#a855f7"
              opacity="0.6"
            />
          </>
        )}
      </svg>
    </div>
  );
}

// ─── Pixel Stars Background ───────────────────────────────────────────────────

function PixelStars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() > 0.7 ? 2 : 1,
    delay: Math.random() * 3,
  }));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size * 2,
            height: s.size * 2,
            background: s.size > 1 ? "#c4b5fd" : "#7c3aed",
            imageRendering: "pixelated",
            animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Route Component ─────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [user, setUser] = useState<any>(null);
  const [licenseKeys, setLicenseKeys] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const navigate = useNavigate();
  const search = useSearch({ from: "/" }) as any;
  const startCheckout = useServerFn(createCheckoutSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserKeys(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserKeys(session.user.id);
      else setLicenseKeys([]);
    });

    if (search.success) {
      toast.success("Pagamento realizado com sucesso! Sua key aparecerá abaixo em instantes.");
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) fetchUserKeys(session.user.id);
        });
      }, 3000);
    }

    return () => subscription.unsubscribe();
  }, [search.success]);

  const fetchUserKeys = async (userId: string) => {
    setLoadingKeys(true);
    const { data, error } = await supabase
      .from("license_keys")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) setLicenseKeys(data || []);
    setLoadingKeys(false);
  };

  const handleBuy = async (priceId: string) => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }

    setIsBuying(priceId);
    try {
      const result = await startCheckout({ data: { priceId } });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err: any) {
      toast.error("Erro ao iniciar pagamento.");
      console.error(err);
    } finally {
      setIsBuying(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0c0a09",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes pengFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes scanline { 0% { top: -100%; } 100% { top: 100%; } }
        .pixel-btn:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 #4c1d95; }
        .pixel-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 #4c1d95; }
      `}</style>

      {/* Scanline Effect */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)",
          backgroundSize: "100% 4px",
          pointerEvents: "none",
          zIndex: 100,
          opacity: 0.4,
        }}
      />

      <PixelStars />

      {/* ─── Navigation ─── */}
      <nav
        style={{
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "4px solid #7c3aed",
          background: "rgba(12, 10, 9, 0.8)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PixelPenguin size={32} />
          <span
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "#7c3aed",
            }}
          >
            GUTO PINGO
          </span>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a
            href="#features"
            style={{
              color: "#a855f7",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            VANTAGENS
          </a>
          <a
            href="#pricing"
            style={{
              color: "#a855f7",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            PREÇOS
          </a>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 10, color: "#a78bfa" }}>
                {user.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                style={{
                  background: "none",
                  border: "2px solid #7c3aed",
                  color: "#7c3aed",
                  padding: "4px 12px",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              style={{
                background: "#7c3aed",
                color: "#fff",
                padding: "8px 16px",
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                border: "2px solid #5b21b6",
                boxShadow: "3px 3px 0 #4c1d95",
              }}
            >
              LOGIN
            </Link>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section
        style={{
          padding: "100px 20px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            background: "rgba(124, 58, 237, 0.2)",
            border: "1px solid #7c3aed",
            color: "#a855f7",
            fontSize: 10,
            fontWeight: 700,
            marginBottom: 24,
            letterSpacing: "0.1em",
          }}
        >
          [ STATUS: 100% FUNCIONAL ]
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 8vw, 80px)",
            fontWeight: 900,
            lineHeight: 0.9,
            marginBottom: 24,
            color: "#fff",
            textShadow: "6px 6px 0 #7c3aed",
          }}
        >
          LOVABLE COM <br /> CRÉDITOS <br /> ILIMITADOS
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#a78bfa",
            maxWidth: 600,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          O Guto Pingo é a ferramenta definitiva para quem quer criar sem
          limites. Intercepte prompts e use o Lovable como se tivesse créditos
          infinitos.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <a
            href="#pricing"
            className="pixel-btn"
            style={{
              background: "#7c3aed",
              color: "#fff",
              padding: "18px 32px",
              fontSize: 16,
              fontWeight: 800,
              textDecoration: "none",
              border: "4px solid #fff",
              boxShadow: "6px 6px 0 #4c1d95",
              transition: "all 0.1s",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Zap size={20} fill="#fff" /> PEGAR MINHA KEY
          </a>
        </div>

        <div
          style={{
            marginTop: 80,
            display: "flex",
            justifyContent: "center",
            gap: 40,
            opacity: 0.6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={16} /> <span>100% SEGURO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Rocket size={16} /> <span>ATIVAÇÃO INSTANTÂNEA</span>
          </div>
        </div>
      </section>

      {/* ─── Dashboard Section ─── */}
      {user && (
        <section
          id="dashboard"
          style={{
            padding: "60px 20px",
            background: "rgba(124, 58, 237, 0.05)",
            borderTop: "4px solid #7c3aed",
            borderBottom: "4px solid #7c3aed",
          }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: 24,
                marginBottom: 32,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Terminal size={24} color="#7c3aed" /> SEU PAINEL DE ACESSO
            </h2>

            {loadingKeys ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                Carregando suas chaves...
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 24,
                }}
              >
                {licenseKeys.length > 0 ? (
                  licenseKeys.map((k) => (
                    <div
                      key={k.id}
                      style={{
                        background: "rgba(124, 58, 237, 0.1)",
                        border: "2px solid #7c3aed",
                        padding: 20,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#a855f7",
                          marginBottom: 8,
                        }}
                      >
                        PLANO: {k.duration === "lifetime" ? "VITALÍCIO" : k.duration}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          letterSpacing: 2,
                          marginBottom: 16,
                          color: "#fff",
                        }}
                      >
                        {k.key}
                      </div>
                      <button
                        onClick={() => copyToClipboard(k.key)}
                        style={{
                          width: "full",
                          background: "#7c3aed",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <Copy size={14} /> COPIAR KEY
                      </button>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "40px",
                      border: "2px dashed #7c3aed",
                      color: "#a78bfa",
                    }}
                  >
                    Nenhuma key encontrada. Escolha um plano abaixo para
                    começar!
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Features Section ─── */}
      <section id="features" style={{ padding: "100px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 32, marginBottom: 16 }}>TECNOLOGIA GUTO</h2>
            <div
              style={{
                width: 60,
                height: 4,
                background: "#7c3aed",
                margin: "0 auto",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 32,
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: 32,
                  background: "rgba(255,255,255,0.02)",
                  border: "2px solid rgba(124, 58, 237, 0.2)",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ color: "#7c3aed", marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 12, color: "#fff" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: "#a78bfa", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section
        id="pricing"
        style={{ padding: "100px 20px", background: "#0c0a09" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 32, marginBottom: 16 }}>ESCOLHA SEU PODER</h2>
            <p style={{ color: "#a78bfa" }}>
              Planos flexíveis para todas as necessidades.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
              alignItems: "end",
            }}
          >
            {PLANS.map((p) => (
              <div
                key={p.id}
                style={{
                  background: p.featured
                    ? "rgba(124, 58, 237, 0.1)"
                    : "rgba(255,255,255,0.02)",
                  border: p.featured ? "4px solid #7c3aed" : "2px solid #222",
                  padding: 32,
                  position: "relative",
                  transform: p.featured ? "scale(1.05)" : "none",
                  zIndex: p.featured ? 10 : 1,
                }}
              >
                {p.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: -15,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#7c3aed",
                      color: "#fff",
                      padding: "4px 12px",
                      fontSize: 10,
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.badge}
                  </div>
                )}

                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#a855f7",
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    {p.name.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: "#fff",
                    }}
                  >
                    {p.price}
                  </div>
                  <div style={{ fontSize: 10, color: "#a78bfa" }}>
                    {p.priceNote}
                  </div>
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 32px 0",
                    fontSize: 13,
                    color: "#a78bfa",
                  }}
                >
                  {p.features.map((feat, idx) => (
                    <li
                      key={idx}
                      style={{
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Check size={14} color="#7c3aed" /> {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBuy(p.priceId)}
                  disabled={isBuying === p.priceId}
                  style={{
                    width: "100%",
                    background: p.featured ? "#7c3aed" : "transparent",
                    color: "#fff",
                    border: "2px solid #7c3aed",
                    padding: "16px",
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {isBuying === p.priceId ? "PROCESSANDO..." : "COMPRAR AGORA"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          padding: "80px 20px 40px",
          borderTop: "4px solid #7c3aed",
          background: "rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 40,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: "#7c3aed",
                marginBottom: 8,
              }}
            >
              GUTO PINGO
            </div>
            <div style={{ fontSize: 12, color: "#a78bfa" }}>
              © 2026 - TODOS OS DIREITOS RESERVADOS
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <a
              href="#"
              style={{ color: "#a78bfa", textDecoration: "none", fontSize: 14 }}
            >
              TERMOS
            </a>
            <a
              href="#"
              style={{ color: "#a78bfa", textDecoration: "none", fontSize: 14 }}
            >
              PRIVACIDADE
            </a>
            <a
              href="#"
              style={{ color: "#a78bfa", textDecoration: "none", fontSize: 14 }}
            >
              SUPORTE
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
