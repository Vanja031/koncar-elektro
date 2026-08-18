'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import { ArrowRight, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { Checkbox } from '@/components/ui/checkbox';
import { ROUTES } from '@/lib/catalogUrls';
import { AuthClientError, useAuth } from '@/context/AuthContext';

const registerBenefits = [
  {
    title: 'Praćenje porudžbina',
    description: 'Status isporuke i istorija kupovine na jednom mestu.',
  },
  {
    title: 'Ekskluzivne ponude',
    description: 'Prvi saznajte za akcije i popuste za registrovane kupce.',
  },
];

const RegisterPage = () => {
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate(ROUTES.home, { replace: true });
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const firstName = String(form.get('firstName') ?? '').trim();
    const lastName = String(form.get('lastName') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');

    if (!firstName || !lastName || !email || !password) {
      toast.error('Popunite sva obavezna polja.');
      return;
    }

    if (password.length < 8) {
      toast.error('Lozinka mora imati najmanje 8 karaktera.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Lozinke se ne poklapaju.');
      return;
    }

    if (!acceptTerms) {
      toast.error('Potrebno je prihvatiti uslove kupovine.');
      return;
    }

    setBusy(true);
    try {
      await register({ firstName, lastName, email, password, phone });
      toast.success(newsletter ? 'Nalog je kreiran. Dobrodošli!' : 'Nalog je kreiran.');
      navigate(ROUTES.home);
    } catch (error) {
      const message = error instanceof AuthClientError ? error.message : 'Registracija nije uspela.';
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Registracija"
      subtitle="Kreirajte nalog i iskoristite sve pogodnosti online kupovine."
      asideTitle="Pridružite se"
      asideSubtitle="Postanite deo Končar zajednice i kupujte pametnije."
      benefits={registerBenefits}
      variant="register"
      footer={
        <p className="auth-page-switch">
          Već imate nalog?{' '}
          <Link to={ROUTES.login} className="auth-page-switch-link">
            Prijavite se
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      }
    >
      <form className="auth-form auth-form--register" onSubmit={handleSubmit} noValidate>
        <div className="auth-form-grid">
          <AuthField
            label="Ime"
            name="firstName"
            autoComplete="given-name"
            placeholder="Marko"
            required
          />
          <AuthField
            label="Prezime"
            name="lastName"
            autoComplete="family-name"
            placeholder="Petrović"
            required
          />
        </div>

        <div className="auth-form-grid">
          <AuthField
            label="E-mail adresa"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ime@primer.rs"
            required
          />
          <AuthField
            label="Telefon"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="06X XXX XX XX"
          />
        </div>

        <div className="auth-form-grid">
          <AuthField
            label="Lozinka"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Najmanje 8 karaktera"
            required
          />
          <AuthField
            label="Potvrdite lozinku"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Ponovite lozinku"
            required
          />
        </div>

        <div className="auth-form-checks">
          <label className="auth-checkbox auth-checkbox--block">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(v) => setAcceptTerms(v === true)}
            />
            <span>
              Prihvatam{' '}
              <Link to="/uslovi-kupovine" className="auth-inline-link">
                uslove kupovine
              </Link>{' '}
              i{' '}
              <Link to="/politika-privatnosti" className="auth-inline-link">
                politiku privatnosti
              </Link>
            </span>
          </label>

          <label className="auth-checkbox auth-checkbox--block">
            <Checkbox
              id="newsletter"
              checked={newsletter}
              onCheckedChange={(v) => setNewsletter(v === true)}
            />
            <span>Želim da primam obaveštenja o akcijama i novim proizvodima</span>
          </label>
        </div>

        <button type="submit" className="auth-submit" disabled={busy}>
          <UserPlus className="w-4 h-4" />
          {busy ? 'Kreiranje...' : 'Kreiraj nalog'}
        </button>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
