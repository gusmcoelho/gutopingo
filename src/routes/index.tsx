import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  color: string;
  priceId: string;
  features: string[];
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
      // Tenta buscar as chaves após um pequeno delay para o webhook processar
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
    <div className="min-h-screen text-foreground scanlines relative overflow-hidden bg-[#1a0f2e]">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/30 blur-[100px] animate-pulse" />
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-accent/20 blur-[120px] animate-pulse delay-700" />
      </div>


      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b-4 border-primary bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-primary border-2 border-white flex items-center justify-center relative overflow-hidden">
               <span className="font-pixel text-white text-lg">G</span>
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-pixel text-xl text-primary tracking-tighter uppercase">GUTO<span className="text-accent">.</span>PINGO</span>

          </div>
          <div className="hidden md:flex gap-8 items-center font-retro text-2xl uppercase">
            <a href="#features" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">Vantagens</a>
            <a href="#pricing" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">Preços</a>
            <a href="#faq" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">Dúvidas</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="font-pixel text-[8px] text-muted-foreground hover:text-primary transition-colors"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link to="/auth" className="pixel-btn bg-primary text-primary-foreground px-4 py-2 font-pixel text-[10px]">
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 border-2 border-primary bg-primary/10 px-4 py-1.5 mb-10 font-pixel text-[10px] text-primary animate-bounce">
          <Zap className="w-3 h-3" /> NOVO: MÉTODO ATUALIZADO 2024
        </div>


        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="float glow relative z-10 p-4 border-4 border-primary bg-card/80">
            <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-muted/50 overflow-hidden relative">
              <Zap className="w-24 h-24 text-primary/40 absolute animate-pulse" />
              <img src="https://lovable-uploads.s3.us-west-2.amazonaws.com/13593003-8839-4467-84ec-607212456041.png" alt="Penguin Pixel Art" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 border-4 border-accent bg-accent/20 backdrop-blur animate-spin-slow" />
        </div>
        <h1 className="font-pixel text-3xl md:text-6xl mb-8 leading-tight text-primary" style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.5), 8px 8px 0px oklch(0.3 0.2 320)" }}>

          GUTO PINGO<br />CRÉDITOS<br />ILIMITADOS
        </h1>

        <p className="font-retro text-2xl md:text-4xl max-w-3xl mx-auto mb-12 text-muted-foreground leading-relaxed">
          O Guto Pingo é uma extensão que abre um painel exclusivo dentro do Lovable. <br className="hidden md:block" />
          Digite seus prompts por ele e crie sem gastar nenhum crédito da sua conta.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg">
          <a href="#pricing" className="pixel-btn bg-primary text-primary-foreground px-10 py-5 font-pixel text-sm flex items-center justify-center gap-3 group">
            <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" /> 
            COMPRAR MINHA KEY
          </a>
          <button 
            onClick={() => handleBuy('price_5min')}
            className="pixel-btn bg-white text-black px-10 py-5 font-pixel text-sm flex items-center justify-center gap-3"
          >
            <Copy className="w-5 h-5" /> 
            TESTAR AGORA (R$5)
          </button>

        </div>


      </section>
      
      {/* User Dashboard / Keys Section */}
      {user && (
        <section id="dashboard" className="py-12 bg-primary/5 border-y-2 border-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-pixel text-lg text-primary mb-8 flex items-center gap-3">
                <Key className="w-6 h-6" /> SUAS KEYS ATIVAS
              </h2>
              
              <div className="grid gap-4">
                {licenseKeys.length > 0 ? (
                  licenseKeys.map((k) => (
                    <div key={k.id} className="pixel-card bg-black/40 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/20 flex items-center justify-center border-2 border-primary">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-pixel text-[10px] text-muted-foreground uppercase">{k.duration === 'lifetime' ? 'VITALÍCIO' : `DURAÇÃO: ${k.duration}`}</p>
                          <p className="font-retro text-2xl text-white font-mono tracking-wider">{k.key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {k.expires_at && (
                          <span className="font-retro text-lg text-accent">Expira em: {new Date(k.expires_at).toLocaleDateString()}</span>
                        )}
                        <button 
                          onClick={() => copyToClipboard(k.key)}
                          className="pixel-btn bg-white text-black p-3 hover:bg-primary hover:text-white transition-colors"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pixel-card bg-black/20 border-dashed border-primary/30 p-12 text-center">
                    <p className="font-retro text-2xl text-muted-foreground">Você ainda não possui keys. Compre uma abaixo!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black/20 border-y-4 border-primary/20">
        <div className="container mx-auto px-4">
          <div className="mb-20 text-center">
            <h2 className="font-pixel text-2xl md:text-4xl text-primary mb-6">POR QUE NOS ESCOLHER?</h2>
            <div className="h-1 w-24 bg-accent mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                title: "PAINEL EXCLUSIVO", 
                desc: "Uma interface que aparece diretamente no site do Lovable para você digitar seus comandos.",
              },
              { 
                title: "ZERO CRÉDITOS", 
                desc: "O Guto Pingo intercepta os prompts e envia para o sistema sem consumir seu saldo de créditos.",
              },
              { 
                title: "INSTALAÇÃO SIMPLES", 
                desc: "Extensão leve para navegadores Chromium (Chrome, Edge, Brave). Ativação em segundos.",
              },
              { 
                title: "SUPORTE 24/7", 
                desc: "Comunidade ativa e suporte técnico via Discord para qualquer dúvida sobre a ferramenta.",
              },
              { 
                title: "MÉTODO SEGURO", 
                desc: "Desenvolvido para mimetizar o comportamento humano, garantindo segurança total da sua conta.",
              },
              { 
                title: "ATUALIZAÇÕES", 
                desc: "Sempre atualizado com as últimas versões do Lovable para garantir o funcionamento constante.",
              },
            ].map((f, i) => (
              <div key={i} className="pixel-card p-8 group hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-14 h-14 mb-6 border-2 border-white flex items-center justify-center bg-black/40 group-hover:rotate-12 transition-transform overflow-hidden`}>
                  <img src="https://lovable-uploads.s3.us-west-2.amazonaws.com/13593003-8839-4467-84ec-607212456041.png" alt="Penguin Icon" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-pixel text-xs mb-4 text-white group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="font-retro text-2xl text-muted-foreground leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Compact & Clean */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-pixel text-2xl md:text-4xl text-primary mb-6">ESCOLHA SEU PLANO</h2>
              <p className="font-retro text-2xl text-muted-foreground">Acesso imediato para começar a criar hoje.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {PLANS.map((p) => (
                <div key={p.id} className={`pixel-card flex flex-col p-8 ${p.featured ? "border-accent shadow-[0_0_30px_rgba(233,69,96,0.3)] bg-black/60 scale-105 z-10" : "bg-black/40"}`}>
                  {p.featured && (
                    <div className="bg-accent text-white font-pixel text-[8px] py-1 px-4 self-center -mt-11 mb-6 border-2 border-white animate-pulse">
                      {p.badge}
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <span className="font-pixel text-[10px] text-muted-foreground block mb-2">{p.name}</span>
                    {p.priceNote && (
                      <span className="font-pixel text-[8px] text-muted-foreground line-through block mb-1">{p.priceNote}</span>
                    )}
                    <span className="font-pixel text-2xl text-primary block">{p.price}</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 font-retro text-xl text-muted-foreground">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    disabled={isBuying === p.priceId}
                    onClick={() => handleBuy(p.priceId)}
                    className={`w-full pixel-btn py-4 font-pixel text-[10px] ${p.featured ? "bg-accent text-white" : "bg-primary text-white"} disabled:opacity-50`}
                  >
                    {isBuying === p.priceId ? "PROCESSANDO..." : "COMPRAR AGORA"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-black/10 border-t-4 border-primary/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-pixel text-2xl md:text-4xl text-center mb-20 text-primary">PERGUNTAS FREQUENTES</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { q: "COMO FUNCIONA?", a: "Você compra uma key, ativa e pronto! Seus prompts no Lovable não gastam mais seus créditos." },
              { q: "O TESTE É GRÁTIS?", a: "Temos o plano de 5 reais para teste de 5 minutos, ideal para você ver que realmente funciona." },
              { q: "ENTREGA É RÁPIDA?", a: "Sim! Pagamento via PIX libera sua KEY instantaneamente no seu e-mail." },
              { q: "TEM SUPORTE?", a: "Sim, temos um canal exclusivo para clientes no Discord para ajudar com qualquer configuração." },
            ].map((item, i) => (
              <div key={i} className="pixel-card p-8 bg-black/30 border-primary/30">
                <h3 className="font-pixel text-[10px] text-accent mb-4">TERMINAL &gt; {item.q}</h3>
                <p className="font-retro text-2xl text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <div className="pixel-card max-w-5xl mx-auto p-12 bg-gradient-to-br from-primary/20 to-accent/20">
            <h2 className="font-pixel text-2xl md:text-5xl text-white mb-10">VIVA O PODER INFINITO</h2>
            <button className="pixel-btn bg-white text-black px-12 py-6 font-pixel text-sm hover:bg-primary hover:text-white transition-colors">
              PEGAR MINHA KEY AGORA
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-primary py-12 bg-black/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary border-2 border-white flex items-center justify-center overflow-hidden">
                 <img src="https://lovable-uploads.s3.us-west-2.amazonaws.com/13593003-8839-4467-84ec-607212456041.png" alt="Guto Pingo Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-pixel text-lg text-primary block">GUTO PINGO</span>
                <span className="font-retro text-xl text-muted-foreground">CRÉDITOS INFINITOS</span>
              </div>
            </div>
            <div className="flex gap-8 font-retro text-2xl">
              <a href="#" className="hover:text-primary">TWITTER</a>
              <a href="#" className="hover:text-primary">DISCORD</a>
              <a href="#" className="hover:text-primary">GITHUB</a>
            </div>
          </div>
          <div className="text-center font-retro text-xl text-muted-foreground/60 border-t border-white/10 pt-8">
            © 2026 Guto Pingo · TODOS OS DIREITOS RESERVADOS
          </div>
        </div>
      </footer>
    </div>
  );
}
