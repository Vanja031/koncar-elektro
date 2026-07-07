import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  endAdornment?: ReactNode;
};

export const AuthField = ({
  label,
  hint,
  error,
  type = 'text',
  id,
  wrapperClassName,
  endAdornment,
  ...inputProps
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <label className={cn('auth-field', wrapperClassName)} htmlFor={inputId}>
      <span className="auth-field-label">{label}</span>
      <div className="auth-field-control">
        <input
          id={inputId}
          type={inputType}
          className={cn(
            'auth-field-input',
            isPassword && 'pr-10',
            error && 'auth-field-input--error',
          )}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-field-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {endAdornment}
      </div>
      {hint && !error && <span className="auth-field-hint">{hint}</span>}
      {error && <span className="auth-field-error">{error}</span>}
    </label>
  );
};
