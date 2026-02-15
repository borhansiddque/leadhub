"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FiUsers, FiMail, FiCalendar, FiDollarSign, FiShoppingBag, FiStar } from "react-icons/fi";

interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: "admin" | "customer";
    createdAt: any;
    totalSpent: number;
    orderCount: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Fetch all users
                const usersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
                const usersList = usersSnap.docs.map(doc => ({ ...doc.data() } as UserProfile));

                // 2. Fetch all orders to calculate spend
                const ordersSnap = await getDocs(collection(db, "orders"));
                const ordersData = ordersSnap.docs.map(doc => doc.data());

                // 3. Map orders to users
                const usersWithStats = usersList.map(user => {
                    const userOrders = ordersData.filter(order => order.userId === user.uid);
                    return {
                        ...user,
                        totalSpent: userOrders.reduce((sum, order) => sum + (order.price || 0), 0),
                        orderCount: userOrders.length
                    };
                });

                setUsers(usersWithStats);
            } catch (error) {
                console.error("Error fetching admin users data:", error);
            }
            setLoading(false);
        }

        fetchData();
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
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>
                    User <span className="gradient-text">Management</span>
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    View and manage all registered users and their platform activity.
                </p>
            </div>

            {/* User Table */}
            <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
                                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>USER</th>
                                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>ROLE</th>
                                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>JOINED</th>
                                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>PURCHASES</th>
                                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", textAlign: "right" }}>TOTAL SPENT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.uid} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.2s" }} className="table-row-hover">
                                    <td style={{ padding: "20px 24px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: "var(--radius-md)",
                                                background: u.role === "admin" ? "var(--warning)" : "var(--accent-gradient)",
                                                display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700
                                            }}>
                                                {u.displayName?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{u.displayName || "Unknown User"}</div>
                                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                                                    <FiMail size={12} /> {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "20px 24px" }}>
                                        <span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-customer"}`} style={{
                                            background: u.role === "admin" ? "rgba(255, 171, 0, 0.1)" : "rgba(108, 92, 231, 0.1)",
                                            color: u.role === "admin" ? "var(--warning)" : "var(--accent-secondary)",
                                            padding: "4px 10px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize"
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "20px 24px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <FiCalendar size={14} style={{ color: "var(--text-muted)" }} />
                                            {u.createdAt instanceof Timestamp ? u.createdAt.toDate().toLocaleDateString() : (u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : "N/A")}
                                        </div>
                                    </td>
                                    <td style={{ padding: "20px 24px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                                            <FiShoppingBag size={14} style={{ color: "var(--accent-secondary)" }} />
                                            {u.orderCount}
                                        </div>
                                    </td>
                                    <td style={{ padding: "20px 24px", textAlign: "right", fontWeight: 700 }} className="gradient-text">
                                        ${u.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .table-row-hover:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
            `}</style>
        </div>
    );
}
