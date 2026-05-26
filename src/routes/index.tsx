import { createFileRoute } from "@tanstack/react-router";
import { Check, Zap, Shield, Coins, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen text-foreground scanlines relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: "url(/images/guto-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-background/70" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b-4 border-primary bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/guto-hero.png" alt="GUTO" className="w-12 h-12 object-cover" style={{ imageRendering: "pixelated" }} />
            <span className="font-pixel text-xl text-primary">GUTO</span>
          </div>
          <div className="hidden md:flex gap-6 items-center font-retro text-xl">
            <a href="#features" className="hover:text-primary transition">FEATURES</a>
            <a href="#pricing" className="hover:text-primary transition">KEYS</a>
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
          </div>
          <a href="#pricing" className="pixel-btn bg-primary text-primary-foreground px-4 py-2 font-pixel text-xs">
            BUY KEY
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 border-2 border-primary px-3 py-1 mb-8 font-pixel text-[10px] text-primary">
          <Sparkles className="w-3 h-3" /> EXTENSÃO PIXEL POWER
        </div>

        <div className="float glow mb-8">
          <img
            src="/images/guto-hero.png"
            alt="GUTO Penguin"
            className="w-64 h-64 md:w-80 md:h-80 mx-auto object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        <h1 className="font-pixel text-2xl md:text-5xl mb-6 text-primary" style={{ textShadow: "4px 4px 0 oklch(0.3 0.2 320)" }}>
          USE LOVABLE<br />SEM GASTAR<br />CRÉDITOS
        </h1>

        <p className="font-retro text-2xl md:text-3xl max-w-2xl mx-auto mb-10 text-muted-foreground">
          A extensão GUTO desbloqueia o poder do Lovable. Crie projetos infinitos sem queimar seus créditos. Pixel power ativado.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#pricing" className="pixel-btn bg-primary text-primary-foreground px-8 py-4 font-pixel text-sm">
            COMPRAR KEY
          </a>
          <a href="#features" className="pixel-btn bg-secondary text-secondary-foreground px-8 py-4 font-pixel text-sm">
            VER MAIS
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t-4 border-primary/30">
        <div className="container mx-auto px-4">
          <h2 className="font-pixel text-2xl md:text-3xl text-center mb-16 text-primary">
            PODERES DO GUTO
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Coins, title: "ZERO CRÉDITOS", desc: "Nunca mais se preocupe com créditos. Use o Lovable à vontade." },
              { icon: Zap, title: "VELOCIDADE 8-BIT", desc: "Performance instantânea sem lag. Direto na sua extensão." },
              { icon: Shield, title: "SEGURO", desc: "Sua conta protegida com criptografia pixel-perfect." },
            ].map((f, i) => (
              <div key={i} className="pixel-card p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <f.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-pixel text-sm mb-3 text-primary">{f.title}</h3>
                <p className="font-retro text-xl text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t-4 border-primary/30">
        <div className="container mx-auto px-4">
          <h2 className="font-pixel text-2xl md:text-3xl text-center mb-4 text-primary">
            ESCOLHA SUA KEY
          </h2>
          <p className="font-retro text-2xl text-center mb-16 text-muted-foreground">Insira a moeda. Continue a jornada.</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { tier: "STARTER", price: "R$ 29", period: "/SEMANA", features: ["Acesso 7 dias", "Suporte básico", "Updates"] },
              { tier: "PRO", price: "R$ 89", period: "/MÊS", popular: true, features: ["Acesso 30 dias", "Suporte VIP", "Grupo privado", "Early access"] },
              { tier: "LEGEND", price: "R$ 299", period: "/VITALÍCIO", features: ["Para sempre", "Suporte prioritário", "Todos benefícios", "Sem mensalidade"] },
            ].map((p, i) => (
              <div key={i} className={`pixel-card p-6 relative ${p.popular ? "scale-105" : ""}`}>
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-pixel text-[10px] px-3 py-1 border-2 border-foreground">
                    POPULAR
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="font-pixel text-sm text-accent mb-3">{p.tier}</div>
                  <div className="font-pixel text-3xl text-primary">{p.price}</div>
                  <div className="font-retro text-xl text-muted-foreground">{p.period}</div>
                </div>
                <ul className="space-y-3 mb-6 font-retro text-xl">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full pixel-btn bg-primary text-primary-foreground py-3 font-pixel text-xs">
                  ADQUIRIR
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 border-t-4 border-primary/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-pixel text-2xl md:text-3xl text-center mb-16 text-primary">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Como funciona a extensão?", a: "Instale, ative com sua key e use o Lovable normalmente. O GUTO cuida do resto." },
              { q: "É seguro?", a: "Sim! Não armazenamos suas credenciais. Tudo roda local no seu navegador." },
              { q: "Como recebo a key?", a: "Após o pagamento, sua key é enviada por email instantaneamente." },
              { q: "Funciona em qual navegador?", a: "Chrome, Edge, Brave e qualquer navegador baseado em Chromium." },
            ].map((item, i) => (
              <div key={i} className="pixel-card p-6">
                <h3 className="font-pixel text-xs text-primary mb-3">› {item.q}</h3>
                <p className="font-retro text-xl text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-primary py-8 mt-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/guto-hero.png" alt="GUTO" className="w-10 h-10 object-cover" style={{ imageRendering: "pixelated" }} />
            <span className="font-pixel text-sm text-primary">GUTO</span>
          </div>
          <div className="font-retro text-lg text-muted-foreground">
            © 2026 GUTO EXTENSION · PIXEL POWER ACTIVATED
          </div>
        </div>
      </footer>
    </div>
  );
}
