import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatPriceVND } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SHIPPING_OPTIONS = {
    standard: { label: 'Standard Shipping', description: '4-6 business days', price: 30000 },
    express: { label: 'Express Shipping', description: '1-2 business days', price: 50000 },
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, cartCount, loading: cartLoading, refreshCart } = useCart();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // Form state
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [newAddress, setNewAddress] = useState({
        recipient_name: '',
        recipient_phone: '',
        province_id: '',
        ward_id: '',
        street: '',
        is_default: false
    });
    const [savingAddress, setSavingAddress] = useState(false);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [discountCode, setDiscountCode] = useState('');
    const [discounts, setDiscounts] = useState([]);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountMessage, setDiscountMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [hasOrderPlaced, setHasOrderPlaced] = useState(false);

    // Stripe State
    const [clientSecret, setClientSecret] = useState("");

    const selectedIds = location.state?.selectedIds || null;
    const items = cart?.items || [];
    const filteredItems = useMemo(() => {
        if (!selectedIds || selectedIds.length === 0) return items.filter((i) => i.is_available);
        const idSet = new Set(selectedIds);
        return items.filter((i) => idSet.has(i.cart_item_id) && i.is_available);
    }, [items, selectedIds]);

    const subtotal = filteredItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    const shipping = SHIPPING_OPTIONS[shippingMethod]?.price ?? 0;
    const total = Math.max(0, subtotal - discountAmount + shipping);

    // Create Payment Intent when total changes or method switches to card
    useEffect(() => {
        if (paymentMethod === 'card' && total > 0 && selectedAddressId) {
            // Check if we need to secure order placement first or just intent
            // Here just create intent
            const createIntent = async () => {
                try {
                    const { client_secret } = await api.payments.createIntent({
                        shipping_address_id: selectedAddressId,
                        shipping_method: shippingMethod,
                        discount_code: appliedDiscount?.code,
                        cart_item_ids: selectedIds
                    });
                    setClientSecret(client_secret);
                } catch (err) {
                    console.error("Failed to init stripe:", err);
                    setOrderError("Could not initialize payment. Please try again.");
                }
            };
            createIntent();
        } else {
            setClientSecret(""); // Reset if not card
        }
    }, [paymentMethod, total, shippingMethod, appliedDiscount, selectedIds, selectedAddressId]);



    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (!cartLoading && isAuthenticated && cartCount === 0 && !hasOrderPlaced) {
            navigate('/cart');
        }
    }, [cartLoading, cartCount, isAuthenticated, navigate, hasOrderPlaced]);

    useEffect(() => {
        if (!cartLoading && filteredItems.length === 0 && !hasOrderPlaced) {
            navigate('/cart');
        }
    }, [cartLoading, filteredItems, navigate, hasOrderPlaced]);

    // Fetch addresses
    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [isAuthenticated]);

    // Fetch discounts (best-effort; requires admin token)
    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const data = await api.marketing.list(true);
                setDiscounts(data || []);
            } catch (error) {
                console.warn('Failed to fetch discounts (may require admin):', error);
            }
        };
        fetchDiscounts();
    }, []);

    const fetchAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const data = await api.addresses.list();
            setAddresses(data);
            // Select default address or first one
            const defaultAddr = data.find(a => a.is_default);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.shipping_address_id);
            } else if (data.length > 0) {
                setSelectedAddressId(data[0].shipping_address_id);
            } else {
                // If no addresses, show add form
                setIsAddingNew(true);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    // Fetch provinces when opening add form
    useEffect(() => {
        if (isAddingNew && provinces.length === 0) {
            const fetchProvinces = async () => {
                try {
                    const data = await api.locations.getProvinces();
                    setProvinces(data);
                } catch (error) {
                    console.error('Failed to fetch provinces:', error);
                }
            };
            fetchProvinces();
        }
    }, [isAddingNew]);

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        setNewAddress(prev => ({ ...prev, province_id: provinceId, ward_id: '' }));
        setWards([]);

        if (provinceId) {
            try {
                const data = await api.locations.getWards(provinceId);
                setWards(data);
            } catch (error) {
                console.error('Failed to fetch wards:', error);
            }
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSavingAddress(true);
        try {
            // Validation
            if (!newAddress.recipient_name || !newAddress.recipient_phone || !newAddress.province_id || !newAddress.ward_id || !newAddress.street) {
                alert('Please fill in all required fields');
                return;
            }

            const payload = {
                ...newAddress,
                province_id: parseInt(newAddress.province_id),
                ward_id: parseInt(newAddress.ward_id),
                full_address: `${newAddress.street}, ${wards.find(w => w.ward_id === parseInt(newAddress.ward_id))?.name}, ${provinces.find(p => p.province_id === parseInt(newAddress.province_id))?.name}`
            };

            const savedAddress = await api.addresses.create(payload);
            setAddresses(prev => {
                const base = savedAddress.is_default
                    ? prev.map(addr => ({ ...addr, is_default: false }))
                    : prev;
                const existingIndex = base.findIndex(addr => addr.shipping_address_id === savedAddress.shipping_address_id);
                if (existingIndex !== -1) {
                    const next = [...base];
                    next[existingIndex] = savedAddress;
                    return next;
                }
                return savedAddress.is_default ? [savedAddress, ...base] : [...base, savedAddress];
            });
            setSelectedAddressId(savedAddress.shipping_address_id);
            setIsAddingNew(false);
            setNewAddress({
                recipient_name: '',
                recipient_phone: '',
                province_id: '',
                ward_id: '',
                street: '',
                is_default: false
            });
        } catch (error) {
            console.error('Failed to save address:', error);
            alert('Failed to save address. Please try again.');
        } finally {
            setSavingAddress(false);
        }
    };

    const computeDiscountAmount = (discount) => {
        if (!discount) return 0;
        // Enforce minimum order value
        if (discount.min_order_value && subtotal < discount.min_order_value) {
            return 0;
        }
        let amount = 0;
        if (discount.type === 'percentage') {
            amount = subtotal * (discount.value / 100);
            if (discount.max_discount_amount) {
                amount = Math.min(amount, discount.max_discount_amount);
            }
        } else if (discount.type === 'fixed') {
            amount = discount.value;
        }
        return Math.min(amount, subtotal);
    };

    const eligibleDiscounts = useMemo(() => {
        const now = new Date();
        return discounts.filter((d) => {
            if (d.is_active === false) return false;
            const startsOk = !d.start_date || new Date(d.start_date) <= now;
            const endsOk = !d.end_date || new Date(d.end_date) >= now;
            const meetsMin = !d.min_order_value || subtotal >= d.min_order_value;
            const underLimit = d.usage_limit === null || d.usage_limit === undefined || (d.used_count || 0) < d.usage_limit;
            return startsOk && endsOk && meetsMin && underLimit;
        });
    }, [discounts, subtotal]);

    const handleApplyDiscount = (codeInput) => {
        const code = (codeInput ?? discountCode).trim();
        const match = eligibleDiscounts.find((d) => d.code.toLowerCase() === code.toLowerCase());
        if (!code) {
            setDiscountMessage('Vui lòng nhập mã giảm giá');
            return;
        }
        if (!match) {
            setDiscountMessage('Mã giảm giá không hợp lệ hoặc không đủ điều kiện');
            setAppliedDiscount(null);
            setDiscountAmount(0);
            return;
        }
        const amount = computeDiscountAmount(match);
        if (amount <= 0) {
            setDiscountMessage('Đơn hàng chưa đạt điều kiện để áp dụng mã này');
            setAppliedDiscount(null);
            setDiscountAmount(0);
            return;
        }
        setAppliedDiscount(match);
        setDiscountAmount(amount);
        setDiscountMessage(`Đã áp dụng mã ${match.code}`);
        setDiscountCode(match.code);
    };

    // Recompute discount when subtotal changes (e.g., cart updates)
    useEffect(() => {
        if (appliedDiscount) {
            const amount = computeDiscountAmount(appliedDiscount);
            setDiscountAmount(amount);
            if (amount === 0) {
                setDiscountMessage('Đơn hàng không còn đủ điều kiện cho mã giảm giá đã chọn');
            }
        }
    }, [appliedDiscount, subtotal]);

    const handlePlaceOrder = async () => {
        if (placingOrder) return;
        if (!selectedAddressId) {
            setOrderError('Please select a shipping address before placing your order.');
            return;
        }
        if (filteredItems.length === 0) {
            setOrderError('Your cart is empty.');
            return;
        }

        setOrderError('');
        setPlacingOrder(true);
        try {
            const payload = {
                shipping_address_id: selectedAddressId,
                payment_method: paymentMethod,
                cart_item_ids: filteredItems.map((item) => item.cart_item_id),
                discount_code: appliedDiscount?.code || null,
                shipping_method: shippingMethod,
                shipping_fee: shipping,
            };

            const order = await api.cart.checkout(payload);
            setHasOrderPlaced(true);
            await refreshCart();
            navigate('/account', { state: { newOrderId: order.order_id, orderCode: order.code } });
        } catch (error) {
            setOrderError(error.message || 'Unable to place order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    const disablePlaceOrder = placingOrder || cartLoading || filteredItems.length === 0 || !selectedAddressId;

    return (
        <div className="bg-[#221022] font-[Space_Grotesk] text-white min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 border-b border-[#482348] bg-[#221022]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-[#d411d4]">
                            <span className="material-symbols-outlined text-3xl">all_inclusive</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight uppercase">BasicColor</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                        <span className="material-symbols-outlined text-lg">lock</span>
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-20">
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">

                            <section className="space-y-6">
                                <div className="flex justify-between items-center border-b border-[#482348] pb-4">
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">Shipping Address</h2>
                                    {!isAddingNew && (
                                        <button
                                            onClick={() => setIsAddingNew(true)}
                                            className="text-sm bg-[#d411d4]/10 text-[#d411d4] px-4 py-2 rounded-lg hover:bg-[#d411d4]/20 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Add New Address
                                        </button>
                                    )}
                                </div>

                                {loadingAddresses ? (
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-24 bg-[#2d152d] rounded-lg border border-[#482348]"></div>
                                        <div className="h-24 bg-[#2d152d] rounded-lg border border-[#482348]"></div>
                                    </div>
                                ) : isAddingNew ? (
                                    <form onSubmit={handleSaveAddress} className="bg-[#2d152d] p-6 rounded-xl border border-[#482348] space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <label className="block">
                                                <span className="text-sm font-medium text-gray-300 mb-1 block">Full Name</span>
                                                <input
                                                    required
                                                    value={newAddress.recipient_name}
                                                    onChange={e => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                                                    className="w-full bg-[#221022] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                                    placeholder="John Doe"
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-sm font-medium text-gray-300 mb-1 block">Phone Number</span>
                                                <input
                                                    required
                                                    type="tel"
                                                    value={newAddress.recipient_phone}
                                                    onChange={e => setNewAddress({ ...newAddress, recipient_phone: e.target.value })}
                                                    className="w-full bg-[#221022] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                                    placeholder="(084) 123-456-789"
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-sm font-medium text-gray-300 mb-1 block">Province / City</span>
                                                <select
                                                    required
                                                    value={newAddress.province_id}
                                                    onChange={handleProvinceChange}
                                                    className="w-full bg-[#221022] border-[#482348] rounded-lg text-white focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                                >
                                                    <option value="">Select Province</option>
                                                    {provinces.map(p => (
                                                        <option key={p.province_id} value={p.province_id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="block">
                                                <span className="text-sm font-medium text-gray-300 mb-1 block">District / Ward</span>
                                                <select
                                                    required
                                                    value={newAddress.ward_id}
                                                    onChange={e => setNewAddress({ ...newAddress, ward_id: e.target.value })}
                                                    disabled={!newAddress.province_id}
                                                    className="w-full bg-[#221022] border-[#482348] rounded-lg text-white focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors disabled:opacity-50"
                                                >
                                                    <option value="">Select Ward</option>
                                                    {wards.map(w => (
                                                        <option key={w.ward_id} value={w.ward_id}>{w.name}</option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="block md:col-span-2">
                                                <span className="text-sm font-medium text-gray-300 mb-1 block">Detailed Address</span>
                                                <input
                                                    required
                                                    value={newAddress.street}
                                                    onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                                    className="w-full bg-[#221022] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                                    placeholder="House Number, Street Name"
                                                />
                                            </label>
                                            <div className="md:col-span-2 flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={newAddress.is_default}
                                                        onChange={e => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-600 bg-[#221022] checked:border-[#d411d4] checked:bg-[#d411d4] transition-all"
                                                    />
                                                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-sm font-bold">check</span>
                                                </div>
                                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Set as default address</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t border-[#482348]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsAddingNew(false);
                                                    if (addresses.length === 0) {
                                                        // Keep it visible if no addresses? Or maybe just simple close
                                                    }
                                                }}
                                                className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#482348] transition-colors"
                                                disabled={addresses.length === 0}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={savingAddress}
                                                className="bg-[#d411d4] hover:bg-[#d411d4]/90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#d411d4]/20 flex items-center gap-2"
                                            >
                                                {savingAddress && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                                Save Address
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                <p>No addresses found. Please add a shipping address.</p>
                                                <button
                                                    onClick={() => setIsAddingNew(true)}
                                                    className="mt-4 text-[#d411d4] hover:underline"
                                                >
                                                    Add your first address
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {addresses.map((address) => (
                                                    <label
                                                        key={address.shipping_address_id}
                                                        className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === address.shipping_address_id
                                                            ? 'border-[#d411d4] bg-[#d411d4]/5'
                                                            : 'border-[#482348] bg-[#2d152d] hover:border-gray-600'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="shipping_address"
                                                            className="mt-1 w-5 h-5 text-[#d411d4] bg-transparent border-gray-500 focus:ring-[#d411d4]"
                                                            checked={selectedAddressId === address.shipping_address_id}
                                                            onChange={() => setSelectedAddressId(address.shipping_address_id)}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-white">{address.recipient_name}</span>
                                                                <span className="text-gray-400 text-sm">|</span>
                                                                <span className="text-gray-300 text-sm">{address.recipient_phone}</span>
                                                                {address.is_default && (
                                                                    <span className="ml-auto text-[10px] uppercase font-bold bg-[#d411d4]/20 text-[#d411d4] px-2 py-0.5 rounded-full">Default</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-400">{address.full_address}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-[#482348] pb-4">Shipping Method</h2>
                                <div className="space-y-3">
                                    {Object.entries(SHIPPING_OPTIONS).map(([key, option]) => {
                                        const selected = shippingMethod === key;
                                        return (
                                            <label
                                                key={key}
                                                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-colors ${selected ? 'border-[#d411d4] bg-[#d411d4]/10' : 'border-[#482348] bg-[#2d152d] hover:border-gray-500'
                                                    }`}
                                            >
                                                <input
                                                    className="sr-only"
                                                    name="delivery-method"
                                                    type="radio"
                                                    value={key}
                                                    checked={selected}
                                                    onChange={() => setShippingMethod(key)}
                                                />
                                                <span className="flex flex-1">
                                                    <span className="flex flex-col">
                                                        <span className="block text-sm font-bold">{option.label}</span>
                                                        <span className="mt-1 flex items-center text-sm text-gray-300">{option.description}</span>
                                                    </span>
                                                </span>
                                                {selected && <span className="material-symbols-outlined text-[#d411d4] mt-0.5">check_circle</span>}
                                                <span className="ml-4 mt-0.5 text-sm font-bold">{formatPriceVND(option.price)}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-[#482348] pb-4">Payment Method</h2>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {[
                                        { key: 'cash', label: 'Cash on Delivery', icon: 'payments' },
                                        { key: 'card', label: 'Credit / Debit Card', icon: 'credit_card' },
                                    ].map((method) => {
                                        const selected = paymentMethod === method.key;
                                        return (
                                            <label
                                                key={method.key}
                                                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selected ? 'border-[#d411d4] bg-[#d411d4]/10' : 'border-[#482348] bg-[#2d152d] hover:border-gray-500'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment-method"
                                                    className="sr-only"
                                                    checked={selected}
                                                    onChange={() => setPaymentMethod(method.key)}
                                                />
                                                <span className="material-symbols-outlined text-xl text-[#d411d4]">{method.icon}</span>
                                                <span className="text-sm font-medium">{method.label}</span>
                                                {selected && <span className="material-symbols-outlined text-[#d411d4] ml-auto">check</span>}
                                            </label>
                                        );
                                    })}
                                </div>
                            </section>

                            <div className="mt-8 pt-6 border-t border-[#482348]">
                                {paymentMethod === 'card' && clientSecret ? (
                                    <Elements options={{ clientSecret, theme: 'night', appearance: { theme: 'night', variables: { colorPrimary: '#d411d4' } } }} stripe={stripePromise}>
                                        <CheckoutForm
                                            amount={total}
                                            onSuccess={async (paymentIntent) => {
                                                // After stripe success, we should formally place the order in backend
                                                // Ideally, backend webhook handles this, but for UX we can call placeOrder with transaction info or trust the previous intent creation
                                                // We will call handlePlaceOrder but with payment_status=paid if we modified backend to support it, 
                                                // OR just rely on the webhook.
                                                // For this simple integration, we'll proceed to place order logic.
                                                // Actually, handlePlaceOrder creates 'pending' order.
                                                // We might want to pass transaction ID.
                                                await handlePlaceOrder();
                                            }}
                                            onError={(msg) => setOrderError(msg)}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
                                        <Link to="/cart" preventScrollReset className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium py-3">
                                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                                            Return to Cart
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handlePlaceOrder}
                                            disabled={disablePlaceOrder}
                                            className={`w-full sm:w-auto bg-[#d411d4] hover:bg-[#d411d4]/90 text-white font-bold py-4 px-12 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-[#d411d4]/20 text-lg tracking-wide uppercase ${disablePlaceOrder ? 'pointer-events-none opacity-60' : ''}`}
                                        >
                                            {placingOrder ? 'Placing Order...' : 'Place Order'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {orderError && (
                                <p className="text-sm text-red-400 text-center sm:text-right -mt-2">{orderError}</p>
                            )}
                        </div>

                        <div className="lg:col-span-5 xl:col-span-4 mt-12 lg:mt-0">
                            <div className="sticky top-24 bg-[#2d152d] border border-[#482348] rounded-xl overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-[#482348] bg-white/5">
                                    <h3 className="text-lg font-bold uppercase tracking-wider">Order Summary</h3>
                                </div>
                                <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
                                    {cartLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="flex gap-4 animate-pulse">
                                                    <div className="w-20 h-24 bg-gray-800 rounded-lg" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 bg-gray-700 rounded w-1/2" />
                                                        <div className="h-3 bg-gray-700 rounded w-1/3" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : filteredItems.length === 0 ? (
                                        <p className="text-sm text-[#c992c9]">Your cart is empty.</p>
                                    ) : (
                                        filteredItems.map((item) => {
                                            const attrs = item.variant_attributes || {};
                                            const colorName = attrs.color_name || attrs.color || 'Color';
                                            const sizeLabel = attrs.size || attrs.size_name || 'Size';
                                            const variantImages = Array.isArray(item.variant_images) ? item.variant_images : [];
                                            const variantThumbnail = item.variant_thumbnail || variantImages[0] || item.product.thumbnail;

                                            return (
                                                <div key={item.cart_item_id} className="flex gap-4">
                                                    <div className="relative w-20 h-24 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-[#482348]">
                                                        <div
                                                            className="w-full h-full bg-cover bg-center"
                                                            style={{ backgroundImage: `url('${variantThumbnail}')` }}
                                                        ></div>
                                                        <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold min-w-[24px] h-6 px-1 flex items-center justify-center rounded-full shadow-md">
                                                            {item.purchasable_quantity || item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-between py-1">
                                                        <div>
                                                            <h4 className="font-bold text-sm line-clamp-2">{item.product.name}</h4>
                                                            <p className="text-gray-400 text-xs mt-1">Size: {sizeLabel} / Color: {colorName}</p>
                                                        </div>
                                                        <p className="font-medium text-sm">{formatPriceVND(item.line_total)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="px-6 py-4 border-t border-[#482348] bg-[#221022]/30">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-[#221022] border border-[#482348] rounded-lg text-sm text-white placeholder-gray-500 px-3 py-2 focus:ring-1 focus:ring-[#d411d4] focus:border-[#d411d4] transition-colors"
                                                placeholder="Discount code"
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyDiscount}
                                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {discountMessage && (
                                            <p className={`text-xs ${appliedDiscount ? 'text-green-400' : 'text-red-400'}`}>
                                                {discountMessage}
                                            </p>
                                        )}
                                        {eligibleDiscounts.length > 0 && (
                                            <div className="text-xs text-gray-400 space-y-1">
                                                <p className="font-semibold text-gray-300">Mã giảm giá khả dụng:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {eligibleDiscounts.slice(0, 4).map((d) => (
                                                        <button
                                                            key={d.discount_id}
                                                            type="button"
                                                            onClick={() => {
                                                                setDiscountCode(d.code);
                                                                handleApplyDiscount(d.code);
                                                            }}
                                                            className="px-2 py-1 rounded-full border border-[#482348] hover:border-[#d411d4] hover:text-white text-gray-300 transition-colors"
                                                        >
                                                            {d.code} ({d.type === 'percentage' ? `${d.value}%` : formatPriceVND(d.value)})
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 border-t border-[#482348] bg-[#221022]/30 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Subtotal</span>
                                        <span className="font-medium">{formatPriceVND(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <span>Shipping</span>
                                            <span className="material-symbols-outlined text-gray-500 text-[16px] cursor-help">help</span>
                                        </div>
                                        <span className="font-medium">{formatPriceVND(shipping)}</span>
                                    </div>
                                    {appliedDiscount && discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-green-400">
                                            <span>Discount ({appliedDiscount.code})</span>
                                            <span>-{formatPriceVND(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-[#482348] my-4 pt-4 flex justify-between items-end">
                                        <span className="text-base font-bold">Total</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs text-gray-400">VND</span>
                                            <span className="text-2xl font-bold text-[#d411d4] tracking-tight">{formatPriceVND(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-wrap justify-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <span className="material-symbols-outlined text-4xl text-gray-400">credit_card</span>
                                <span className="material-symbols-outlined text-4xl text-gray-400">account_balance</span>
                                <span className="material-symbols-outlined text-4xl text-gray-400">lock_clock</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-[#482348] py-8 mt-auto bg-[#2d152d]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">Ac 2024 BasicColor Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-gray-400">
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Refund Policy</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CheckoutPage;
