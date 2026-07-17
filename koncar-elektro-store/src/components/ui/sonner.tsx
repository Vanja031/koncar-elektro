'use client';

import { useTheme } from 'next-themes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const toastIcon = (icon: typeof faCircleCheck, className: string) => (
  <span className={`koncar-toast-icon ${className}`} aria-hidden>
    <FontAwesomeIcon icon={icon} />
  </span>
);

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group koncar-toaster"
      position="top-right"
      expand
      visibleToasts={5}
      gap={6}
      offset={16}
      richColors={false}
      closeButton
      icons={{
        success: toastIcon(faCircleCheck, 'koncar-toast-icon--success'),
        error: toastIcon(faCircleExclamation, 'koncar-toast-icon--error'),
        info: toastIcon(faCircleInfo, 'koncar-toast-icon--info'),
      }}
      toastOptions={{
        duration: 4500,
        unstyled: true,
        classNames: {
          toast: 'koncar-toast',
          title: 'koncar-toast-title',
          description: 'koncar-toast-description',
          success: 'koncar-toast--success',
          error: 'koncar-toast--error',
          icon: 'koncar-toast-icon-slot',
          closeButton: 'koncar-toast-close',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
