import { useState } from 'react';
import {
  CreditCard, Truck, Store, Calendar, Clock, Check, ArrowLeft,
  ShieldCheck, Lock, Banknote, Phone, Copy, CheckCheck, Upload, Image,
} from 'lucide-react';
import { useCart } from '../lib/cart';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import { formatNaira } from '../lib/types';

const DELIVERY_TIMES = [
  '8:00 AM - 12:00 PM',
  '12:00 PM - 4:00 PM',
  '4:00 PM - 8:00 PM',
];

const BANK_NUMBER = '2007444377';
const BANK_NAME = 'Zarachills Organic Blends';
const BANK_PROVIDER = 'Globus Bank';

function CardForm({ card, setCard }: {
  card: { number: string; name: string; expiry: string; cvv: string };
  setCard: (v: any) => void;
}) {
  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  return (
    <div className="mt-4 bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-dark-600 mb-1">Card Number</label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={card.number}
            onChange={(e) => setCard((v: any) => ({ ...v, number: formatCardNumber(e.target.value) }))}
            maxLength={19}
            className="input-field pr-10 font-mono tracking-widest"
          />
          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-dark-600 mb-1">Cardholder Name</label>
        <input
          type="text"
          placeholder="Name on card"
          value={card.name}
          onChange={(e) => setCard((v: any) => ({ ...v, name: e.target.value }))}
          className="input-field"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-dark-600 mb-1">Expiry Date</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={card.expiry}
            onChange={(e) => setCard((v: any) => ({ ...v, expiry: formatExpiry(e.target.value) }))}
            maxLength={5}
            className="input-field font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-600 mb-1">CVV</label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="•••"
            value={card.cvv}
            onChange={(e) => setCard((v: any) => ({ ...v, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
            maxLength={4}
            className="input-field font-mono"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-stone-400 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-primary-500" />
        Your card details are encrypted and secure
      </div>
    </div>
  );
}

function BankTransferInfo({
  proofFile,
  onProofChange,
}: {
  proofFile: File | null;
  onProofChange: (file: File | null) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(BANK_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-medium text-amber-800">Transfer to the account below, then place your order.</p>
      <div className="bg-white rounded-xl border border-amber-100 p-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Bank · <span className="font-medium text-stone-600">{BANK_PROVIDER}</span></p>
          <p className="font-mono font-bold text-stone-700 text-lg tracking-wider">{BANK_NUMBER}</p>
          <p className="text-xs text-stone-500 mt-1">Account Name: <span className="font-medium text-stone-700">{BANK_NAME}</span></p>
        </div>
        <button
          type="button"
          onClick={copy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            copied ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
          }`}
        >
          {copied ? <><CheckCheck className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
        </button>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-amber-700">
        <Phone className="h-3.5 w-3.5" />
        Add your order number as the transfer reference
      </div>
      <label className="block rounded-xl border border-dashed border-amber-300 bg-white/70 p-4 cursor-pointer hover:bg-white transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            {proofFile ? <Image className="h-5 w-5 text-amber-700" /> : <Upload className="h-5 w-5 text-amber-700" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900">{proofFile ? proofFile.name : 'Upload transfer proof'}</p>
            <p className="text-xs text-amber-700 mt-0.5">JPEG, PNG, or WebP · max 10 MB</p>
          </div>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => onProofChange(event.target.files?.[0] || null)}
        />
      </label>
      <p className="text-xs text-amber-700">After your order is saved, WhatsApp will open with the order details and proof link ready to send.</p>
    </div>
  );
}

export function CheckoutPage() {
  const { items, subtotal, discount, total, promo, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'processing'>('info');
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_type: 'home',
    delivery_address: '',
    delivery_date: '',
    delivery_time: DELIVERY_TIMES[0],
    notes: '',
    payment_method: 'card',
  });
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [transactionReference, setTransactionReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-dark-600 mb-4">Your cart is empty</p>
          <button onClick={() => navigate('/shop')} className="btn-primary">Shop Now</button>
        </div>
      </div>
    );
  }

  const generateOrderNumber = () => `ZC-${Date.now().toString().slice(-8)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.delivery_type === 'home' && !form.delivery_address) {
      setError('Please enter your delivery address');
      return;
    }

    if (form.payment_method === 'card') {
      if (!card.number || !card.name || !card.expiry || !card.cvv) {
        setError('Please fill in all card details');
        return;
      }
    }

    if (form.payment_method === 'bank') {
      if (!proofFile) {
        setError('Please upload your transfer screenshot before placing the order');
        return;
      }
      if (!proofFile.type.startsWith('image/') || proofFile.size > 10 * 1024 * 1024) {
        setError('Please choose a JPG, PNG, or WebP image under 10 MB');
        return;
      }
    }

    setStep('processing');

    const orderNumber = generateOrderNumber();
    let paymentProofUrl: string | null = null;
    if (form.payment_method === 'bank' && proofFile) {
      const proofPath = `${orderNumber}/${crypto.randomUUID()}-${proofFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(proofPath, proofFile, {
        contentType: proofFile.type,
        upsert: false,
      });
      if (uploadError) {
        setError('We could not save your transfer proof. Please try again.');
        setStep('info');
        return;
      }
      paymentProofUrl = supabase.storage.from('payment-proofs').getPublicUrl(proofPath).data.publicUrl;
    }

    const paymentRef = form.payment_method === 'card'
      ? `CARD-${card.number.replace(/\s/g, '').slice(-4)}`
      : form.payment_method === 'bank'
      ? `BANK-${BANK_NUMBER}`
      : 'COD';

    const { error: insertError } = await supabase.from('orders').insert({
      order_number: orderNumber,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      delivery_type: form.delivery_type,
      delivery_address: form.delivery_address,
      delivery_date: form.delivery_date || null,
      delivery_time: form.delivery_time,
      items,
      subtotal,
      discount,
      total: total + deliveryFee,
      promo_code: promo?.code || null,
      payment_method: form.payment_method,
      payment_reference: paymentRef,
      payment_proof_url: paymentProofUrl,
      transaction_reference: form.payment_method === 'bank' ? transactionReference.trim() || null : null,
      status: 'pending',
      notes: form.notes,
    });

    if (insertError) {
      setError('Failed to place order. Please try again.');
      setStep('info');
      return;
    }

    clearCart();

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-new-order`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_number: orderNumber,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        delivery_type: form.delivery_type,
        delivery_address: form.delivery_address,
        delivery_time: form.delivery_time,
        items,
        subtotal,
        discount,
        total: total + deliveryFee,
        payment_method: form.payment_method,
        payment_proof_url: paymentProofUrl,
        transaction_reference: form.payment_method === 'bank' ? transactionReference.trim() || null : null,
        notes: form.notes,
      }),
    }).catch(() => {});

    if (form.payment_method === 'bank' && paymentProofUrl) {
      const itemLines = items.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} — ${formatNaira(item.price * item.quantity)}`).join('\n');
      const whatsappMessage = [
        'Please confirm my order',
        '',
        'Store: Zarachills Organic Blends',
        `Order: ${orderNumber}`,
        `Customer: ${form.customer_name}`,
        `Phone: ${form.customer_phone}`,
        '',
        'Items:',
        itemLines,
        '',
        `Delivery: ${form.delivery_type}${form.delivery_address ? ` — ${form.delivery_address}` : ''}`,
        `Total: ${formatNaira(total + deliveryFee)}`,
        `Transaction reference: ${transactionReference.trim() || 'Not provided'}`,
        '',
        `Transfer proof: ${paymentProofUrl}`,
        '',
        'I have completed payment and uploaded the transfer proof. Please verify and confirm my order.',
      ].join('\n');
      window.open(`https://wa.me/2347065927859?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
    }

    navigate(`/order-confirmation/${orderNumber}`);
  };

  const deliveryFee = form.delivery_type === 'home' ? 1500 : 0;

  return (
    <div className="pt-20 min-h-screen container-x py-12 bg-gradient-to-b from-primary-50/20 to-white dark:from-dark-600 dark:to-dark-700">
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-dark-200 hover:text-primary-600 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </button>

      <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark-600 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Contact */}
          <div className="card p-6">
            <h2 className="font-heading text-lg font-bold text-dark-600 mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Full Name *</label>
                <input required value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Phone *</label>
                <input required value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="input-field" placeholder="080..." />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dark-600 mb-1">Email *</label>
              <input type="email" required value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                className="input-field" placeholder="you@email.com" />
            </div>
          </div>

          {/* Delivery */}
          <div className="card p-6">
            <h2 className="font-heading text-lg font-bold text-dark-600 mb-4">Delivery Options</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button type="button" onClick={() => setForm({ ...form, delivery_type: 'home' })}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${form.delivery_type === 'home' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                <Truck className="h-6 w-6 text-primary-500 mb-2" />
                <p className="font-semibold text-dark-600">Home Delivery</p>
                <p className="text-sm text-dark-200">Delivered to your address</p>
              </button>
              <button type="button" onClick={() => setForm({ ...form, delivery_type: 'pickup' })}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${form.delivery_type === 'pickup' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                <Store className="h-6 w-6 text-primary-500 mb-2" />
                <p className="font-semibold text-dark-600">Pickup</p>
                <p className="text-sm text-dark-200">Collect from our store</p>
              </button>
            </div>

            {form.delivery_type === 'home' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-dark-600 mb-1">Delivery Address *</label>
                <textarea required rows={3} value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                  className="input-field resize-none" placeholder="Street address, city, state" />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">
                  <Calendar className="h-3 w-3 inline mr-1" /> Preferred Date
                </label>
                <input type="date" value={form.delivery_date}
                  onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">
                  <Clock className="h-3 w-3 inline mr-1" /> Preferred Time
                </label>
                <select value={form.delivery_time}
                  onChange={(e) => setForm({ ...form, delivery_time: e.target.value })}
                  className="input-field">
                  {DELIVERY_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-heading text-lg font-bold text-dark-600 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {/* Card */}
              <button type="button" onClick={() => setForm({ ...form, payment_method: 'card' })}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${form.payment_method === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                <CreditCard className="h-6 w-6 text-primary-500 shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-dark-600">Pay with Card</p>
                  <p className="text-sm text-dark-200">Visa, Mastercard, Verve</p>
                </div>
                {form.payment_method === 'card' && <Check className="h-5 w-5 text-primary-500 shrink-0" />}
              </button>

              {form.payment_method === 'card' && (
                <CardForm card={card} setCard={setCard} />
              )}

              {/* Bank Transfer */}
              <button type="button" onClick={() => setForm({ ...form, payment_method: 'bank' })}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${form.payment_method === 'bank' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                <Banknote className="h-6 w-6 text-primary-500 shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-dark-600">Bank Transfer</p>
                  <p className="text-sm text-dark-200">Transfer directly to our account</p>
                </div>
                {form.payment_method === 'bank' && <Check className="h-5 w-5 text-primary-500 shrink-0" />}
              </button>

              {form.payment_method === 'bank' && (
                <BankTransferInfo proofFile={proofFile} onProofChange={setProofFile} />
              )}
              {form.payment_method === 'bank' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-dark-600 mb-1">Transaction reference <span className="font-normal text-dark-200">(Optional)</span></label>
                  <input
                    value={transactionReference}
                    onChange={(event) => setTransactionReference(event.target.value)}
                    className="input-field"
                    placeholder="e.g. transfer reference number"
                    maxLength={100}
                  />
                </div>
              )}

              {/* Cash on Delivery */}
              <button type="button" onClick={() => setForm({ ...form, payment_method: 'cod' })}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${form.payment_method === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                <Banknote className="h-6 w-6 text-primary-500 shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-dark-600">Cash on Delivery</p>
                  <p className="text-sm text-dark-200">Pay when you receive your order</p>
                </div>
                {form.payment_method === 'cod' && <Check className="h-5 w-5 text-primary-500 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-dark-600 mb-1">Order Notes (Optional)</label>
            <textarea rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none" placeholder="Any special instructions..." />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-heading text-xl font-bold text-dark-600 mb-6">Your Order</h2>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                    <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-dark-600">{item.name}</p>
                    <p className="text-xs text-dark-200">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-primary-600">{formatNaira(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-dark-200 text-sm">
                <span>Subtotal</span><span>{formatNaira(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary-600 text-sm">
                  <span>Discount {promo && `(${promo.code})`}</span>
                  <span>-{formatNaira(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-dark-200 text-sm">
                <span>Delivery</span>
                <span>{deliveryFee > 0 ? formatNaira(deliveryFee) : 'Free'}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-gray-100 pt-2">
                <span className="font-heading font-bold text-dark-600">Total</span>
                <span className="font-heading font-bold text-xl text-primary-600">
                  {formatNaira(total + deliveryFee)}
                </span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button type="submit" disabled={step === 'processing'} className="btn-primary w-full">
              {step === 'processing' ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <><Lock className="h-4 w-4" /> Place Order</>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-dark-200">
              <ShieldCheck className="h-3 w-3" /> Secure SSL encrypted checkout
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
