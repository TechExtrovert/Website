import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2347065927859"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
        <div className="relative h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/40 transition-all duration-300 group-hover:scale-110">
          <MessageCircle className="h-7 w-7 text-white" fill="currentColor" />
        </div>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-dark-600 text-white text-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat with us
        </span>
      </div>
    </a>
  );
}

export function StickyOrderButton() {
  return (
    <button
      onClick={() => (window.location.hash = '/shop')}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 md:hidden btn-primary shadow-lg shadow-primary-500/40 px-8"
    >
      Order Now
    </button>
  );
}
