import facebookIcon from '@/assets/facebook.png';
import instagramIcon from '@/assets/instagram.png';
import tiktokIcon from '@/assets/tiktok.png';
import viberIcon from '@/assets/viber.png';
import whatsappIcon from '@/assets/whatsapp.png';
import youtubeIcon from '@/assets/youtube.png';

export const socialIcons = {
  facebook: facebookIcon,
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  viber: viberIcon,
  whatsapp: whatsappIcon,
  youtube: youtubeIcon,
} as const;

export type SocialIconName = keyof typeof socialIcons;

type Props = {
  name: SocialIconName;
  className?: string;
  alt?: string;
};

export const SocialIcon = ({ name, className = 'w-4 h-4', alt }: Props) => (
  <img
    src={socialIcons[name]}
    alt={alt ?? name.charAt(0).toUpperCase() + name.slice(1)}
    className={`shrink-0 object-contain ${className}`}
  />
);

/** Instagram, Facebook, TikTok, YouTube — header & footer nav */
export const mainSocialLinks: SocialIconName[] = ['instagram', 'facebook', 'tiktok', 'youtube'];
