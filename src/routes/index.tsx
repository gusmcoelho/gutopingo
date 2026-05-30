import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
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
  Timer,
  Key,
  LogOut,
  User,
  Loader2,
  FileDown,
  Monitor,
  Settings,
  Puzzle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createCheckoutSession } from "@/lib/payments.functions";
import crypto from 'crypto';

// Removida função generateEmergencyKey do client-side por segurança e redundância.
// Chaves agora são ativadas exclusivamente via Webhook no servidor.




// ─── Types ───────────────────────────────────────────────────────────────────

interface LicenseKey {
  id: string;
  key: string;
  duration: string;
  expires_at: string | null;
  created_at: string;
}

interface UserType {
  id: string;
  email?: string;
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

type Language = 'pt' | 'en' | 'tr';

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
  pt: {
    nav: {
      admin: "ADMIN",
      logout: "SAIR",
      login: "ENTRAR",
      register: "CADASTRAR",
    },
    hero: {
      status: "EXTENSÃO ATIVA • LOVABLE DESBLOQUEADO",
      title1: "PROMPTS",
      title2: "ILIMITADOS",
      title3: "NO LOVABLE",
      subtitle: "Pare de travar no limite de prompts. A extensão do Guto Pingo desbloqueia criação infinita no Lovable com uma key simples.",
      buyBtn: "COMPRAR KEY",
      downloadBtn: "BAIXAR EXTENSÃO",
      discordBtn: "DISCORD",
    },
    userSection: {
      welcome: "BEM-VINDO",
      activeKeys: "SUAS KEYS ATIVAS",
      noKeys: "Você ainda não possui nenhuma key ativa. Escolha um plano abaixo!",
    },
    tutorial: {
      badge: "GUIA DE INSTALAÇÃO",
      title: "INSTALAR GUTO",
      steps: [
        "Extraia o arquivo GUTO.zip → vai aparecer a pasta dist",
        "Abra o Chrome e digite: chrome://extensions/",
        "Ative Modo do desenvolvedor (canto superior direito)",
        "Clique em Carregar sem compactação → selecione a pasta dist",
        "Clique no 🧩, abra o GUTO, cole sua chave e clique em Validar",
      ],
      important: "IMPORTANTE:",
      importantSteps: [
        "Sempre use o chat pela extensão GUTO, não pelo chat normal do Lovable",
        "Se a extensão não funcionar, vá na aba do seu projeto no Lovable e aperte F5",
        "Depois tente enviar novamente pela extensão",
        "Sempre deixe a aba do projeto aberta enquanto usa a extensão 🚀",
      ],
    },
    features: {
      tag: "// POR QUE USAR",
      title1: "VANTAGENS DO",
      title2: "GUTO PINGO",
      items: [
        { title: "Prompts Ilimitados", desc: "Sem travamentos. Sem limites. Crie o quanto quiser no Lovable." },
        { title: "Ativação Instantânea", desc: "Copie a key, cole na extensão e pronto. Funciona em segundos." },
        { title: "100% Seguro", desc: "Extensão auditada, sem acesso a dados pessoais ou código privado." },
        { title: "Alta Performance", desc: "Nenhum impacto no desempenho do Lovable ou do seu browser." },
        { title: "Multi-projeto", desc: "Uma key funciona em todos os seus projetos simultaneamente." },
        { title: "Suporte Técnico", desc: "Time de suporte ativo no Discord e WhatsApp para te ajudar." },
      ]
    },
    pricing: {
      tag: "// SELECT YOUR PLAN",
      title1: "ESCOLHA SEU",
      title2: "PLANO",
      subtitle: "Todos os planos desbloqueiam prompts ilimitados no Lovable",
      support: "Teve problemas com a compra ou keys? Entre no Discord e abra um ticket!",
      payPix: "PAGAR COM PIX",
      payStripe: "CARTÃO / OUTROS",
      back: "VOLTAR",
      buyBtn: ">> COMPRAR KEY",
      testBtn: ">> TESTAR AGORA",
    },
    footer: {
      rights: "© 2025 GUTOPINGO.COM • TODOS OS DIREITOS RESERVADOS",
      terms: "TERMOS",
      privacy: "PRIVACIDADE",
    }
  },
  en: {
    nav: {
      admin: "ADMIN",
      logout: "LOGOUT",
      login: "LOGIN",
      register: "REGISTER",
    },
    hero: {
      status: "EXTENSION ACTIVE • LOVABLE UNLOCKED",
      title1: "UNLIMITED",
      title2: "PROMPTS",
      title3: "ON LOVABLE",
      subtitle: "Stop getting stuck on prompt limits. The Guto Pingo extension unlocks infinite creation on Lovable with a simple key.",
      buyBtn: "BUY KEY",
      downloadBtn: "DOWNLOAD EXTENSION",
      discordBtn: "DISCORD",
    },
    userSection: {
      welcome: "WELCOME",
      activeKeys: "YOUR ACTIVE KEYS",
      noKeys: "You don't have any active keys yet. Choose a plan below!",
    },
    tutorial: {
      badge: "INSTALLATION GUIDE",
      title: "INSTALL GUTO",
      steps: [
        "Extract the GUTO.zip file → a 'dist' folder will appear",
        "Open Chrome and type: chrome://extensions/",
        "Enable Developer Mode (top right corner)",
        "Click 'Load unpacked' → select the 'dist' folder",
        "Click the 🧩, open GUTO, paste your key and click Validate",
      ],
      important: "IMPORTANT:",
      importantSteps: [
        "Always use the chat through the GUTO extension, not the normal Lovable chat",
        "If the extension doesn't work, go to your project tab in Lovable and press F5",
        "Then try sending again via the extension",
        "Always keep the project tab open while using the extension 🚀",
      ],
    },
    features: {
      tag: "// WHY USE IT",
      title1: "ADVANTAGES OF",
      title2: "GUTO PINGO",
      items: [
        { title: "Unlimited Prompts", desc: "No crashes. No limits. Create as much as you want on Lovable." },
        { title: "Instant Activation", desc: "Copy the key, paste it into the extension and you're done. Works in seconds." },
        { title: "100% Secure", desc: "Audited extension, no access to personal data or private code." },
        { title: "High Performance", desc: "No impact on Lovable or your browser performance." },
        { title: "Multi-project", desc: "One key works on all your projects simultaneously." },
        { title: "Technical Support", desc: "Active support team on Discord and WhatsApp to help you." },
      ]
    },
    pricing: {
      tag: "// SELECT YOUR PLAN",
      title1: "CHOOSE YOUR",
      title2: "PLAN",
      subtitle: "All plans unlock unlimited prompts on Lovable",
      support: "Having issues with your purchase or keys? Join our Discord and open a ticket!",
      payPix: "PAY WITH PIX",
      payStripe: "CARD / OTHERS",
      back: "BACK",
      buyBtn: ">> BUY KEY",
      testBtn: ">> TEST NOW",
    },
    footer: {
      rights: "© 2025 GUTOPINGO.COM • ALL RIGHTS RESERVED",
      terms: "TERMS",
      privacy: "PRIVACY",
    }
  },
  tr: {
    nav: {
      admin: "YÖNETİCİ",
      logout: "ÇIKIŞ YAP",
      login: "GİRİŞ YAP",
      register: "KAYIT OL",
    },
    hero: {
      status: "UZANTI AKTİF • LOVABLE KİLİDİ AÇILDI",
      title1: "SINIRSIZ",
      title2: "PROMPT",
      title3: "LOVABLE'DA",
      subtitle: "Prompt sınırlarına takılmayı bırakın. Guto Pingo uzantısı, basit bir anahtar ile Lovable'da sonsuz üretim sağlar.",
      buyBtn: "ANAHTAR SATIN AL",
      downloadBtn: "UZANTIYI İNDİR",
      discordBtn: "DISCORD",
    },
    userSection: {
      welcome: "HOŞ GELDİN",
      activeKeys: "AKTİF ANAHTARLARINIZ",
      noKeys: "Henüz aktif bir anahtarınız yok. Aşağıdan bir plan seçin!",
    },
    tutorial: {
      badge: "KURULUM KILAVUZU",
      title: "GUTO'YU KUR",
      steps: [
        "GUTO.zip dosyasını dışa aktarın → 'dist' klasörü görünecektir",
        "Chrome'u açın ve yazın: chrome://extensions/",
        "Geliştirici Modunu etkinleştirin (sağ üst köşe)",
        "Paketlenmemiş öğe yükle'ye tıklayın → 'dist' klasörünü seçin",
        "🧩 simgesine tıklayın, GUTO'yu açın, anahtarınızı yapıştırın ve Doğrula'ya tıklayın",
      ],
      important: "ÖNEMLİ:",
      importantSteps: [
        "Her zaman sohbeti normal Lovable sohbeti üzerinden değil, GUTO uzantısı üzerinden kullanın",
        "Uzantı çalışmazsa, Lovable'daki proje sekmenize gidin ve F5'e basın",
        "Ardından uzantı üzerinden tekrar göndermeyi deneyin",
        "Uzantıyı kullanırken her zaman proje sekmesini açık bırakın 🚀",
      ],
    },
    features: {
      tag: "// NEDEN KULLANMALI",
      title1: "GUTO PINGO'NUN",
      title2: "AVANTAJLARI",
      items: [
        { title: "Sınırsız Prompt", desc: "Donma yok. Sınır yok. Lovable'da istediğiniz kadar oluşturun." },
        { title: "Anında Aktivasyon", desc: "Anahtarı kopyalayın, uzantıya yapıştırın ve hazırsınız. Saniyeler içinde çalışır." },
        { title: "100% Güvenli", desc: "Denetlenmiş uzantı, kişisel verilere veya özel kodlara erişim yok." },
        { title: "Yüksek Performans", desc: "Lovable veya tarayıcı performansınız üzerinde hiçbir etkisi yoktur." },
        { title: "Çoklu Proje", desc: "Bir anahtar tüm projelerinizde aynı anda çalışır." },
        { title: "Teknik Destek", desc: "Size yardımcı olmak için Discord ve WhatsApp'ta aktif destek ekibi." },
      ]
    },
    pricing: {
      tag: "// PLANINIZI SEÇİN",
      title1: "PLANINIZI",
      title2: "SEÇİN",
      subtitle: "Tüm planlar Lovable'da sınırsız prompt kilidini açar",
      support: "Satın alma veya anahtarlarla ilgili sorun mu yaşıyorsunuz? Discord'a katılın ve bir bilet (ticket) açın!",
      payPix: "PIX İLE ÖDE",
      payStripe: "KART / DİĞERLERİ",
      back: "GERİ",
      buyBtn: ">> ANAHTAR SATIN AL",
      testBtn: ">> ŞİMDİ TEST ET",
    },
    footer: {
      rights: "© 2025 GUTOPINGO.COM • TÜM HAKLARI SAKLIDIR",
      terms: "ŞARTLAR",
      privacy: "GİZLİLİK",
    }
  }
};

// ─── Constants ────────────────────────────────────────────────────────────────

const getPlans = (lang: Language): Plan[] => [
  {
    id: "test",
    priceId: "price_1TbXLaDgmvJ4Q2O6idYoTXFJ",
    name: lang === 'pt' ? "Guto Pingo - 5 Minutos (Teste)" : lang === 'tr' ? "Guto Pingo - 5 Dakika (Test)" : "Guto Pingo - 5 Minutes (Test)",
    price: "R$ 5.00",
    priceNote: lang === 'pt' ? "acesso imediato" : lang === 'tr' ? "anında erişim" : "immediate access",
    duration: lang === 'pt' ? "5 Minutos" : lang === 'tr' ? "5 Dakika" : "5 Minutes",
    icon: <Timer size={20} />,
    featured: true,
    badge: lang === 'pt' ? "⭐ PRINCIPAL" : lang === 'tr' ? "⭐ ANA PLAN" : "⭐ MAIN",
    color: "#7c3aed",
    features: lang === 'pt' ? ["Acesso de 5 minutos", "Software as a service", "Business use"] : lang === 'tr' ? ["5 dakikalık erişim", "Hizmet olarak yazılım", "Ticari kullanım"] : ["5-minute access", "Software as a service", "Business use"],
  },
  {
    id: "1day",
    priceId: "price_1TbXLZDgmvJ4Q2O6Mxs8Ia3v",
    name: lang === 'pt' ? "Guto Pingo - 1 Dia" : lang === 'tr' ? "Guto Pingo - 1 Gün" : "Guto Pingo - 1 Day",
    price: "R$ 20.00",
    priceNote: lang === 'pt' ? "acesso imediato" : lang === 'tr' ? "anında erişim" : "immediate access",
    duration: lang === 'pt' ? "1 Dia" : lang === 'tr' ? "1 Gün" : "1 Day",
    icon: <Clock size={20} />,
    color: "#6d28d9",
    features: lang === 'pt' ? ["Acesso de 1 dia", "Software as a service", "Business use"] : lang === 'tr' ? ["1 günlük erişim", "Hizmet olarak yazılım", "Ticari kullanım"] : ["1-day access", "Software as a service", "Business use"],
  },
  {
    id: "1week",
    priceId: "price_1TbXLZDgmvJ4Q2O66me1RzwB",
    name: lang === 'pt' ? "Guto Pingo - 1 Semana" : lang === 'tr' ? "Guto Pingo - 1 Hafta" : "Guto Pingo - 1 Week",
    price: "R$ 45.00",
    priceNote: lang === 'pt' ? "acesso imediato" : lang === 'tr' ? "anında erişim" : "immediate access",
    duration: lang === 'pt' ? "1 Semana" : lang === 'tr' ? "1 Hafta" : "1 Week",
    icon: <Zap size={20} />,
    color: "#5b21b6",
    features: lang === 'pt' ? ["Acesso de 1 semana", "Software as a service", "Business use"] : lang === 'tr' ? ["1 haftalık erişim", "Hizmet olarak yazılım", "Ticari kullanım"] : ["1-week access", "Software as a service", "Business use"],
  },
  {
    id: "30days",
    priceId: "price_1TbXLYDgmvJ4Q2O6YrA9zxs3",
    name: lang === 'pt' ? "Guto Pingo - 30 Dias" : lang === 'tr' ? "Guto Pingo - 30 Gün" : "Guto Pingo - 30 Days",
    price: "R$ 100.00",
    priceNote: lang === 'pt' ? "acesso imediato" : lang === 'tr' ? "anında erişim" : "immediate access",
    duration: lang === 'pt' ? "30 Dias" : lang === 'tr' ? "30 Gün" : "30 Days",
    icon: <Globe size={20} />,
    color: "#4c1d95",
    features: lang === 'pt' ? ["Acesso de 30 dias", "Software as a service", "Business use"] : lang === 'tr' ? ["30 günlük erişim", "Hizmet olarak yazılım", "Ticari kullanım"] : ["30-day access", "Software as a service", "Business use"],
  },
  {
    id: "lifetime",
    priceId: "price_1TbXLYDgmvJ4Q2O61rlPDyRk",
    name: lang === 'pt' ? "Guto Pingo - Vitalício" : lang === 'tr' ? "Guto Pingo - Ömür Boyu" : "Guto Pingo - Lifetime",
    price: "R$ 169.99",
    priceNote: lang === 'pt' ? "PROMOÇÃO" : lang === 'tr' ? "PROMOSYON" : "PROMOTION",
    duration: lang === 'pt' ? "Para sempre" : lang === 'tr' ? "Sonsuza kadar" : "Forever",
    icon: <Infinity size={20} />,
    badge: lang === 'pt' ? "🔥 PROMO LIMITADA" : lang === 'tr' ? "🔥 SINIRLI PROMO" : "🔥 LIMITED PROMO",
    color: "#7c3aed",
    features: lang === 'pt' ? [
      "Acesso vitalício",
      "Software as a service",
      "Business use",
      "Atualizações grátis",
      "Prioridade máxima",
    ] : lang === 'tr' ? [
      "Ömür boyu erişim",
      "Hizmet olarak yazılım",
      "Ticari kullanım",
      "Ücretsiz güncellemeler",
      "Maksimum öncelik",
    ] : [
      "Lifetime access",
      "Software as a service",
      "Business use",
      "Free updates",
      "Maximum priority",
    ],
  },
];

// ─── Discord Component ────────────────────────────────────────────────────────

function DiscordIcon({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2758-3.68-.2758-5.4876 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.2259 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" fill={color}/>
    </svg>
  );
}

// ─── Pixel Components ────────────────────────────────────────────────────────



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
        <rect x="10" y="8" width="12" height="14" fill="#7c3aed" />
        <rect x="8" y="10" width="2" height="10" fill="#6d28d9" />
        <rect x="22" y="10" width="2" height="10" fill="#6d28d9" />
        <rect x="10" y="6" width="12" height="4" fill="#7c3aed" />
        <rect x="12" y="4" width="8" height="4" fill="#7c3aed" />
        <rect x="12" y="12" width="8" height="8" fill="#ddd6fe" />
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
        <rect x="14" y="12" width="4" height="2" fill="#f59e0b" />
        <rect x="15" y="14" width="2" height="1" fill="#d97706" />
        <rect x="11" y="22" width="4" height="2" fill="#f59e0b" />
        <rect x="17" y="22" width="4" height="2" fill="#f59e0b" />
        <rect x="10" y="23" width="2" height="1" fill="#d97706" />
        <rect x="20" y="23" width="2" height="1" fill="#d97706" />
        <rect x="8" y="12" width="2" height="6" fill="#5b21b6" />
        <rect x="22" y="12" width="2" height="6" fill="#5b21b6" />
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
      {copied ? <><Check size={14} /> COPIADO!</> : <><Copy size={14} /> COPIAR</>}
    </button>
  );
}

function KeyCard({ licKey, lang }: { licKey: LicenseKey; lang: Language }) {
  const isLifetime = licKey.duration.toLowerCase() === "vitalício" || licKey.duration.toLowerCase() === "lifetime" || licKey.duration.toLowerCase() === "para sempre" || licKey.duration.toLowerCase() === "forever";

  return (
    <div
      style={{
        background: "rgba(91,33,182,0.15)",
        border: "2px solid #7c3aed",
        padding: "20px 24px",
        position: "relative",
        imageRendering: "pixelated",
        boxShadow: "4px 4px 0 #4c1d95",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, background: "#a855f7" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, background: "#a855f7" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 8, height: 8, background: "#a855f7" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, background: "#a855f7" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Key size={14} color="#a855f7" />
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#a855f7", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {licKey.duration}
            </span>
            {isLifetime && (
              <span style={{ background: "#7c3aed", color: "#e9d5ff", fontSize: 10, padding: "2px 8px", fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.1em", border: "1px solid #a855f7" }}>
                ∞ LIFETIME
              </span>
            )}

          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: "#e9d5ff", letterSpacing: "0.12em", fontWeight: 700 }}>
            {licKey.key}
          </div>
        </div>
        <CopyButton text={licKey.key} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#a78bfa", fontFamily: "'Courier New', monospace" }}>
        <Clock size={11} />
        {isLifetime ? (lang === 'pt' ? "Nunca expira" : "Never expires") : `${lang === 'pt' ? "Expira em" : "Expires on"}: ${new Date(licKey.expires_at || "").toLocaleDateString()}`}

      </div>
    </div>
  );
}

function PlanCard({ plan, onBuy, loading, lang }: { plan: Plan; onBuy: (priceId: string, method: "stripe" | "pix") => void; loading: boolean; lang: Language }) {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const t = translations[lang].pricing;

  return (
    <div
      style={{
        background: plan.featured ? "rgba(124,58,237,0.25)" : "rgba(30,10,60,0.7)",
        border: plan.featured ? "2px solid #a855f7" : "2px solid #4c1d95",
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
        <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#1c1410", fontSize: 11, padding: "4px 16px", fontFamily: "'Courier New', monospace", fontWeight: 900, letterSpacing: "0.1em", whiteSpace: "nowrap", border: "2px solid #d97706" }}>
          {plan.badge}
        </div>
      )}

      {plan.featured && (
        <>
          <div style={{ position: "absolute", top: -2, left: -2, width: 10, height: 10, background: "#f59e0b" }} />
          <div style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, background: "#f59e0b" }} />
          <div style={{ position: "absolute", bottom: -2, left: -2, width: 10, height: 10, background: "#f59e0b" }} />
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, background: "#f59e0b" }} />
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ color: "#a855f7" }}>{plan.icon}</div>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 700, color: "#c4b5fd", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {plan.duration}
        </span>
      </div>

      <div style={{ marginBottom: 4 }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: plan.featured ? 32 : 26, fontWeight: 900, color: plan.featured ? "#e9d5ff" : "#c4b5fd", letterSpacing: "-0.02em" }}>
          {plan.price}
        </span>
      </div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#7c3aed", marginBottom: 20, letterSpacing: "0.05em" }}>
        {plan.priceNote}
      </div>

      <div style={{ flex: 1, marginBottom: 20 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontFamily: "'Courier New', monospace", fontSize: 12, color: "#ddd6fe" }}>
            <div style={{ width: 6, height: 6, background: "#a855f7", flexShrink: 0, imageRendering: "pixelated" }} />
            {f}
          </div>
        ))}
      </div>

      {showPaymentOptions ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => onBuy(plan.priceId, "pix")}
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px 0",
              background: "#22c55e",
              color: "#fff",
              border: "2px solid #16a34a",
              cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {t.payPix}
          </button>
          <button
            onClick={() => onBuy(plan.priceId, "stripe")}
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px 0",
              background: "#7c3aed",
              color: "#fff",
              border: "2px solid #a855f7",
              cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {t.payStripe}
          </button>
          <button
            onClick={() => setShowPaymentOptions(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#7c3aed",
              fontSize: 10,
              cursor: "pointer",
              marginTop: 4,
              fontFamily: "'Courier New', monospace",
            }}
          >
            {t.back}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPaymentOptions(true)}
          disabled={loading}
          style={{
            width: "100%",
            padding: plan.featured ? "14px 0" : "11px 0",
            background: plan.featured ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "transparent",
            color: plan.featured ? "#fff" : "#a855f7",
            border: plan.featured ? "2px solid #c4b5fd" : "2px solid #7c3aed",
            cursor: "pointer",
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            transition: "all 0.15s",
            imageRendering: "pixelated",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (plan.id === "test" ? t.testBtn : t.buyBtn)}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GutoPingoPage() {
  const [lang, setLang] = useState<Language>('pt');
  const [user, setUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const navigate = useNavigate();
  const searchParams: any = useSearch({ from: "/" });

  useEffect(() => {
    // Language detection
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) {
      setLang('pt');
    } else if (browserLang.startsWith('tr')) {
      setLang('tr');
    } else {
      setLang('en');
    }

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    const checkAdmin = async (userId: string) => {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
      setIsAdmin(data?.role === 'admin');
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        fetchLicenseKeys(session.user.id);
        checkAdmin(session.user.id);
        
        // Se o usuário acabou de voltar de um pagamento Pix de sucesso
        if (searchParams.success === "true" && searchParams.userId === session.user.id && searchParams.priceId) {
          handleSuccessPayment(session.user.id, searchParams.priceId);
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        fetchLicenseKeys(session.user.id);
        checkAdmin(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setLicenseKeys([]);
      }
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const t = translations[lang];
  const PLANS = getPlans(lang);

  const handleSuccessPayment = async (userId: string, priceId: string) => {
    console.log("Processando sucesso de pagamento:", { userId, priceId });
    // Agora o sistema aguarda o webhook para gerar a chave de forma segura.
    // Atualizamos a lista de keys do usuário após um curto delay para dar tempo ao webhook.
    setTimeout(() => fetchLicenseKeys(userId), 2000);
    setTimeout(() => fetchLicenseKeys(userId), 5000);
    
    // Limpa a URL para evitar re-processamento visual ao dar F5
    window.history.replaceState({}, '', '/');
  };

  const fetchLicenseKeys = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("license_keys")
        .select("*")
        .eq("user_id", userId);
      
      if (!error && data) {
        setLicenseKeys(data);
      }
    } catch (err) {
      console.error("Error fetching keys:", err);
    }
  };

  const handleBuy = async (priceId: string, method: "stripe" | "pix" = "stripe") => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }

    try {
      setLoadingCheckout(priceId);
      const result = await createCheckoutSession({ data: { priceId, method } });
      if (result && 'checkoutUrl' in result && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else if (result && 'error' in result) {
        alert(`${lang === 'pt' ? 'Erro no Checkout' : 'Checkout Error'}: ${result.error}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(lang === 'pt' ? "Erro ao iniciar o checkout. Tente novamente." : "Error starting checkout. Please try again.");
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleLogin = () => navigate({ to: "/auth" });
  const handleLogout = () => supabase.auth.signOut();

  return (
    <div style={{ minHeight: "100vh", background: "#09001a", fontFamily: "'Courier New', monospace", color: "#e9d5ff", overflowX: "hidden" }}>
      <Helmet>
        <title>Guto Pingo | Prompts Ilimitados Lovable Extension</title>
        <meta name="description" content="Desbloqueie prompts ilimitados no Lovable com a extensão Guto Pingo. Economize créditos, acelere seu desenvolvimento e crie sem limites. Ativação instantânea." />
        <meta name="keywords" content="lovable extension, lovable unlimited prompts, guto pingo, economia de creditos lovable, prompts infinitos lovable, guto pingo extension" />
        <link rel="canonical" href="https://gutopingo.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gutopingo.com/" />
        <meta property="og:title" content="Guto Pingo | Prompts Ilimitados Lovable Extension" />
        <meta property="og:description" content="Desbloqueie o poder total do Lovable. Prompts ilimitados e economia de créditos com a melhor extensão do mercado." />
        <meta property="og:image" content="https://zdxxhjjnkyboegerdoxl.supabase.co/storage/v1/object/public/assets/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://gutopingo.com/" />
        <meta property="twitter:title" content="Guto Pingo | Prompts Ilimitados Lovable Extension" />
        <meta property="twitter:description" content="Crie sem limites no Lovable. A extensão Guto Pingo economiza seus créditos e libera prompts infinitos." />
        <meta property="twitter:image" content="https://zdxxhjjnkyboegerdoxl.supabase.co/storage/v1/object/public/assets/og-image.png" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Guto Pingo Extension",
            "operatingSystem": "Chrome, Edge",
            "applicationCategory": "DeveloperApplication",
            "description": "Browser extension to unlock unlimited prompts and save credits in Lovable.",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "5.00",
              "highPrice": "169.99",
              "priceCurrency": "BRL"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "1250"
            }
          })}
        </script>
      </Helmet>

      <style>{`
        @keyframes pengFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes flicker { 0%, 100% { opacity: 1; } 95% { opacity: 1; } 96% { opacity: 0.4; } 97% { opacity: 1; } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3); } 50% { box-shadow: 0 0 40px rgba(168,85,247,0.6); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #09001a; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; }
        .plan-card:hover { transform: translateY(-4px) !important; }
        .feature-card:hover { border-color: #7c3aed !important; background: rgba(124,58,237,0.1) !important; }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(transparent, rgba(168,85,247,0.15), transparent)", animation: "scanline 8s linear infinite", pointerEvents: "none", zIndex: 9999 }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(9,0,26,0.95)" : "transparent", borderBottom: scrolled ? "1px solid #4c1d95" : "none", backdropFilter: scrolled ? "blur(10px)" : "none", transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PixelPenguin size={36} />
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "0.08em", color: "#e9d5ff", animation: "flicker 4s infinite" }}>
            GUTO<span style={{ color: "#a855f7" }}>PINGO</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, marginRight: 8 }}>
            {[
              { code: 'pt', flag: '🇧🇷' },
              { code: 'en', flag: '🇺🇸' },
              { code: 'tr', flag: '🇹🇷' }
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as Language)}
                style={{
                  padding: "4px 8px",
                  background: lang === l.code ? "rgba(124,58,237,0.2)" : "transparent",
                  border: lang === l.code ? "1px solid #7c3aed" : "1px solid transparent",
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s"
                }}
                title={l.code.toUpperCase()}
              >
                {l.flag}
              </button>
            ))}
          </div>
          {isAdmin && (
            <button 
              onClick={() => navigate({ to: "/admin" })}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "2px solid #a855f7", cursor: "pointer", fontSize: 11, fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.1em" }}
            >
              {t.nav.admin}
            </button>
          )}
          <a 
            href="https://discord.gg/kfezRBk7" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,58,237,0.1)", border: "2px solid #4c1d95", transition: "all 0.2s" }}
            title="Discord Support"
          >
            <DiscordIcon size={18} color="#a855f7" />
          </a>
          {user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, background: "#7c3aed", border: "2px solid #a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={16} color="#e9d5ff" />
                </div>
                <span style={{ fontSize: 12, color: "#c4b5fd" }} className="hidden md:block">
                  {user.email}
                </span>
              </div>
              <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "transparent", color: "#a855f7", border: "2px solid #4c1d95", cursor: "pointer", fontSize: 11, fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.1em" }}>
                <LogOut size={13} /> {t.nav.logout}
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleLogin} style={{ padding: "8px 20px", background: "transparent", color: "#a855f7", border: "2px solid #7c3aed", cursor: "pointer", fontSize: 12, fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.1em" }}>
                {t.nav.login}
              </button>
              <button onClick={() => navigate({ to: "/auth", search: { register: true } })} style={{ padding: "8px 20px", background: "#7c3aed", color: "#fff", border: "2px solid #a855f7", cursor: "pointer", fontSize: 12, fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.1em" }}>
                {t.nav.register}
              </button>
            </div>


          )}
        </div>
      </nav>

      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px", textAlign: "center", overflow: "hidden" }}>
        <PixelStars />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{ position: "relative", animation: "glow 3s ease-in-out infinite" }}>
              <PixelPenguin size={140} animated={true} angry={true} />
              <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
                {[16, 24, 20, 28, 16].map((h, i) => (
                  <div key={i} style={{ width: 8, height: h, background: i % 2 === 0 ? "#7c3aed" : "#a855f7", imageRendering: "pixelated", animation: `twinkle ${1 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, background: "#22c55e", animation: "twinkle 1s infinite" }} />
            <span style={{ fontSize: 11, color: "#a855f7", letterSpacing: "0.2em", fontWeight: 700 }}>{t.hero.status}</span>
          </div>

          <h1 style={{ fontSize: "clamp(36px, 8vw, 80px)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 20, color: "#f5f3ff", textShadow: "0 0 40px rgba(168,85,247,0.5)" }}>
            {t.hero.title1}<br /><span style={{ color: "#a855f7", textShadow: "0 0 20px rgba(168,85,247,0.8), 2px 2px 0 #4c1d95" }}>{t.hero.title2}</span><br /><span style={{ fontSize: "0.55em", color: "#c4b5fd" }}>{t.hero.title3}</span>
          </h1>

          <p style={{ fontSize: "clamp(14px, 2.5vw, 18px)", color: "#a78bfa", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7, letterSpacing: "0.02em" }}>
            {t.hero.subtitle}
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#pricing" style={{ padding: "16px 36px", background: "#7c3aed", color: "#fff", border: "2px solid #a855f7", textDecoration: "none", fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", boxShadow: "4px 4px 0 #4c1d95", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8 }}>
              <Key size={16} /> {t.hero.buyBtn}
            </a>
            <a href="https://zdxxhjjnkyboegerdoxl.supabase.co/storage/v1/object/public/assets/GUTO.zip" download style={{ padding: "16px 36px", background: "transparent", color: "#a855f7", border: "2px solid #7c3aed", textDecoration: "none", fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8 }}>
              <FileDown size={16} /> {t.hero.downloadBtn}
            </a>
            <a href="https://discord.gg/kfezRBk7" target="_blank" rel="noopener noreferrer" style={{ padding: "16px 36px", background: "rgba(124,58,237,0.1)", color: "#a855f7", border: "2px solid #4c1d95", textDecoration: "none", fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8 }}>
              <DiscordIcon size={18} color="#a855f7" /> {t.hero.discordBtn}
            </a>
          </div>


          <div style={{ marginTop: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#4c1d95", animation: "twinkle 2s ease-in-out infinite" }}>
            <span style={{ fontSize: 10, letterSpacing: "0.2em" }}>{lang === 'pt' ? 'SCROLL' : 'SCROLL DOWN'}</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      {user && (
        <section style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 20px", background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed", marginBottom: 16 }}>
              <PixelPenguin size={28} />
              <span style={{ fontSize: 12, color: "#a855f7", letterSpacing: "0.15em", fontWeight: 700 }}>
                {t.userSection.welcome}, {user.email?.split("@")[0].toUpperCase()}
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, color: "#e9d5ff", letterSpacing: "-0.01em" }}>
              {t.userSection.activeKeys.split(' ')[0]} <span style={{ color: "#a855f7" }}>{t.userSection.activeKeys.split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>

          {licenseKeys.length > 0 ? (
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: 64 }}>
              {licenseKeys.map((k) => <KeyCard key={k.id} licKey={k} lang={lang} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", background: "rgba(124,58,237,0.05)", border: "2px dashed #4c1d95", color: "#7c3aed", marginBottom: 64 }}>
              {t.userSection.noKeys}
            </div>
          )}

          {/* Tutorial Section */}
          <div style={{ background: "rgba(30,10,60,0.6)", border: "2px solid #4c1d95", padding: "40px", position: "relative" }}>
            <div style={{ position: "absolute", top: -14, left: 24, background: "#7c3aed", color: "#fff", fontSize: 10, padding: "4px 12px", fontFamily: "'Courier New', monospace", fontWeight: 900, letterSpacing: "0.1em", border: "2px solid #a855f7" }}>
              {t.tutorial.badge}
            </div>
            
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#e9d5ff", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <Settings className="text-primary" /> {t.tutorial.title}
            </h3>

            <div style={{ display: "grid", gap: 24 }}>
              {t.tutorial.steps.map((step, i) => {
                const icons = [<FileDown size={18} />, <Monitor size={18} />, <Settings size={18} />, <Puzzle size={18} />, <Check size={18} />];
                return (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, background: "#7c3aed", border: "2px solid #a855f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 900 }}>
                      {i + 1}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "#c4b5fd", lineHeight: 1.5 }}>
                      <span style={{ color: "#a855f7" }}>{icons[i]}</span>
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid #2e1065" }}>
              <h4 style={{ fontSize: 14, fontWeight: 900, color: "#f59e0b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={16} /> {t.tutorial.important}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                {t.tutorial.importantSteps.map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#a78bfa" }}>
                    <div style={{ width: 4, height: 4, background: "#f59e0b", marginTop: 8, flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 11, color: "#7c3aed", letterSpacing: "0.25em", fontWeight: 700 }}>{t.features.tag}</span>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: "#f5f3ff", marginTop: 8 }}>
            {t.features.title1} <span style={{ color: "#a855f7" }}>{t.features.title2}</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {t.features.items.map((f, i) => {
             const icons = [<Zap size={22} />, <Rocket size={22} />, <Shield size={22} />, <Cpu size={22} />, <Layers size={22} />, <Terminal size={22} />];
             return (
              <div key={i} className="feature-card" style={{ background: "rgba(20,5,45,0.8)", border: "2px solid #2e1065", padding: "24px 20px", position: "relative", transition: "all 0.2s", cursor: "default" }}>
                <div style={{ width: 44, height: 44, background: "rgba(124,58,237,0.2)", border: "2px solid #7c3aed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "#a855f7" }}>{icons[i]}</div>
                <h3 style={{ fontSize: 14, fontWeight: 900, color: "#e9d5ff", marginBottom: 8, letterSpacing: "0.05em" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "#7c3aed", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #7c3aed, transparent)" }} />
              </div>
            );
          })}
        </div>
      </section>

      <section id="pricing" style={{ padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`, backgroundSize: "20px 20px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, color: "#7c3aed", letterSpacing: "0.25em", fontWeight: 700 }}>{t.pricing.tag}</span>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: "#f5f3ff", marginTop: 8, marginBottom: 12 }}>
              {t.pricing.title1} <span style={{ color: "#a855f7" }}>{t.pricing.title2}</span>
            </h2>
            <p style={{ color: "#6d28d9", fontSize: 13, letterSpacing: "0.05em" }}>{t.pricing.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, alignItems: "stretch" }}>
            {PLANS.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onBuy={handleBuy} 
                loading={loadingCheckout === plan.priceId}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #2e1065", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <PixelPenguin size={32} />
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.1em" }}>GUTO<span style={{ color: "#a855f7" }}>PINGO</span></span>
        </div>
        <p style={{ fontSize: 11, color: "#4c1d95", letterSpacing: "0.1em" }}>{t.footer.rights}</p>
        
        {/* Hidden SEO Keywords for Crawler */}
        <div style={{ opacity: 0, height: 0, pointerEvents: "none" }}>
          <h2>Lovable AI Unlimited Prompts Extension</h2>
          <p>Guto Pingo is the best way to save credits on Lovable.dev. Get unlimited access, faster development, and premium keys.</p>
          <p>Como ter prompts infinitos no Lovable? Guto Pingo Extension é a resposta. Economia de créditos e alta performance para desenvolvedores.</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
          <a href="https://discord.gg/kfezRBk7" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#a855f7", textDecoration: "none", letterSpacing: "0.15em", fontWeight: 700 }}>
            <DiscordIcon size={14} color="#a855f7" /> DISCORD
          </a>
          {[t.footer.terms, t.footer.privacy].map((link) => (
            <a key={link} href="#" style={{ fontSize: 10, color: "#6d28d9", textDecoration: "none", letterSpacing: "0.15em" }}>{link}</a>
          ))}
        </div>

      </footer>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: GutoPingoPage,
});
