import { useEffect, useState } from 'react';
import { Check, Package, Truck, Clock, ArrowRight, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import { formatNaira } from '../lib/types';
import type { Order } from '../lib/types';

export function OrderConfirmationPage({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();
      setOrder(data as Order | null);
      setLoading(false);
    })();
  }, [orderNumber]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen container-x py-12 max-w-2xl bg-gradient-to-b from-primary-50/20 to-white dark:from-dark-600 dark:to-dark-700">
      {/* Success */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <Check className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark-600 mb-3">
          Order Confirmed!
        </h1>
        <p className="text-dark-200 text-lg mb-6">
          Thank you for your order. We've sent a confirmation to your email.
        </p>

        <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-2">
          <span className="text-sm text-dark-200">Order Number:</span>
          <span className="font-mono font-bold text-primary-600">{orderNumber}</span>
          <button onClick={copyOrderNumber} className="p-1 hover:bg-primary-100 rounded-full">
            {copied ? <Check className="h-3 w-3 text-primary-600" /> : <Copy className="h-3 w-3 text-dark-200" />}
          </button>
        </div>
      </div>

      {/* Order tracking */}
      <div className="card p-8 mb-8">
        <h2 className="font-heading text-xl font-bold text-dark-600 mb-6">Order Status</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-100" />
          <div className="absolute top-6 left-0 h-0.5 bg-primary-500 transition-all" style={{ width: '33%' }} />

          {[
            { icon: Check, label: 'Confirmed', active: true },
            { icon: Package, label: 'Processing', active: false },
            { icon: Truck, label: 'Delivered', active: false },
          ].map((step, i) => (
            <div key={i} className="relative flex flex-col items-center gap-2 z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.active ? 'bg-primary-500 text-white' : 'bg-gray-100 text-dark-200'
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium ${step.active ? 'text-primary-600' : 'text-dark-200'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order details */}
      {order && (
        <div className="card p-8 mb-8">
          <h2 className="font-heading text-xl font-bold text-dark-600 mb-6">Order Details</h2>

          <div className="space-y-3 mb-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                  <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-600">{item.name}</p>
                  <p className="text-sm text-dark-200">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-primary-600">
                  {formatNaira(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-dark-200 text-sm">
              <span>Subtotal</span>
              <span>{formatNaira(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-primary-600 text-sm">
                <span>Discount</span>
                <span>-{formatNaira(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-heading font-bold text-lg">
              <span className="text-dark-600">Total</span>
              <span className="text-primary-600">{formatNaira(order.total)}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-200">Delivery Type</span>
              <span className="text-dark-600 font-medium capitalize">{order.delivery_type}</span>
            </div>
            {order.delivery_address && (
              <div className="flex justify-between">
                <span className="text-dark-200">Address</span>
                <span className="text-dark-600 font-medium text-right max-w-xs">{order.delivery_address}</span>
              </div>
            )}
            {order.delivery_time && (
              <div className="flex justify-between">
                <span className="text-dark-200">Preferred Time</span>
                <span className="text-dark-600 font-medium">{order.delivery_time}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-dark-200">Payment</span>
              <span className="text-dark-600 font-medium capitalize">{order.payment_method}</span>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 mb-8">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-dark-600 mb-1">What happens next?</p>
            <p className="text-sm text-dark-200">
              We'll process your order and send you tracking updates via email and SMS.
              Expected delivery within 24-48 hours for home delivery.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={() => navigate('/shop')} className="btn-primary">
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </button>
        <button onClick={() => navigate('/')} className="btn-outline">
          Back to Home
        </button>
      </div>
    </div>
  );
}
