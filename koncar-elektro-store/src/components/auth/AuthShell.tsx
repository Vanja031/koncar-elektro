import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import agentAvatar from '@/assets/agent-avatar.png';
import { cn } from '@/lib/utils';

type Benefit = {
  title: string;
  description: string;
};

type Props = {
  title: string;
  subtitle: string;
  asideTitle: string;
  asideSubtitle?: string;
  benefits: Benefit[];
  variant?: 'login' | 'register';
  children: ReactNode;
  footer?: ReactNode;
};

const AuthAside = ({
  asideTitle,
  asideSubtitle,
  benefits,
}: Pick<Props, 'asideTitle' | 'asideSubtitle' | 'benefits'>) => (
  <>
    <div className="auth-page-aside-glow auth-page-aside-glow--one" />
    <div className="auth-page-aside-glow auth-page-aside-glow--two" />

    <img src={agentAvatar} alt="" className="auth-page-aside-figure" loading="lazy" />

    <div className="auth-page-aside-shell">
      <header className="auth-page-aside-header">
        <span className="auth-page-aside-kicker">Končar Elektro</span>
        <h2 className="auth-page-aside-hero">{asideTitle}</h2>
        {asideSubtitle && <p className="auth-page-aside-lead">{asideSubtitle}</p>}
      </header>

      <div className="auth-page-aside-lower">
        <ul className="auth-page-benefits">
          {benefits.map((item) => (
            <li key={item.title} className="auth-page-benefit">
              <span className="auth-page-benefit-icon">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </span>
              <div>
                <p className="auth-page-benefit-title">{item.title}</p>
                <p className="auth-page-benefit-desc">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </>
);

export const AuthShell = ({
  title,
  subtitle,
  asideTitle,
  asideSubtitle,
  benefits,
  variant = 'login',
  children,
  footer,
}: Props) => (
  <ShopLayout>
    <section className="auth-page">
      <div className={cn('auth-page-card', variant === 'register' && 'auth-page-card--register')}>
        <aside
          className={cn(
            'auth-page-aside',
            variant === 'login' ? 'auth-page-aside--login' : 'auth-page-aside--register',
          )}
        >
          <AuthAside asideTitle={asideTitle} asideSubtitle={asideSubtitle} benefits={benefits} />
        </aside>

        <div className="auth-page-form">
          <div className="auth-page-form-header">
            <h1 className="auth-page-title">{title}</h1>
            <p className="auth-page-subtitle">{subtitle}</p>
          </div>

          {children}

          {footer && <div className="auth-page-footer">{footer}</div>}
        </div>
      </div>
    </section>
  </ShopLayout>
);
