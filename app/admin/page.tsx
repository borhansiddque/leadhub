"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { FiDatabase, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus, FiList, FiUsers } from "react-icons/fi";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalLeads: 0, availableLeads: 0, totalRevenue: 0, totalOrders: 0, totalCustomers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const leadsRef = collection(db, "leads");
                const ordersRef = collection(db, "orders");

                const [totalSnap, availableSnap, ordersSnap] = await Promise.all([
                    getCountFromServer(leadsRef),
                    getCountFromServer(query(leadsRef, where("status", "==", "available"))),
                    getDocs(ordersRef),
                ]);

                const ordersData = ordersSnap.docs.map(doc => doc.data());
                const totalRevenue = ordersData.reduce((sum, order) => sum + (order.price || 0), 0);
                const uniqueCustomers = new Set(ordersData.map(order => order.userId)).size;

                setStats({
                    totalLeads: totalSnap.data().count,
                    availableLeads: availableSnap.data().count,
                    totalRevenue,
                    totalOrders: ordersSnap.docs.length,
                    totalCustomers: uniqueCustomers,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>
                Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: 36 }}>
                Manage your leads and track sales
            </p>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
                {[
                    { label: "Total Leads", value: stats.totalLeads.toLocaleString(), icon: <FiDatabase size={22} />, color: "var(--accent-secondary)" },
                    { label: "Available", value: stats.availableLeads.toLocaleString(), icon: <FiTrendingUp size={22} />, color: "var(--success)" },
                    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: <FiDollarSign size={22} />, color: "var(--warning)" },
                    { label: "Total Sales", value: stats.totalOrders.toLocaleString(), icon: <FiShoppingBag size={22} />, color: "var(--accent-secondary)" },
                    { label: "Unique Customers", value: stats.totalCustomers.toLocaleString(), icon: <FiUsers size={22} />, color: "var(--accent-primary)" },
                ].map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "var(--radius-md)",
                                    background: `${stat.color}15`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: stat.color,
                                }}
                            >
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{stat.value}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <Link
                    href="/admin/leads"
                    className="glass-card"
                    style={{
                        padding: 28,
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "var(--radius-md)",
                            background: "var(--accent-gradient)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                        }}
                    >
                        <FiPlus size={22} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Add / Upload Leads</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Add single or bulk upload CSV</div>
                    </div>
                </Link>

                <Link
                    href="/admin/orders"
                    className="glass-card"
                    style={{
                        padding: 28,
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "var(--radius-md)",
                            background: "linear-gradient(135deg, #00d68f, #00b37a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                        }}
                    >
                        <FiList size={22} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>View Orders</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>See all customer purchases</div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
