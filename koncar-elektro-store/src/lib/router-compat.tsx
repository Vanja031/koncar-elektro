'use client';

import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import {
  forwardRef,
  useCallback,
  useEffect,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  replace?: boolean;
};

/** Drop-in replacement for react-router-dom `Link` (`to` → `href`). */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, ...props }, ref) => (
    <NextLink ref={ref} href={to} replace={replace} {...props} />
  ),
);
Link.displayName = 'Link';

type NavLinkProps = Omit<LinkProps, 'className'> & {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
};

/** Drop-in replacement for react-router-dom `NavLink`. */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to || pathname === `${to}/`;
    return (
      <NextLink
        ref={ref}
        href={to}
        className={cn(className, isActive && activeClassName, pendingClassName)}
        {...props}
      />
    );
  },
);
NavLink.displayName = 'NavLink';

/** Drop-in replacement for react-router-dom `Navigate`. */
export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);

  return null;
}

/** Normalizes Next.js catch-all params to react-router splat (`*`). */
export function useParams(): Record<string, string | undefined> {
  const params = useNextParams();
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      result[key] = value.join('/');
      if (key === 'slug' || key === 'segments' || key === 'rest') {
        result['*'] = value.join('/');
      }
    } else if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return { pathname, search };
}

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        window.history.go(to);
        return;
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router],
  );
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams) => void] {
  const params = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router],
  );

  return [new URLSearchParams(params.toString()), setSearchParams];
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Route(_props: { path?: string; element?: ReactNode }) {
  return null;
}
