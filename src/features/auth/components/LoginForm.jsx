import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

export function LoginForm() {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: 'demo@feedne.com', password: 'password' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form);
    navigate(ROUTES.HOME);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Welcome back</h2>
        <p className="text-neutral-500 text-sm mt-1">Sign in to your Feedne account</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        icon={Mail}
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        required
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          icon={Lock}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        <button
          type="button"
          onClick={() => setShowPw((s) => !s)}
          className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
        Sign In
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Don't have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="text-primary-500 font-semibold hover:underline">
          Sign up
        </Link>
      </p>

      <p className="text-center text-xs text-neutral-400">
        Demo credentials pre-filled — just click Sign In
      </p>
    </form>
  );
}
