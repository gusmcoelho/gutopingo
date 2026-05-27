import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Zap, Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert("Conta criada com sucesso!");
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com Google.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0f2e] text-white scanlines flex items-center justify-center p-4">
      <div className="pixel-card w-full max-w-md p-8 bg-black/60 relative">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="absolute -top-12 left-0 text-primary font-pixel text-[10px] flex items-center gap-2 hover:opacity-80"
        >
          <ArrowLeft className="w-4 h-4" /> VOLTAR
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary border-4 border-white mx-auto flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-pixel text-xl text-primary mb-2">
            {isLogin ? "LOGIN TERMINAL" : "REGISTRO PILOTO"}
          </h1>
          <p className="font-retro text-xl text-muted-foreground">
            {isLogin ? "Entre para acessar sua dashboard." : "Crie sua conta para adquirir keys."}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/20 border-2 border-destructive p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="font-retro text-lg text-destructive-foreground">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="font-pixel text-[10px] text-muted-foreground block uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border-2 border-primary/30 p-4 pl-12 font-retro text-xl focus:border-primary outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-pixel text-[10px] text-muted-foreground block uppercase">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border-2 border-primary/30 p-4 pl-12 font-retro text-xl focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full pixel-btn bg-primary text-white py-4 font-pixel text-xs flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "ACESSAR" : "CRIAR CONTA")}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-primary/20"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#1a0f2e] px-4 font-pixel text-muted-foreground">Ou continue com</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full pixel-btn bg-white text-black py-4 font-pixel text-xs flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          GOOGLE
        </button>

        <p className="mt-8 text-center font-retro text-xl">
          <span className="text-muted-foreground">
            {isLogin ? "Não tem uma conta?" : "Já possui conta?"}
          </span>{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Registre-se agora" : "Faça login"}
          </button>
        </p>
      </div>
    </div>
  );
}
