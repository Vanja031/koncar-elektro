import { socialProfiles } from '@/data/staticPages';
import { SocialIcon } from './SocialIcon';

type Props = {
  variant?: 'header' | 'footer';
  className?: string;
};

export const SocialLinks = ({ variant = 'header', className = '' }: Props) => {
  const isFooter = variant === 'footer';

  return (
    <div className={`flex items-center ${isFooter ? 'gap-3' : 'gap-2'} ${className}`}>
      {socialProfiles.map(({ name, href, label }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isFooter
              ? 'flex items-center justify-center w-10 h-10 rounded-lg bg-white p-1.5 shadow-sm hover:scale-105 transition-transform'
              : 'header-social-link hover:opacity-90 transition-opacity'
          }
          aria-label={label}
        >
          <SocialIcon name={name} className={isFooter ? 'w-full h-full object-contain' : 'w-4 h-4'} />
        </a>
      ))}
    </div>
  );
};
