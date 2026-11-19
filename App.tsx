import { useEffect } from 'react';
import { CartProvider } from './lib/cart';
import { ThemeProvider } from './lib/theme';
import { useRoute } from './lib/router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton, StickyOrderButton } from './components/FloatingButtons';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { FindBlendPage } from './pages/FindBlendPage';
import { BundlesPage } from './pages/BundlesPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage, BlogPostPage } from './pages/BlogPage';
import { WholesalePage } from './pages/WholesalePage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminPage } from './pages/AdminPage';

const SEO_META: Record<string, { title: string; description: string }> = {
  home: { title: 'Zarachills Organic Blends — Fuel Your Body. Transform Your Lifestyle.', description: 'Premium organic fruit blends for fitness, recovery, energy, and wellness. Not just juice — functional nutrition in every bottle.' },
  shop: { title: 'Shop Organic Blends | Zarachills', description: 'Browse all Zarachills organic fruit blends for fat burn, weight gain, energy, recovery, hydration, and wellness.' },
  product: { title: 'Product | Zarachills', description: 'Discover this premium organic fruit blend engineered for your fitness goals.' },
  'find-blend': { title: 'Find Your Blend | Zarachills', description: 'Take our quiz to discover the perfect organic blend for your fitness and wellness goals.' },
  bundles: { title: 'Fitness Bundles | Zarachills', description: 'Curated packs of organic blends designed for your fitness journey. Save up to 25%.' },
  about: { title: 'About Us | Zarachills', description: 'Our mission is functional nutrition through natural fruit blends. Fuel your body. Transform your lifestyle.' },
  blog: { title: 'Wellness Blog | Zarachills', description: 'Tips on fitness, nutrition, wellness, and healthy living from the Zarachills team.' },
  'blog-post': { title: 'Blog | Zarachills', description: 'Insights on fitness, nutrition, and wellness from Zarachills Organic Blends.' },
  wholesale: { title: 'Wholesale | Zarachills', description: 'Partner with Zarachills for wholesale organic fruit blends. Bulk pricing for gyms, cafes, and retailers.' },
  contact: { title: 'Contact Us | Zarachills', description: 'Get in touch with Zarachills Organic Blends. We are here to help with orders, wholesale, and more.' },
  cart: { title: 'Shopping Cart | Zarachills', description: 'Review your selected organic blends and proceed to checkout.' },
  checkout: { title: 'Checkout | Zarachills', description: 'Secure checkout for your Zarachills organic blend order. Pay with card, bank transfer, or cash on delivery.' },
  'order-confirmation': { title: 'Order Confirmed | Zarachills', description: 'Your Zarachills order has been confirmed. Thank you for choosing functional nutrition.' },
  account: { title: 'My Account | Zarachills', description: 'View your orders, track deliveries, and manage your Zarachills account.' },
  wishlist: { title: 'My Wishlist | Zarachills', description: 'Your saved organic blends for later purchase.' },
  admin: { title: 'Admin Dashboard | Zarachills', description: 'Manage products, orders, and content.' },
};

function CurrentPage() {
  const route = useRoute();

  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'shop':
      return <ShopPage />;
    case 'product':
      return <ProductPage slug={route.slug} />;
    case 'find-blend':
      return <FindBlendPage />;
    case 'bundles':
      return <BundlesPage />;
    case 'about':
      return <AboutPage />;
    case 'blog':
      return <BlogPage />;
    case 'blog-post':
      return <BlogPostPage slug={route.slug} />;
    case 'wholesale':
      return <WholesalePage />;
    case 'contact':
      return <ContactPage />;
    case 'cart':
      return <CartPage />;
    case 'checkout':
      return <CheckoutPage />;
    case 'order-confirmation':
      return <OrderConfirmationPage orderNumber={route.orderNumber} />;
    case 'account':
      return <AccountPage />;
    case 'wishlist':
      return <WishlistPage />;
    case 'admin':
      return <AdminPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  const route = useRoute();
  const isAdmin = route.name === 'admin';

  useEffect(() => {
    const meta = SEO_META[route.name] || SEO_META.home;
    document.title = meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta.description);
  }, [route.name]);

  if (isAdmin) {
    return (
      <ThemeProvider>
        <CartProvider>
          <AdminPage />
        </CartProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-white dark:bg-dark-700 transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <CurrentPage />
          </main>
          <Footer />
          <WhatsAppButton />
          <StickyOrderButton />
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}
