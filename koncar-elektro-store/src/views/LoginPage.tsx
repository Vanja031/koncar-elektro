'use client';

import { useState, type FormEvent } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { Checkbox } from '@/components/ui/checkbox';
import { ROUTES } from '@/lib/catalogUrls';

const loginBenefits = [
  {
    title: 'Praćenje porudžbina',
    description: 'Status isporuke i istorija kupovine na jednom mestu.',
  },
  {
    title: 'Ekskluzivne ponude',
    description: 'Prvi saznajte za akcije i popuste za registrovane kupce.',
  },
];

const LoginPage = () => {
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '').trim();

    if (!email || !password) {
      toast.error('Unesite e-mail i lozinku.');
      return;
    }

    toast.success('Uspešna prijava (demo)', {
      description: 'Povezivanje sa WordPress nalogom biće aktivirano u narednoj fazi.',
    });
  };

  return (
    <AuthShell
      title="Prijava"
      subtitle="Prijavite se na svoj nalog i nastavite kupovinu."
      asideTitle="Dobrodošli nazad"
      asideSubtitle="Prijavite se i nastavite kupovinu alata i opreme."
      benefits={loginBenefits}
      variant="login"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          label="E-mail adresa"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ime@primer.rs"
          required
        />

        <AuthField
          label="Lozinka"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Unesite lozinku"
          required
        />

        <div className="auth-form-row">
          <label className="auth-checkbox">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
            />
            <span>Zapamti me</span>
          </label>
          <button
            type="button"
            className="auth-link-button"
            onClick={() =>
              toast.message('Reset lozinke', {
                description: 'Funkcija će biti dostupna uz WordPress autentifikaciju.',
              })
            }
          >
            Zaboravili ste lozinku?
          </button>
        </div>

        <button type="submit" className="auth-submit">
          <LogIn className="w-4 h-4" />
          Prijavi se
        </button>

        <p className="auth-page-switch auth-page-switch--form">
          Nemate nalog?{' '}
          <Link to={ROUTES.register} className="auth-page-switch-link">
            Registrujte se
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
