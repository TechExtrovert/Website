import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'shop'; goal?: string }
  | { name: 'product'; slug: string }
  | { name: 'find-blend' }
  | { name: 'bundles' }
  | { name: 'about' }
  | { name: 'blog' }
  | { name: 'blog-post'; slug: string }
  | { name: 'wholesale' }
  | { name: 'contact' }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'order-confirmation'; orderNumber: string }
  | { name: 'account' }
  | { name: 'wishlist' }
  | { name: 'admin' };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };

  switch (parts[0]) {
    case 'shop':
      return { name: 'shop', goal: parts[1] };
    case 'product':
      return { name: 'product', slug: parts[1] || '' };
    case 'find-blend':
      return { name: 'find-blend' };
    case 'bundles':
      return { name: 'bundles' };
    case 'about':
      return { name: 'about' };
    case 'blog':
      return parts[1] ? { name: 'blog-post', slug: parts[1] } : { name: 'blog' };
    case 'wholesale':
      return { name: 'wholesale' };
    case 'contact':
      return { name: 'contact' };
    case 'cart':
      return { name: 'cart' };
    case 'checkout':
      return { name: 'checkout' };
    case 'order-confirmation':
      return { name: 'order-confirmation', orderNumber: parts[1] || '' };
    case 'account':
      return { name: 'account' };
    case 'wishlist':
      return { name: 'wishlist' };
    case 'admin':
      return { name: 'admin' };
    default:
      return { name: 'home' };
  }
}

export function navigate(path: string) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}
