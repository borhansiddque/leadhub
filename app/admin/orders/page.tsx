"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FiCalendar, FiDollarSign, FiUser, FiMail, FiGlobe } from "react-icons/fi";

interface Order {
    id: string;
    userId: string;
    userEmail: string;
    leadId: string;
    leadData: {
        firstName: string;
        lastName: string;
        email: string;
        websiteName: string;
        jobTitle: string;
    };
    price: number;
    purchasedAt: { toDate: () => Date } | null;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const q = query(collection(db, "orders"), orderBy("purchasedAt", "desc"));
                const snapshot = await getDocs(q);
                setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)));
            } catch (error) {
                console.error("Error:", error);
            }
            setLoading(false);
        }
        fetchOrders();
    }, []);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4, letterSpacing: "-0.5px" }}>
                    Customer <span className="gradient-text">Orders</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Track all purchases made by customers</p>
            </div>

            {/* Revenue stat */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                <div className="stat-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(0, 214, 143, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
                            <FiDollarSign size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>${totalRevenue.toFixed(2)}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Revenue</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(108, 92, 231, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-secondary)" }}>
                            <FiUser size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{orders.length}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Orders</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                    <div className="spinner" />
                </div>
            ) : (
                <div style={{ overflowX: "auto", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Lead Name</th>
                                <th>Website</th>
                                <th>Lead Email</th>
                                <th>Price</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <FiMail size={13} style={{ color: "var(--text-muted)" }} />
                                                {order.userEmail}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>
                                            {order.leadData?.firstName} {order.leadData?.lastName}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                <FiGlobe size={13} /> {order.leadData?.websiteName || "—"}
                                            </div>
                                        </td>
                                        <td style={{ color: "var(--text-secondary)" }}>{order.leadData?.email}</td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: "var(--success)" }}>${order.price?.toFixed(2)}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                <FiCalendar size={13} />
                                                {mounted && order.purchasedAt ? order.purchasedAt.toDate().toLocaleDateString() : (order.purchasedAt ? "..." : "N/A")}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
