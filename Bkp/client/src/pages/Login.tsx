import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', { 
        username: username.toUpperCase(), 
        password 
      });
      toast.success(`Bem-vindo, ${response.data.nome}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Usuário ou senha incorretos.')
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <Card className="w-87.5">
        <CardHeader>
          <CardTitle>Pharma Dashboard - VMD</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input placeholder="Usuário" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} />
            <Input type="password" placeholder="Senha" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}