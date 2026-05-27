import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USER: UserType = {
  name: "GutoPinguim",
  email: "guto@example.com",
};

const MOCK_KEYS: LicenseKey[] = [
  {
    id: "1",
    key: "GUTO-XXXX-YYYY-ZZZZ-AAAA",
    plan: "Vitalício",
    expiresAt: null,
    isLifetime: true,
  },
  {
    id: "2",
    key: "PING-30DY-BBBB-CCCC-DDDD",
    plan: "30 Dias",
    expiresAt: "2025-06-30",
    isLifetime: false,
  },
];

const PLANS: Plan[] = [
  {
    id: "1day",
    priceId: "price_1day",
    name: "Guto Pingo - 1 Dia",
    price: "R$ 20.00",
    priceNote: "acesso imediato",
    duration: "1 Dia",
    icon: <Clock size={20} />,
    color: "#6d28d9",
    features: ["Acesso de 1 dia", "Software as a service", "Business use"],
  },
  {
    id: "1week",
    priceId: "price_1week",
    name: "Guto Pingo - 1 Semana",
    price: "R$ 45.00",
    priceNote: "acesso imediato",
    duration: "1 Semana",
    icon: <Zap size={20} />,
    color: "#5b21b6",
    features: ["Acesso de 1 semana", "Software as a service", "Business use"],
  },
  {
    id: "30days",
    priceId: "price_30days",
    name: "Guto Pingo - 30 Dias",
    price: "R$ 100.00",
    priceNote: "acesso imediato",
    duration: "30 Dias",
    icon: <Globe size={20} />,
    color: "#4c1d95",
    features: ["Acesso de 30 dias", "Software as a service", "Business use"],
  },
  {
    id: "lifetime",
    priceId: "price_lifetime",
    name: "Guto Pingo - Vitalício",
    price: "R$ 169.99",
    priceNote: "PROMOÇÃO",
    duration: "Para sempre",
    icon: <Infinity size={20} />,
    featured: true,
    badge: "🔥 PROMO LIMITADA",
    color: "#7c3aed",
    features: [
      "Acesso vitalício",
      "Software as a service",
      "Business use",
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
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        animation: animated ? "pengFloat 3s ease-in-out infinite" : undefined,
      }}
    >
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: "pixelated" }}>
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
            <rect x="9" y="18" width="2" height="4" fill="#a855f7" opacity="0.6" />
            <rect x="21" y="18" width="2" height="4" fill="#a855f7" opacity="0.6" />
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

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        background: copied ? "#059669" : "#7c3aed",
        color: "#fff",
        border: "2px solid",
        borderColor: copied ? "#047857" : "#5b21b6",
        borderRadius: 0,
        cursor: "pointer",
        fontFamily: "'Courier New', monospace",
        fontSize: 12,
        fontWeight: 700,
        imageRendering: "pixelated",
        transition: "all 0.15s",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? (
        <>
          <Check size={14} /> COPIADO!
        </>
      ) : (
        <>
          <Copy size={14} /> COPIAR
        </>
      )}
    </button>
  );
}

// ─── Key Card ─────────────────────────────────────────────────────────────────

function KeyCard({ licKey }: { licKey: LicenseKey }) {
  return (
    <div
      style={{
        background: "rgba(91,33,182,0.15)",
        border: "2px solid #7c3aed",
        borderRadius: 0,
        padding: "20px 24px",
        position: "relative",
        imageRendering: "pixelated",
        boxShadow: "4px 4px 0 #4c1d95",
        overflow: "hidden",
      }}
    >
      {/* Pixel corner decorations */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          background: "#a855f7",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 8,
          height: 8,
          background: "#a855f7",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 8,
          height: 8,
          background: "#a855f7",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 8,
          height: 8,
          background: "#a855f7",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Key size={14} color="#a855f7" />
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                color: "#a855f7",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {licKey.plan}
            </span>
            {licKey.isLifetime && (
              <span
                style={{
                  background: "#7c3aed",
                  color: "#e9d5ff",
                  fontSize: 10,
                  padding: "2px 8px",
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  border: "1px solid #a855f7",
                }}
              >
                ∞ LIFETIME
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 13,
              color: "#e9d5ff",
              letterSpacing: "0.12em",
              fontWeight: 700,
            }}
          >
            {licKey.key}
          </div>
        </div>
        <CopyButton text={licKey.key} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "#a78bfa",
          fontFamily: "'Courier New', monospace",
        }}
      >
        <Clock size={11} />
        {licKey.isLifetime ? "Nunca expira" : `Expira em: ${licKey.expiresAt}`}
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, onBuy }: { plan: Plan; onBuy: (priceId: string) => void }) {
  return (
    <div
      style={{
        background: plan.featured ? "rgba(124,58,237,0.25)" : "rgba(30,10,60,0.7)",
        border: plan.featured ? "2px solid #a855f7" : "2px solid #4c1d95",
        borderRadius: 0,
        padding: plan.featured ? "28px 24px" : "24px 20px",
        position: "relative",
        boxShadow: plan.featured ? "4px 4px 0 #7c3aed, 0 0 30px rgba(168,85,247,0.2)" : "4px 4px 0 #2e1065",
        display: "flex",
        flexDirection: "column",
        imageRendering: "pixelated",
        transform: plan.featured ? "scale(1.04)" : "scale(1)",
        zIndex: plan.featured ? 2 : 1,
        transition: "all 0.2s",
      }}
    >
      {plan.badge && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#f59e0b",
            color: "#1c1410",
            fontSize: 11,
            padding: "4px 16px",
            fontFamily: "'Courier New', monospace",
            fontWeight: 900,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
            border: "2px solid #d97706",
          }}
        >
          {plan.badge}
        </div>
      )}

      {/* Pixel corners */}
      {plan.featured && (
        <>
          <div
            style={{
              position: "absolute",
              top: -2,
              left: -2,
              width: 10,
              height: 10,
              background: "#f59e0b",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              background: "#f59e0b",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -2,
              left: -2,
              width: 10,
              height: 10,
              background: "#f59e0b",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 10,
              height: 10,
              background: "#f59e0b",
            }}
          />
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ color: "#a855f7" }}>{plan.icon}</div>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            fontWeight: 700,
            color: "#c4b5fd",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {plan.duration}
        </span>
      </div>

      <div style={{ marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: plan.featured ? 32 : 26,
            fontWeight: 900,
            color: plan.featured ? "#e9d5ff" : "#c4b5fd",
            letterSpacing: "-0.02em",
          }}
        >
          {plan.price}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          color: "#7c3aed",
          marginBottom: 20,
          letterSpacing: "0.05em",
        }}
      >
        {plan.priceNote}
      </div>

      <div style={{ flex: 1, marginBottom: 20 }}>
        {plan.features.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              color: "#ddd6fe",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                background: "#a855f7",
                flexShrink: 0,
                imageRendering: "pixelated",
              }}
            />
            {f}
          </div>
        ))}
      </div>

      <button
        onClick={() => onBuy(plan.priceId)}
        style={{
          width: "100%",
          padding: plan.featured ? "14px 0" : "11px 0",
          background: plan.featured ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "transparent",
          color: plan.featured ? "#fff" : "#a855f7",
          border: plan.featured ? "2px solid #c4b5fd" : "2px solid #7c3aed",
          borderRadius: 0,
          cursor: "pointer",
          fontFamily: "'Courier New', monospace",
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          transition: "all 0.15s",
          imageRendering: "pixelated",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = "#7c3aed";
          (e.target as HTMLButtonElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          if (!plan.featured) {
            (e.target as HTMLButtonElement).style.background = "transparent";
            (e.target as HTMLButtonElement).style.color = "#a855f7";
          } else {
            (e.target as HTMLButtonElement).style.background = "linear-gradient(135deg, #7c3aed, #a855f7)";
          }
        }}
      >
        {plan.id === "5min" ? ">> TESTAR GRÁTIS" : ">> COMPRAR KEY"}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GutoPingoPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [licenseKeys] = useState<LicenseKey[]>(MOCK_KEYS);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBuy = (priceId: string) => {
    console.log("Buying:", priceId);
    // Implement Stripe/payment redirect here
    alert(`Redirecionando para checkout: ${priceId}`);
  };

  const handleLogin = () => setUser(MOCK_USER);
  const handleLogout = () => setUser(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09001a",
        fontFamily: "'Courier New', monospace",
        color: "#e9d5ff",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes pengFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          95% { opacity: 1; }
          96% { opacity: 0.4; }
          97% { opacity: 1; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 40px rgba(168,85,247,0.6); }
        }
        @keyframes pixelIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #09001a; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; }
        .plan-card:hover { transform: translateY(-4px) !important; }
        .feature-card:hover { border-color: #7c3aed !important; background: rgba(124,58,237,0.1) !important; }
      `}</style>

      {/* Scanline overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(transparent, rgba(168,85,247,0.15), transparent)",
          animation: "scanline 8s linear infinite",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(9,0,26,0.95)" : "transparent",
          borderBottom: scrolled ? "1px solid #4c1d95" : "none",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          transition: "all 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PixelPenguin size={36} />
          <span
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "0.08em",
              color: "#e9d5ff",
              animation: "flicker 4s infinite",
            }}
          >
            GUTO<span style={{ color: "#a855f7" }}>PINGO</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: "#7c3aed",
                    border: "2px solid #a855f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={16} color="#e9d5ff" />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#c4b5fd",
                    display: "none",
                  }}
                  className="md-show"
                >
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background: "transparent",
                  color: "#a855f7",
                  border: "2px solid #4c1d95",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                <LogOut size={13} /> SAIR
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                padding: "8px 20px",
                background: "transparent",
                color: "#a855f7",
                border: "2px solid #7c3aed",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Courier New', monospace",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              ENTRAR
            </button>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 60px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <PixelStars />

        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Penguin hero */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                position: "relative",
                animation: "glow 3s ease-in-out infinite",
              }}
            >
              <PixelPenguin size={140} animated={true} angry={true} />
              {/* Flame pixels */}
              <div
                style={{
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 4,
                }}
              >
                {[16, 24, 20, 28, 16].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: h,
                      background: i % 2 === 0 ? "#7c3aed" : "#a855f7",
                      imageRendering: "pixelated",
                      animation: `twinkle ${1 + i * 0.2}s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "rgba(124,58,237,0.2)",
              border: "1px solid #7c3aed",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                background: "#22c55e",
                animation: "twinkle 1s infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#a855f7",
                letterSpacing: "0.2em",
                fontWeight: 700,
              }}
            >
              EXTENSÃO ATIVA • LOVABLE DESBLOQUEADO
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(36px, 8vw, 80px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              marginBottom: 20,
              color: "#f5f3ff",
              textShadow: "0 0 40px rgba(168,85,247,0.5)",
            }}
          >
            PROMPTS
            <br />
            <span
              style={{
                color: "#a855f7",
                textShadow: "0 0 20px rgba(168,85,247,0.8), 2px 2px 0 #4c1d95",
              }}
            >
              ILIMITADOS
            </span>
            <br />
            <span style={{ fontSize: "0.55em", color: "#c4b5fd" }}>NO LOVABLE</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(14px, 2.5vw, 18px)",
              color: "#a78bfa",
              maxWidth: 520,
              margin: "0 auto 40px",
              lineHeight: 1.7,
              letterSpacing: "0.02em",
            }}
          >
            Pare de travar no limite de prompts. A extensão do Guto Pingo desbloqueia{" "}
            <span style={{ color: "#e9d5ff", fontWeight: 700 }}>criação infinita</span> no Lovable com uma key simples.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="#pricing"
              style={{
                padding: "16px 36px",
                background: "#7c3aed",
                color: "#fff",
                border: "2px solid #a855f7",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.12em",
                boxShadow: "4px 4px 0 #4c1d95",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Key size={16} /> COMPRAR KEY
            </a>
            <a
              href="https://wa.me/seunumerowhatsapp"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "16px 36px",
                background: "transparent",
                color: "#a855f7",
                border: "2px solid #7c3aed",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.12em",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Lock size={16} /> SUPORTE
            </a>
          </div>

          {/* Scroll hint */}
          <div
            style={{
              marginTop: 64,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: "#4c1d95",
              animation: "twinkle 2s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: "0.2em" }}>SCROLL</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      {/* ── DASHBOARD (if logged in) ── */}
      {user && (
        <section
          style={{
            padding: "60px 24px",
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 20px",
                background: "rgba(124,58,237,0.15)",
                border: "1px solid #7c3aed",
                marginBottom: 16,
              }}
            >
              <PixelPenguin size={28} />
              <span
                style={{
                  fontSize: 12,
                  color: "#a855f7",
                  letterSpacing: "0.15em",
                  fontWeight: 700,
                }}
              >
                BEM-VINDO, {user.name.toUpperCase()}
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px, 4vw, 36px)",
                fontWeight: 900,
                color: "#e9d5ff",
                letterSpacing: "-0.01em",
              }}
            >
              SUAS <span style={{ color: "#a855f7" }}>KEYS ATIVAS</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {licenseKeys.map((k) => (
              <KeyCard key={k.id} licKey={k} />
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section
        style={{
          padding: "80px 24px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span
            style={{
              fontSize: 11,
              color: "#7c3aed",
              letterSpacing: "0.25em",
              fontWeight: 700,
            }}
          >
            // POR QUE USAR
          </span>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 900,
              color: "#f5f3ff",
              marginTop: 8,
            }}
          >
            VANTAGENS DO <span style={{ color: "#a855f7" }}>GUTO PINGO</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{
                background: "rgba(20,5,45,0.8)",
                border: "2px solid #2e1065",
                padding: "24px 20px",
                position: "relative",
                transition: "all 0.2s",
                cursor: "default",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(124,58,237,0.2)",
                  border: "2px solid #7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#a855f7",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#e9d5ff",
                  marginBottom: 8,
                  letterSpacing: "0.05em",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "#7c3aed",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
              {/* Pixel accent */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: "linear-gradient(90deg, #7c3aed, transparent)",
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        style={{
          padding: "80px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              style={{
                fontSize: 11,
                color: "#7c3aed",
                letterSpacing: "0.25em",
                fontWeight: 700,
              }}
            >
              // SELECT YOUR PLAN
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 40px)",
                fontWeight: 900,
                color: "#f5f3ff",
                marginTop: 8,
                marginBottom: 12,
              }}
            >
              ESCOLHA SEU <span style={{ color: "#a855f7" }}>PLANO</span>
            </h2>
            <p
              style={{
                color: "#6d28d9",
                fontSize: 13,
                letterSpacing: "0.05em",
              }}
            >
              Todos os planos desbloqueiam prompts ilimitados no Lovable
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
              alignItems: "stretch",
            }}
          >
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onBuy={handleBuy} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section
        style={{
          padding: "60px 24px",
          maxWidth: 800,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          {[
            { label: "USUÁRIOS ATIVOS", value: "2.400+" },
            { label: "KEYS VENDIDAS", value: "8.900+" },
            { label: "AVALIAÇÃO", value: "4.9★" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: "clamp(28px, 5vw, 44px)",
                  fontWeight: 900,
                  color: "#a855f7",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#4c1d95",
                  letterSpacing: "0.2em",
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "2px solid #4c1d95",
            padding: "28px 32px",
            position: "relative",
            boxShadow: "4px 4px 0 #2e1065",
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: "#7c3aed",
              marginBottom: 12,
              lineHeight: 1,
            }}
          >
            "
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#c4b5fd",
              lineHeight: 1.8,
              margin: "0 0 16px",
              fontStyle: "italic",
            }}
          >
            Cara, o Guto Pingo mudou meu fluxo de trabalho completamente. Antes eu ficava travado nos limites, agora
            consigo iterar sem parar. Vale cada centavo.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "#7c3aed",
                border: "2px solid #a855f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              MK
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#e9d5ff", fontWeight: 700 }}>@marcos_dev</div>
              <div style={{ fontSize: 10, color: "#7c3aed" }}>Plano Vitalício</div>
            </div>
            <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid #2e1065",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <PixelPenguin size={32} />
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.1em",
            }}
          >
            GUTO<span style={{ color: "#a855f7" }}>PINGO</span>
          </span>
        </div>
        <p style={{ fontSize: 11, color: "#4c1d95", letterSpacing: "0.1em" }}>
          © 2025 GUTOPINGO.COM • TODOS OS DIREITOS RESERVADOS
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 16,
          }}
        >
          {["TERMOS", "PRIVACIDADE", "SUPORTE", "DISCORD"].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontSize: 10,
                color: "#6d28d9",
                textDecoration: "none",
                letterSpacing: "0.15em",
              }}
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: GutoPingoPage,
});
