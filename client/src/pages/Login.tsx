import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "../assets/logoEasyPharma.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", {
        username: username.toUpperCase(),
        password,
      });

      toast.success(`Bem-vindo, ${response.data.nome}!`);
      navigate("/dashboard");
    } catch (error) {
      setError("Usuário ou senha incorretos.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#073759] to-[#0a4c7a] px-4">
      <Card className="w-full max-w-sm bg-white shadow-2xl rounded-xl border border-slate-200">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex justify-center">
            <img src={logo} className="h-12object-contain" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Usuário"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              className={`h-11 bg-white border ${
                error ? "border-red-500" : "border-slate-300"
              } focus-visible:ring-2 ${
                error
                  ? "focus-visible:ring-red-500"
                  : "focus-visible:ring-[#073759]"
              } focus-visible:border-[#073759]`}
            />
            <Input
              type="password"
              placeholder="Senha"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className={`h-11 bg-white border ${
                error ? "border-red-500" : "border-slate-300"
              } focus-visible:ring-2 ${
                error
                  ? "focus-visible:ring-red-500"
                  : "focus-visible:ring-[#073759]"
              } focus-visible:border-[#073759]`}
            />
            {error && <p className="text-sm text-red-500 text-left">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#073759] hover:bg-[#0a4c7a] active:scale-[0.98] transition text-white font-medium disabled:opacity-70"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
