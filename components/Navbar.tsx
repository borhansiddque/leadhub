"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FiLogOut, FiUser, FiShoppingBag, FiSettings, FiZap, FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
    const { user, userData, logout, loading } = useAuth();
    const { cart } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const showAuth = mounted && !loading;

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: "rgba(10, 10, 15, 0.8)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--border-color)",
            }}
        >
            <div
                style={{
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 72,
                }}
            >
                {/* Logo */}
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        textDecoration: "none",
                        color: "var(--text-primary)",
                    }}
                >
                    <img src="/logo.svg" alt="LeadHub" style={{ width: 36, height: 36 }} />
                    <span style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.5px" }}>
                        Lead<span className="gradient-text">Hub</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                    className="desktop-nav"
                >
                    <Link href="/leads" style={navLinkStyle}>
                        <FiShoppingBag size={16} />
                        Marketplace
                    </Link>

                    {showAuth && !user && (
                        <>
                            <Link href="/login" style={navLinkStyle}>
                                Sign In
                            </Link>
                            <Link href="/register" className="btn-primary btn-small" style={{ textDecoration: "none" }}>
                                Get Started
                            </Link>
                        </>
                    )}

                    {showAuth && user && (
                        <>
                            {userData?.role === "admin" && (
                                <Link href="/admin" style={navLinkStyle}>
                                    <FiSettings size={16} />
                                    Admin
                                </Link>
                            )}
                            <Link href="/dashboard" style={navLinkStyle}>
                                <FiUser size={16} />
                                Dashboard
                            </Link>
                            <button
                                onClick={logout}
                                style={{
                                    ...navLinkStyle,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiLogOut size={16} />
                                Logout
                            </button>
                        </>
                    )}

                    <Link href="/cart" style={{ ...navLinkStyle, position: "relative" }}>
                        <FiShoppingCart size={18} />
                        {mounted && cart.length > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    background: "var(--accent-primary)",
                                    color: "white",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    width: 16,
                                    height: 16,
                                    borderRadius: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid var(--bg-card)",
                                }}
                            >
                                {cart.length}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="mobile-toggle"
                    style={{
                        display: "none",
                        background: "none",
                        border: "none",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        padding: 8,
                    }}
                >
                    {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div
                    className="mobile-menu"
                    style={{
                        padding: "16px 24px 24px",
                        borderTop: "1px solid var(--border-color)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    <Link href="/leads" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>
                        <FiShoppingBag size={16} /> Marketplace
                    </Link>
                    <Link href="/cart" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>
                        <FiShoppingCart size={16} /> Cart {mounted && cart.length > 0 && `(${cart.length})`}
                    </Link>
                    {showAuth && !user && (
                        <>
                            <Link href="/login" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>
                                Sign In
                            </Link>
                            <Link href="/register" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>
                                Get Started
                            </Link>
                        </>
                    )}
                    {showAuth && user && (
                        <>
                            {userData?.role === "admin" && (
                                <Link href="/admin" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>
                                    <FiSettings size={16} /> Admin
                                </Link>
                            )}
                            <Link href="/dashboard" style={mobileLinkStyle} onClick={() => setMobileOpen(false)}>
                                <FiUser size={16} /> Dashboard
                            </Link>
                            <button
                                onClick={() => {
                                    logout();
                                    setMobileOpen(false);
                                }}
                                style={{
                                    ...mobileLinkStyle,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    fontFamily: "inherit",
                                    width: "100%",
                                }}
                            >
                                <FiLogOut size={16} /> Logout
                            </button>
                        </>
                    )}
                </div>
            )}


        </nav>
    );
}

const navLinkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: "var(--radius-full)",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.2s ease",
};

const mobileLinkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: 500,
};
