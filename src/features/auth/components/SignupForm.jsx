import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

export function SignupForm() {
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
    navigate(ROUTES.HOME);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Join Feedne</h2>
        <p className="text-neutral-500 text-sm mt-1">Start sharing your story today</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
      )}

      <Input label="Full Name" icon={User} placeholder="Alex Rivers" value={form.displayName} onChange={set('displayName')} required />
      <Input label="Username" placeholder="alexrivers" value={form.username} onChange={set('username')} required />
      <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={set('email')} required />
      <Input label="Password" type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={set('password')} required />

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
        Create Account
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary-500 font-semibold hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
