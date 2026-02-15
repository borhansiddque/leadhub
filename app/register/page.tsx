"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiZap } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
    const { register, loginWithGoogle } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            await register(email, password, name);
            router.push("/dashboard");
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            if (firebaseError.code === "auth/email-already-in-use") {
                setError("An account with this email already exists.");
            } else {
                setError("Registration failed. Please try again.");
            }
        }
        setLoading(false);
    }

    async function handleGoogle() {
        setError("");
        try {
            await loginWithGoogle();
            router.push("/dashboard");
        } catch {
            setError("Google sign-in failed. Please try again.");
        }
    }

    return (
        <div
            className="grid-bg"
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "100px 24px 60px",
                position: "relative",
            }}
        >
            <div className="glow-orb" style={{ width: 300, height: 300, background: "#a78bfa", top: 150, left: "15%" }} />

            <div
                className="glass-card animate-fade-in-up"
                style={{ width: "100%", maxWidth: 440, padding: 40 }}
            >
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: "var(--radius-md)",
                            background: "var(--accent-gradient)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                        }}
                    >
                        <FiZap size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 8 }}>Create Account</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                        Start accessing premium business leads
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            background: "rgba(255, 87, 87, 0.1)",
                            border: "1px solid rgba(255, 87, 87, 0.2)",
                            borderRadius: "var(--radius-md)",
                            padding: "12px 16px",
                            marginBottom: 20,
                            color: "var(--danger)",
                            fontSize: "0.85rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogle}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        padding: "12px 20px",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontFamily: "inherit",
                    }}
                >
                    <FcGoogle size={20} />
                    Continue with Google
                </button>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        margin: "24px 0",
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                    }}
                >
                    <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
                    or
                    <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label className="input-label">Full Name</label>
                        <div style={{ position: "relative" }}>
                            <FiUser
                                size={16}
                                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                            />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="John Doe"
                                style={{ paddingLeft: 40 }}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Email</label>
                        <div style={{ position: "relative" }}>
                            <FiMail
                                size={16}
                                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                            />
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                style={{ paddingLeft: 40 }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Password</label>
                        <div style={{ position: "relative" }}>
                            <FiLock
                                size={16}
                                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                            />
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Min. 6 characters"
                                style={{ paddingLeft: 40 }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 24, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "var(--accent-secondary)", textDecoration: "none", fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
