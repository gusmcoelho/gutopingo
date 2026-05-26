import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield, Zap, Sparkles, Download, Key, CreditCard } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/5 py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <img src="/images/guto-hero.png" alt="GUTO" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">GUTO</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Preços</a>
            <Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Adquirir Key
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/guto-background.png" 
            alt="Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-3 h-3" />
            <span>NOVA EXTENSÃO GUTO</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-white via-primary to-primary-foreground bg-clip-text text-transparent">
            Use Lovable sem gastar <br className="hidden md:block" /> seus créditos.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A extensão GUTO permite que você crie aplicações incríveis no Lovable economizando seus recursos. Fácil de usar, seguro e extremamente rápido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-8 text-lg font-bold">
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 text-lg font-bold border-white/10 hover:bg-white/5">
              Como Funciona
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher o GUTO?</h2>
            <p className="text-muted-foreground">A melhor solução para desenvolvedores Lovable.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<CreditCard className="w-6 h-6 text-primary" />}
              title="Economia Total"
              description="Acesse as ferramentas do Lovable sem descontar dos seus créditos oficiais da plataforma."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Velocidade Instantânea"
              description="Nenhuma lentidão. A extensão funciona perfeitamente em background sem afetar sua produtividade."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="100% Seguro"
              description="Sua conta e seus dados estão protegidos. Utilizamos os melhores padrões de segurança."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos e Keys</h2>
            <p className="text-muted-foreground">Escolha o plano que melhor se adapta à sua necessidade.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              tier="Semanal"
              price="R$ 29,90"
              features={["Acesso ilimitado 7 dias", "Suporte 24/7", "Atualizações constantes"]}
            />
            <PricingCard 
              tier="Mensal"
              price="R$ 89,90"
              popular={true}
              features={["Acesso ilimitado 30 dias", "Suporte VIP", "Acesso ao grupo privado", "Atualizações antecipadas"]}
            />
            <PricingCard 
              tier="Vitalício"
              price="R$ 299,90"
              features={["Acesso para sempre", "Suporte Prioritário", "Todos os benefícios futuros", "Sem mensalidade"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
               <img src="/images/guto-hero.png" alt="GUTO" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold">GUTO Extension</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 GUTO. Todos os direitos reservados.
          </div>
          <div className="flex gap-4">
             {/* Redes sociais placeholder */}
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="glass-card border-none bg-white/5 hover:bg-white/10 transition-all duration-300">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({ tier, price, features, popular = false }: { tier: string, price: string, features: string[], popular?: boolean }) {
  return (
    <Card className={`relative glass-card border-none flex flex-col ${popular ? 'bg-primary/5 ring-2 ring-primary' : 'bg-white/5'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          MAIS POPULAR
        </div>
      )}
      <CardHeader className="text-center">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2 block">{tier}</span>
        <CardTitle className="text-4xl font-bold">{price}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-4 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className={`w-full rounded-full font-bold py-6 ${popular ? 'bg-primary hover:bg-primary/90' : 'bg-white/10 hover:bg-white/20'}`}>
          Comprar Agora
        </Button>
      </CardContent>
    </Card>
  );
}
