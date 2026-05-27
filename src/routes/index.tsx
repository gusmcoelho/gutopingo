import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, Zap, Shield, Coins, Sparkles, Download, ExternalLink, MessageSquare, Gamepad2, MousePointer2, User } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
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
               <span className="font-pixel text-white text-lg">L</span>
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-pixel text-xl text-primary tracking-tighter uppercase">Lovable<span className="text-accent">.</span>Keys</span>

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
          <Sparkles className="w-3 h-3" /> NOVO: MÉTODO ATUALIZADO 2024
        </div>

        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="float glow relative z-10 p-4 border-4 border-primary bg-card/80">
            <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-muted/50 overflow-hidden relative">
              <Gamepad2 className="w-24 h-24 text-primary/40 absolute animate-pulse" />
              <div className="font-pixel text-primary text-xs text-center p-4">
                LOVABLE KEYS<br/>CRÉDITOS INFINITOS
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 border-4 border-accent bg-accent/20 backdrop-blur animate-spin-slow" />
        </div>

        <h1 className="font-pixel text-3xl md:text-6xl mb-8 leading-tight text-primary" style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.5), 8px 8px 0px oklch(0.3 0.2 320)" }}>
          CRÉDITOS<br />INFINITOS<br />NO LOVABLE
        </h1>

        <p className="font-retro text-2xl md:text-4xl max-w-3xl mx-auto mb-12 text-muted-foreground leading-relaxed">
          Domine o Lovable sem se preocupar com limites. <br className="hidden md:block" />
          Nossas <span className="text-primary font-bold">KEYS</span> são o seu passaporte para o desenvolvimento ilimitado.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg">
          <a href="#pricing" className="pixel-btn bg-primary text-primary-foreground px-10 py-5 font-pixel text-sm flex items-center justify-center gap-3 group">
            <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" /> 
            COMPRAR MINHA KEY
          </a>
          <a href="#pricing" className="pixel-btn bg-white text-black px-10 py-5 font-pixel text-sm flex items-center justify-center gap-3">
            <MousePointer2 className="w-5 h-5" /> 
            TESTE GRÁTIS
          </a>
        </div>

        <div className="mt-16 flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <span className="font-pixel text-[10px]">PIX AUTOMÁTICO</span>
           <span className="font-pixel text-[10px]">ENTREGA IMEDIATA</span>
           <span className="font-pixel text-[10px]">SUPORTE 24H</span>
        </div>
      </section>

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
                icon: Coins, 
                title: "BYPASS DE CRÉDITOS", 
                desc: "Esqueça os limites. Nossa tecnologia permite que você continue criando sem gastar seus créditos preciosos.",
                color: "text-yellow-400"
              },
              { 
                icon: Zap, 
                title: "TURBO ENGINE", 
                desc: "Otimização de rede que acelera as respostas do Lovable em até 40%. Menos espera, mais código.",
                color: "text-cyan-400"
              },
              { 
                icon: Shield, 
                title: "GHOST MODE", 
                desc: "Navegação privada e segura. Sua atividade e tokens permanecem 100% no seu dispositivo.",
                color: "text-green-400"
              },
              { 
                icon: MessageSquare, 
                title: "SUPORTE 24/7", 
                desc: "Comunidade ativa e suporte técnico via Discord para qualquer dúvida técnica ou sugestão.",
                color: "text-purple-400"
              },
              { 
                icon: Download, 
                title: "AUTO-EXPORT", 
                desc: "Exporte seus projetos com um clique, já estruturados e prontos para o deploy em seu próprio servidor.",
                color: "text-orange-400"
              },
              { 
                icon: ExternalLink, 
                title: "MULTI-BROWSER", 
                desc: "Compatível com Chrome, Edge, Brave e qualquer navegador que suporte extensões Chromium.",
                color: "text-blue-400"
              },
            ].map((f, i) => (
              <div key={i} className="pixel-card p-8 group hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-14 h-14 mb-6 border-2 border-white flex items-center justify-center bg-black/40 group-hover:rotate-12 transition-transform`}>
                  <f.icon className={`w-8 h-8 ${f.color}`} />
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

            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {[
                { tier: "TESTE", price: "R$ 5", features: ["5 Minutos de teste", "Uso ilimitado no tempo", "Entrega instantânea"] },
                { tier: "START", price: "R$ 2", features: ["15 Minutos de uso", "Acesso total", "Suporte básico"] },
                { tier: "POWER", price: "R$ 10", features: ["1 Hora de uso", "Sem limites de prompts", "Suporte prioritário"] },
              ].map((p, i) => (
                <div key={i} className={`pixel-card flex flex-col p-8 ${i === 1 ? "border-accent shadow-[0_0_30px_rgba(233,69,96,0.3)] bg-black/60 scale-105 z-10" : "bg-black/40"}`}>
                  {i === 1 && (
                    <div className="bg-accent text-white font-pixel text-[8px] py-1 px-4 self-center -mt-11 mb-6 border-2 border-white">
                      MAIS POPULAR
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <span className="font-pixel text-[10px] text-muted-foreground block mb-2">{p.tier}</span>
                    <span className="font-pixel text-3xl text-primary block">{p.price}</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 font-retro text-xl text-muted-foreground">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full pixel-btn py-4 font-pixel text-[10px] ${p.popular ? "bg-accent text-white" : "bg-primary text-white"}`}>
                    SELECIONAR
                  </button>
                </div>
              ))}
            <div className="grid md:grid-cols-3 gap-8 items-stretch mt-12">
              {[
                { tier: "DAILY", price: "R$ 35", features: ["1 Dia de acesso", "Suporte 24h", "Uso ilimitado"] },
                { tier: "MONTHLY", price: "R$ 150", features: ["30 Dias de acesso", "Updates garantidos", "Melhor custo-benefício"] },
                { tier: "LIFETIME", price: "R$ 350", features: ["Acesso Vitalício", "Tudo liberado", "Tag VIP Permanente"] },
              ].map((p, i) => (
                <div key={i} className="pixel-card flex flex-col p-8 bg-black/40">
                  <div className="text-center mb-8">
                    <span className="font-pixel text-[10px] text-muted-foreground block mb-2">{p.tier}</span>
                    <span className="font-pixel text-3xl text-primary block">{p.price}</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 font-retro text-xl text-muted-foreground">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full pixel-btn py-4 font-pixel text-[10px] bg-primary text-white">
                    COMPRAR AGORA
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
              <div className="w-12 h-12 bg-primary border-2 border-white flex items-center justify-center">
                 <span className="font-pixel text-white text-xl">L</span>
              </div>
              <div>
                <span className="font-pixel text-lg text-primary block">Lovable Keys</span>
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
            © 2026 Lovable Keys · TODOS OS DIREITOS RESERVADOS
          </div>
        </div>
      </footer>
    </div>
  );
}
