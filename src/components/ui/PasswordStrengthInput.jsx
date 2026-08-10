import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Lock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PasswordStrengthInput({ 
  value = '', 
  onChange, 
  label = 'Password', 
  placeholder = '••••••••', 
  onValidityChange, 
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false);

  const criteria = [
    { id: 'length', label: 'At least 8 characters', check: (v) => v.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter', check: (v) => /[A-Z]/.test(v) },
    { id: 'lowercase', label: 'One lowercase letter', check: (v) => /[a-z]/.test(v) },
    { id: 'number', label: 'One number', check: (v) => /[0-9]/.test(v) },
    { id: 'special', label: 'One special character', check: (v) => /[^A-Za-z0-9]/.test(v) },
  ];

  const metCount = criteria.filter((c) => c.check(value)).length;
  const isAllMet = metCount === criteria.length;

  useEffect(() => {
    onValidityChange?.(isAllMet);
  }, [isAllMet, onValidityChange]);

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  if (metCount === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-green-500';
  } else if (metCount >= 3) {
    strengthLabel = 'Good';
    strengthColor = 'bg-blue-500';
  } else if (metCount >= 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-yellow-500';
  } else if (metCount === 0) {
    strengthColor = 'bg-neutral-200 dark:bg-neutral-700';
    strengthLabel = '';
  }

  return (
    <div className="space-y-2">
      <Input
        label={label}
        type="password"
        icon={Lock}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {(isFocused || value.length > 0) && (
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3 transition-all animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-500">Password Strength</span>
            <span className={cn('transition-colors', metCount === 5 ? 'text-green-500' : 'text-neutral-700 dark:text-neutral-300')}>
              {strengthLabel}
            </span>
          </div>

          <div className="flex gap-1 h-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  'flex-1 rounded-full transition-all duration-300',
                  level <= metCount ? strengthColor : 'bg-neutral-200 dark:bg-neutral-800'
                )}
              />
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            {criteria.map((c) => {
              const isMet = c.check(value);
              return (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  {isMet ? (
                    <Check size={14} className="text-green-500" strokeWidth={3} />
                  ) : (
                    <X size={14} className="text-neutral-300 dark:text-neutral-600" />
                  )}
                  <span className={isMet ? 'text-neutral-700 dark:text-neutral-200' : 'text-neutral-400 dark:text-neutral-500 transition-colors'}>
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
