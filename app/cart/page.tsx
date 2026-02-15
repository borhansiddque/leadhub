"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import {
    FiShoppingCart, FiTrash2, FiArrowLeft, FiCreditCard,
    FiCheckCircle, FiAlertCircle
} from "react-icons/fi";

export default function CartPage() {
    const { user, loading: authLoading } = useAuth();
    const { cart, removeFromCart, clearCart, getCartTotal } = useCart();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleCheckout = async () => {
        if (!user) {
            router.push("/login?redirect=/cart");
            return;
        }

        if (cart.length === 0) return;

        setIsCheckingOut(true);
        setError(null);

        try {
            const batch = writeBatch(db);

            cart.forEach((lead) => {
                // 1. Create order record
                const orderRef = doc(collection(db, "orders"));
                batch.set(orderRef, {
                    userId: user.uid,
                    userEmail: user.email,
                    leadId: lead.id,
                    leadData: {
                        firstName: lead.firstName,
                        lastName: lead.lastName,
                        email: lead.email,
                        jobTitle: lead.jobTitle,
                        websiteName: lead.websiteName,
                        websiteUrl: lead.websiteUrl,
                        instagram: lead.instagram,
                        linkedin: lead.linkedin,
                        industry: lead.industry,
                        location: lead.location,
                        tiktok: lead.tiktok,
                        founded: lead.founded,
                        facebookPixel: lead.facebookPixel,
                    },
                    price: lead.price,
                    purchasedAt: serverTimestamp(),
                });

                // 2. We no longer mark leads as sold, as they can be sold multiple times.
            });

            await batch.commit();
            clearCart();
            setSuccess(true);
        } catch (err: any) {
            console.error("Checkout error:", err);
            setError("Checkout failed. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (!mounted) return null;

    if (success) {
        return (
            <div className="page-container grid-bg" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="glass-card animate-fade-in" style={{ padding: 60, textAlign: "center", maxWidth: 500 }}>
                    <FiCheckCircle size={64} style={{ color: "var(--success)", marginBottom: 24 }} />
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 16 }}>Purchase Successful!</h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
                        Your leads are now available in your dashboard. You can access their full contact details immediately.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
                        <Link href="/leads" className="btn-secondary">Keep Browsing</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container grid-bg" style={{ minHeight: "100vh" }}>
            <div className="glow-orb" style={{ width: 300, height: 300, background: "#6c5ce7", top: 100, right: -50 }} />

            <div style={{ marginBottom: 40 }}>
                <Link
                    href="/leads"
                    style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", marginBottom: 24 }}
                >
                    <FiArrowLeft size={16} /> Back to Marketplace
                </Link>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 8 }}>
                    Shopping <span className="gradient-text">Cart</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>Review your selected leads before purchasing</p>
            </div>

            {cart.length === 0 ? (
                <div className="glass-card" style={{ padding: 80, textAlign: "center" }}>
                    <FiShoppingCart size={48} style={{ color: "var(--text-muted)", marginBottom: 24 }} />
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 12 }}>Your cart is empty</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                        Looks like you haven't added any leads to your cart yet. Browse our marketplace to find high-quality business leads.
                    </p>
                    <Link href="/leads" className="btn-primary">Browse Marketplace</Link>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
                    {/* Cart Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {cart.map((item) => (
                            <div key={item.id} className="glass-card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                                        {item.firstName?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 2 }}>{item.firstName} {item.lastName}</h3>
                                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.jobTitle} @ {item.websiteName}</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                                    <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>${item.price?.toFixed(2)}</div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 8 }}
                                        title="Remove item"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Card */}
                    <div className="glass-card" style={{ padding: 32, position: "sticky", top: 100 }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 24 }}>Order Summary</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                                <span>Items ({cart.length})</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                                <span>Processing Fee</span>
                                <span>$0.00</span>
                            </div>
                            <div className="divider" style={{ margin: "8px 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 800 }}>
                                <span>Total</span>
                                <span className="gradient-text">${getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: 12, background: "rgba(255, 107, 107, 0.1)", color: "#ff6b6b", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                                <FiAlertCircle size={16} /> {error}
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ width: "100%", height: 52, fontSize: "1rem" }}
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                        >
                            {isCheckingOut ? (
                                <div className="spinner" style={{ width: 20, height: 20, borderTopColor: "white" }} />
                            ) : (
                                <><FiCreditCard size={18} /> Secure Checkout</>
                            )}
                        </button>

                        <p style={{ marginTop: 20, fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
                            By proceeding, you agree to our terms of service. All sales are final once access is granted.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
