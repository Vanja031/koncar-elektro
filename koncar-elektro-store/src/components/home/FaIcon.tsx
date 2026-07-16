import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faHeadset,
  faTruck,
  faShieldHalved,
  faRotateLeft,
  faLock,
  faPhone,
  faMobileScreen,
  faEnvelope,
  faLocationDot,
  faClock,
  faComments,
  faAward,
} from '@fortawesome/free-solid-svg-icons';

type FaIconProps = {
  icon: IconDefinition;
  className?: string;
};

/** Reusable Font Awesome icon wrapper */
export const FaIcon = ({ icon, className = 'w-5 h-5' }: FaIconProps) => (
  <FontAwesomeIcon icon={icon} className={className} />
);

export const trustIcons = {
  support: faHeadset,
  delivery: faTruck,
  warranty: faShieldHalved,
  returns: faRotateLeft,
  secure: faLock,
  verified: faAward,
} as const;

export const footerIcons = {
  phone: faPhone,
  mobile: faMobileScreen,
  mail: faEnvelope,
  location: faLocationDot,
  clock: faClock,
  chat: faComments,
} as const;
