"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import Link from "next/link";
import { FiHome, FiDatabase, FiShoppingBag, FiArrowLeft, FiUsers } from "react-icons/fi";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!loading && mounted && (!user || userData?.role !== "admin")) {
            router.push("/");
        }
    }, [user, userData, loading, router, mounted]);

    if (!mounted || loading || !user || userData?.role !== "admin") {
        return (
            <div className="page-container" style={{ display: "flex", justifyContent: "center", padding: 120 }}>
                <div className="spinner" />
            </div>
        );
    }

    const navItems = [
        { href: "/admin", icon: <FiHome size={18} />, label: "Dashboard" },
        { href: "/admin/leads", icon: <FiDatabase size={18} />, label: "Manage Leads" },
        { href: "/admin/orders", icon: <FiShoppingBag size={18} />, label: "Orders" },
        { href: "/admin/users", icon: <FiUsers size={18} />, label: "Users" },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", paddingTop: 72 }}>
            {/* Sidebar */}
            <aside
                className="admin-sidebar"
                style={{
                    width: 260,
                    background: "var(--bg-secondary)",
                    borderRight: "1px solid var(--border-color)",
                    padding: "24px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    position: "fixed",
                    top: 72,
                    bottom: 0,
                    left: 0,
                    overflowY: "auto",
                }}
            >
                <div style={{ padding: "0 12px", marginBottom: 24 }}>
                    <span className="badge badge-admin">Admin Panel</span>
                </div>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "12px 16px",
                                borderRadius: "var(--radius-md)",
                                textDecoration: "none",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                color: isActive ? "var(--accent-secondary)" : "var(--text-secondary)",
                                background: isActive ? "rgba(108, 92, 231, 0.1)" : "transparent",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}

                <div style={{ marginTop: "auto" }}>
                    <Link
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            borderRadius: "var(--radius-md)",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            color: "var(--text-muted)",
                        }}
                    >
                        <FiArrowLeft size={18} /> Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main" style={{ flex: 1, marginLeft: 260, padding: "32px 40px" }}>
                {children}
            </main>
        </div>
    );
}
