import { useEffect, useState } from 'react';
import {
  User, Package, MapPin, Heart, LogOut, Settings, Truck, Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/cart';
import { navigate } from '../lib/router';
import { formatNaira } from '../lib/types';
import type { Order } from '../lib/types';

export function AccountPage() {
  const { wishlist } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setOrders(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-primary-50/20 to-white dark:from-dark-600 dark:to-dark-700">
      <div className="container-x py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-dark-600">Guest User</p>
                  <p className="text-sm text-dark-200">Not signed in</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/shop')}
                className="btn-outline w-full text-sm"
              >
                Sign In / Create Account
              </button>
            </div>

            <div className="card p-4">
              {[
                { id: 'orders', icon: Package, label: 'My Orders' },
                { id: 'profile', icon: Settings, label: 'Profile' },
                { id: 'addresses', icon: MapPin, label: 'Addresses' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-dark-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => navigate('/wishlist')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-600 hover:bg-gray-50 transition-colors"
              >
                <Heart className="h-4 w-4" />
                Wishlist ({wishlist.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div>
                <h1 className="font-heading text-2xl font-bold text-dark-600 mb-6">
                  My Orders
                </h1>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 rounded-3xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Package className="h-12 w-12 text-dark-200 mx-auto mb-4" />
                    <h3 className="font-heading text-lg font-semibold text-dark-600 mb-2">
                      No Orders Yet
                    </h3>
                    <p className="text-dark-200 mb-6">
                      When you place an order, it will appear here.
                    </p>
                    <button onClick={() => navigate('/shop')} className="btn-primary">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-mono font-bold text-primary-600">
                              {order.order_number}
                            </p>
                            <p className="text-sm text-dark-200">
                              {new Date(order.created_at).toLocaleDateString('en-NG', {
                                month: 'long', day: 'numeric', year: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className={`badge ${
                            order.status === 'pending' ? 'bg-secondary-100 text-secondary-700' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'delivered' ? 'bg-primary-100 text-primary-700' :
                            'bg-gray-100 text-dark-200'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                          {order.items.map((item, i) => (
                            <div key={i} className="w-12 h-12 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                              <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-dark-200">
                            <Truck className="h-4 w-4" />
                            <span className="capitalize">{order.delivery_type}</span>
                            <span>·</span>
                            <span>{order.items.length} items</span>
                          </div>
                          <span className="font-heading font-bold text-primary-600">
                            {formatNaira(order.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h1 className="font-heading text-2xl font-bold text-dark-600 mb-6">
                  Profile Settings
                </h1>
                <div className="card p-8 text-center">
                  <User className="h-12 w-12 text-dark-200 mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-dark-600 mb-2">
                    Sign In to Manage Your Profile
                  </h3>
                  <p className="text-dark-200 mb-6">
                    Create an account to save your details, track orders, and earn rewards.
                  </p>
                  <button onClick={() => navigate('/shop')} className="btn-primary">
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h1 className="font-heading text-2xl font-bold text-dark-600 mb-6">
                  Saved Addresses
                </h1>
                <div className="card p-8 text-center">
                  <MapPin className="h-12 w-12 text-dark-200 mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-dark-600 mb-2">
                    No Saved Addresses
                  </h3>
                  <p className="text-dark-200 mb-6">
                    Your delivery addresses will be saved here after your first order.
                  </p>
                  <button onClick={() => navigate('/shop')} className="btn-primary">
                    Start Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
