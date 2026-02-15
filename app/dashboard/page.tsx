"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
    FiMail, FiGlobe, FiBriefcase, FiMapPin, FiShoppingBag, FiCalendar,
    FiDollarSign, FiInstagram, FiLinkedin, FiMonitor,
} from "react-icons/fi";

interface Order {
    id: string;
    leadId: string;
    leadData: {
        firstName: string;
        lastName: string;
        email: string;
        jobTitle: string;
        websiteName: string;
        websiteUrl: string;
        instagram: string;
        linkedin: string;
        industry: string;
        location: string;
        tiktok: string;
        founded: string;
        facebookPixel: string;
    };
    price: number;
    purchasedAt: { toDate: () => Date } | null;
}

export default function DashboardPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        async function fetchOrders() {
            try {
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user!.uid),
                    orderBy("purchasedAt", "desc")
                );
                const snapshot = await getDocs(q);
                setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)));
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
            setLoading(false);
        }

        fetchOrders();
    }, [user, authLoading, router]);

    if (!mounted || authLoading || loading) {
        return (
            <div className="page-container" style={{ display: "flex", justifyContent: "center", padding: 120 }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page-container grid-bg" style={{ minHeight: "100vh", position: "relative" }}>
            <div className="glow-orb" style={{ width: 300, height: 300, background: "#a78bfa", top: 50, left: -80 }} />

            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-1px" }}>
                    My <span className="gradient-text">Dashboard</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
                    Welcome back, {userData?.displayName || user?.email}
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
                <div className="stat-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(108, 92, 231, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-secondary)" }}>
                            <FiShoppingBag size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{orders.length}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Purchased Leads</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(0, 214, 143, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
                            <FiDollarSign size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>${orders.reduce((sum, o) => sum + (o.price || 0), 0).toFixed(2)}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Spent</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchased Leads */}
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 20 }}>Purchased Leads</h2>

            {orders.length === 0 ? (
                <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                    <FiShoppingBag size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 8, color: "var(--text-secondary)" }}>No purchases yet</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
                        Browse the marketplace to find your first leads.
                    </p>
                    <a href="/leads" className="btn-primary btn-small">Browse Leads</a>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {orders.map((order, i) => {
                        const d = order.leadData;
                        const fullName = `${d.firstName || ""} ${d.lastName || ""}`.trim();
                        return (
                            <div
                                key={order.id}
                                className="glass-card animate-fade-in-up"
                                style={{ padding: 24, opacity: 0, animationDelay: `${i * 0.05}s` }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                                    <div style={{ display: "flex", gap: 16, flex: 1 }}>
                                        <div
                                            style={{
                                                width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--accent-gradient)",
                                                display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700,
                                                fontSize: "1.1rem", flexShrink: 0,
                                            }}
                                        >
                                            {d.firstName?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 4 }}>{fullName}</h3>
                                            {d.jobTitle && (
                                                <div style={{ color: "var(--accent-secondary)", fontSize: "0.85rem", marginBottom: 8 }}>{d.jobTitle}</div>
                                            )}
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                    <FiMail size={13} /> {d.email}
                                                </div>
                                                {d.websiteUrl && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                        <FiGlobe size={13} /> {d.websiteUrl}
                                                    </div>
                                                )}
                                                {d.websiteName && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                        <FiBriefcase size={13} /> {d.websiteName}
                                                    </div>
                                                )}
                                                {d.location && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                        <FiMapPin size={13} /> {d.location}
                                                    </div>
                                                )}
                                                {d.instagram && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                        <FiInstagram size={13} /> {d.instagram}
                                                    </div>
                                                )}
                                                {d.linkedin && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                        <FiLinkedin size={13} /> {d.linkedin}
                                                    </div>
                                                )}
                                                {d.tiktok && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                        <FiMonitor size={13} /> TikTok: {d.tiktok}
                                                    </div>
                                                )}
                                                {d.founded && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                        <FiCalendar size={13} /> Founded: {d.founded}
                                                    </div>
                                                )}
                                                {d.facebookPixel && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                        <FiMonitor size={13} /> Facebook Pixel: {d.facebookPixel}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 700 }} className="gradient-text">${order.price?.toFixed(2)}</div>
                                        {order.purchasedAt && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 4 }}>
                                                <FiCalendar size={11} />
                                                {order.purchasedAt.toDate().toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
