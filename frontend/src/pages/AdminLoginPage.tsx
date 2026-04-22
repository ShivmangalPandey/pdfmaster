import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navigation';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error('Invalid credentials');

      const { token } = await res.json();
      localStorage.setItem('admin_token', token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[400px] bg-white rounded-[32px] border border-zinc-200 p-10 shadow-2xl shadow-zinc-200/50">
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 bg-brand rounded-2xl flex items-center justify-center text-white">
              <Lock size={32} />
            </div>
          </div>
          
          <h1 className="text-2xl font-[900] text-center mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-zinc-500 text-center mb-8 text-sm">Secure access to the PDFMaster backend</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-6 text-sm outline-none focus:bg-white focus:border-brand transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-6 text-sm outline-none focus:bg-white focus:border-brand transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-brand text-white rounded-2xl font-[800] tracking-tight hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
