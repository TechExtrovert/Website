import { useEffect, useState } from 'react';
import { Menu, X, ShoppingBag, Heart, Search, ChevronDown } from 'lucide-react';
import { useCart } from '../lib/cart';
import { navigate, useRoute } from '../lib/router';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Find Your Blend', path: '/find-blend' },
  { label: 'Bundles', path: '/bundles' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blog' },
  { label: 'Wholesale', path: '/wholesale' },
  { label: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { count, wishlist } = useCart();
  const route = useRoute();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [route]);

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-dark-700/90 backdrop-blur-lg shadow-md py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <nav className="container-x flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => go('/')}
            className="flex items-center gap-2 group"
            aria-label="Zarachills home"
          >
            <img
              src="/assets/images/Z.png"
              alt="Zarachills"
              className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col leading-tight">
              <span
                className={`font-heading font-bold text-lg tracking-tight transition-colors ${
                  scrolled ? 'text-primary-600 dark:text-primary-400' : 'text-primary-600 dark:text-primary-400'
                }`}
              >
                Zarachills
              </span>
              <span className="font-body text-[10px] font-medium tracking-widest uppercase text-secondary-500">
                Organic Blends
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => go(link.path)}
                className="px-3 py-2 text-sm font-medium text-dark-600 dark:text-dark-100 hover:text-primary-500 dark:hover:text-primary-400 transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-dark-600/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-dark-600 dark:text-dark-100" />
            </button>
            <button
              onClick={() => go('/wishlist')}
              className="p-2 rounded-full hover:bg-dark-600/5 dark:hover:bg-white/10 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-dark-600 dark:text-dark-100" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={() => go('/cart')}
              className="p-2 rounded-full hover:bg-dark-600/5 dark:hover:bg-white/10 transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5 text-dark-600 dark:text-dark-100" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-scale-in">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => go('/shop')}
              className="hidden md:inline-flex btn-primary !py-2 !px-4 text-sm"
            >
              Shop Now
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-dark-600/5 dark:hover:bg-white/10"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-6 w-6 text-dark-600 dark:text-dark-100" /> : <Menu className="h-6 w-6 text-dark-600 dark:text-dark-100" />}
            </button>
          </div>
        </nav>

        {/* Search bar */}
        {searchOpen && (
          <div className="container-x mt-2 animate-fade-in-down">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, blends, goals..."
                autoFocus
                className="input-field pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-dark-600/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-dark-600 shadow-2xl animate-slide-in-right pt-20 pb-6 overflow-y-auto">
            <div className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => go(link.path)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-dark-600 dark:text-dark-100 hover:bg-primary-50 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                >
                  {link.label}
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              ))}
              <button
                onClick={() => go('/shop')}
                className="btn-primary mt-4 w-full"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
