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
    status: "pending" | "confirmed";
    leadData: {
        firstName: string;
        lastName: string;
        email: string;
        websiteName: string;
        jobTitle: string;
        industry: string;
    };
    purchasedAt: { toDate: () => Date } | null;
}

const INDUSTRIES = ["All", "Technology", "Healthcare", "Finance", "Real Estate", "E-commerce", "Education", "Marketing", "Legal", "Manufacturing", "Retail", "Food & Beverage", "Other"];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [approving, setApproving] = useState<string | null>(null);
    const [industryFilter, setIndustryFilter] = useState("All");

    useEffect(() => { setMounted(true); }, []);

    async function fetchOrders() {
        setLoading(true);
        try {
            const q = query(collection(db, "orders"), orderBy("purchasedAt", "desc"));
            const snapshot = await getDocs(q);
            setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)));
        } catch (error) {
            console.error("Error:", error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleApprove = async (orderId: string) => {
        if (!confirm("Are you sure you want to approve this payment? This will grant the user full access to the lead.")) return;
        setApproving(orderId);
        try {
            const { updateDoc, doc } = await import("firebase/firestore");
            await updateDoc(doc(db, "orders", orderId), {
                status: "confirmed"
            });
            // Refresh local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "confirmed" } : o));
        } catch (error) {
            console.error("Error approving order:", error);
            alert("Failed to approve order.");
        }
        setApproving(null);
    };

    const filteredOrders = orders.filter(o =>
        industryFilter === "All" || o.leadData?.industry === industryFilter
    );

    const totalRevenue = items => items.reduce((sum, o) => sum + (o.price || 0), 0);
    const confirmedRevenue = orders.filter(o => o.status === "confirmed").reduce((sum, o) => sum + (o.price || 0), 0);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4, letterSpacing: "-0.5px" }}>
                        Customer <span className="gradient-text">Orders</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Track and approve customer purchases</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>FILTER BY INDUSTRY:</label>
                    <select
                        className="input-field"
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                        style={{ width: "auto", minWidth: 160, padding: "8px 12px", height: "auto", fontSize: "0.9rem" }}
                    >
                        {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                </div>
            </div>

            {/* Revenue stat */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                <div className="stat-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(0, 214, 143, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
                            <FiDollarSign size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>${confirmedRevenue.toFixed(2)}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Confirmed Revenue</div>
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
                                <th>Industry</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                        {orders.length === 0 ? "No orders yet." : "No orders matching this industry."}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
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
                                        <td>
                                            <span style={{ fontSize: "0.75rem", padding: "3px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}>
                                                {order.leadData?.industry || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>${order.price?.toFixed(2)}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${order.status === "confirmed" ? "badge-available" : "badge-sold"}`} style={{
                                                textTransform: "capitalize",
                                                background: order.status === "confirmed" ? "rgba(0, 214, 143, 0.1)" : "rgba(255, 107, 107, 0.1)",
                                                color: order.status === "confirmed" ? "var(--success)" : "#ff6b6b"
                                            }}>
                                                {order.status || "pending"}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                <FiCalendar size={13} />
                                                {mounted && order.purchasedAt ? order.purchasedAt.toDate().toLocaleDateString() : (order.purchasedAt ? "..." : "N/A")}
                                            </div>
                                        </td>
                                        <td>
                                            {order.status !== "confirmed" && (
                                                <button
                                                    className="btn-primary btn-xs"
                                                    disabled={approving === order.id}
                                                    onClick={() => handleApprove(order.id)}
                                                    style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                                >
                                                    {approving === order.id ? "..." : "Approve"}
                                                </button>
                                            )}
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
