"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
    FiArrowLeft, FiMail, FiGlobe, FiBriefcase, FiMapPin, FiDollarSign,
    FiShoppingCart, FiCheck, FiInstagram, FiLinkedin, FiCalendar, FiMonitor,
} from "react-icons/fi";

interface Lead {
    id: string;
    websiteName: string;
    websiteUrl: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    instagram: string;
    linkedin: string;
    industry: string;
    location: string;
    tiktok: string;
    founded: string;
    facebookPixel: string;
    price: number;
    status: string;
    createdAt: unknown;
}

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        async function fetchLead() {
            try {
                const docRef = doc(db, "leads", params.id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setLead({ id: docSnap.id, ...docSnap.data() } as Lead);
                }
            } catch (error) {
                console.error("Error fetching lead:", error);
            }
            setLoading(false);
        }
        if (params.id) fetchLead();
    }, [params.id]);

    async function handlePurchase() {
        if (!user || !lead) return;
        setPurchasing(true);
        try {
            await addDoc(collection(db, "orders"), {
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

            await updateDoc(doc(db, "leads", lead.id), { status: "sold" });
            setPurchased(true);
        } catch (error) {
            console.error("Error purchasing lead:", error);
            alert("Purchase failed. Please try again.");
        }
        setPurchasing(false);
    }

    if (loading) {
        return (
            <div className="page-container" style={{ display: "flex", justifyContent: "center", padding: 120 }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="page-container" style={{ textAlign: "center", padding: 120 }}>
                <h2 style={{ marginBottom: 16 }}>Lead not found</h2>
                <Link href="/leads" className="btn-primary">Back to Marketplace</Link>
            </div>
        );
    }

    const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
    const isHidden = lead.status === "available" && !purchased;
    const showPurchaseActions = mounted && !authLoading;

    return (
        <div className="page-container grid-bg" style={{ minHeight: "100vh", position: "relative" }}>
            <div className="glow-orb" style={{ width: 300, height: 300, background: "#6c5ce7", top: 80, right: -80 }} />

            <Link
                href="/leads"
                style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", marginBottom: 32,
                }}
            >
                <FiArrowLeft size={16} /> Back to Marketplace
            </Link>

            <div className="lead-grid-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
                {/* Lead Info */}
                <div className="glass-card animate-fade-in-up" style={{ padding: 36 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                        <div
                            style={{
                                width: 64, height: 64, borderRadius: "var(--radius-lg)", background: "var(--accent-gradient)",
                                display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.5rem",
                            }}
                        >
                            {lead.firstName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 4 }}>{fullName || "Unknown"}</h1>
                            <span className={`badge ${lead.status === "available" ? "badge-available" : "badge-sold"}`}>
                                {lead.status}
                            </span>
                        </div>
                    </div>

                    <div className="divider" />

                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 20, color: "var(--text-secondary)" }}>
                        Business Information
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {lead.jobTitle && <InfoItem icon={<FiBriefcase size={16} />} label="Job Title" value={lead.jobTitle} />}
                        {lead.websiteName && <InfoItem icon={<FiGlobe size={16} />} label="Website Name" value={lead.websiteName} />}
                        {lead.industry && <InfoItem icon={<FiBriefcase size={16} />} label="Industry" value={lead.industry} />}
                        {lead.location && <InfoItem icon={<FiMapPin size={16} />} label="Location" value={lead.location} />}
                        {lead.founded && <InfoItem icon={<FiCalendar size={16} />} label="Founded" value={lead.founded} />}
                        {lead.facebookPixel && <InfoItem icon={<FiMonitor size={16} />} label="Facebook Pixel Status" value={lead.facebookPixel} />}
                    </div>

                    <div className="divider" />

                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 20, color: "var(--text-secondary)" }}>
                        Contact Details {isHidden && "(visible after purchase)"}
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <InfoItem icon={<FiMail size={16} />} label="Email" value={isHidden ? "••••••@••••.com" : lead.email} />
                        {lead.websiteUrl && <InfoItem icon={<FiGlobe size={16} />} label="Website URL" value={isHidden ? "https://•••••.com" : lead.websiteUrl} />}
                        {lead.instagram && <InfoItem icon={<FiInstagram size={16} />} label="Instagram" value={isHidden ? "@••••••" : lead.instagram} />}
                        {lead.linkedin && <InfoItem icon={<FiLinkedin size={16} />} label="LinkedIn" value={isHidden ? "linkedin.com/••••" : lead.linkedin} />}
                        {lead.tiktok && <InfoItem icon={<FiMonitor size={16} />} label="TikTok" value={isHidden ? "@••••••" : lead.tiktok} />}
                    </div>
                </div>

                {/* Purchase Card */}
                <div className="glass-card animate-fade-in-up delay-200" style={{ padding: 32, position: "sticky", top: 100 }}>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800 }} className="gradient-text">
                            ${lead.price?.toFixed(2)}
                        </div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>One-time purchase</p>
                    </div>

                    <div className="divider" />

                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                        {[
                            "Full contact information",
                            "Email & social media links",
                            "Website URL & details",
                            "Instant access",
                        ].map((item, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                <FiCheck size={16} style={{ color: "var(--success)" }} />
                                {item}
                            </li>
                        ))}
                    </ul>

                    {showPurchaseActions ? (
                        <>
                            {purchased ? (
                                <div
                                    style={{
                                        textAlign: "center", padding: 16,
                                        background: "rgba(0, 214, 143, 0.1)", borderRadius: "var(--radius-md)",
                                        color: "var(--success)", fontWeight: 600,
                                    }}
                                >
                                    <FiCheck size={20} style={{ marginBottom: 8 }} />
                                    <br />
                                    Purchase Complete!
                                    <br />
                                    <Link href="/dashboard" style={{ color: "var(--accent-secondary)", fontSize: "0.85rem" }}>
                                        View in Dashboard →
                                    </Link>
                                </div>
                            ) : lead.status === "sold" ? (
                                <button className="btn-primary" disabled style={{ width: "100%", opacity: 0.5 }}>
                                    Already Sold
                                </button>
                            ) : !user ? (
                                <Link href="/login" className="btn-primary" style={{ width: "100%", textDecoration: "none", textAlign: "center" }}>
                                    Sign In to Purchase
                                </Link>
                            ) : (
                                <button
                                    className="btn-primary"
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    style={{ width: "100%" }}
                                >
                                    {purchasing ? "Processing..." : (
                                        <><FiShoppingCart size={16} /> Buy Now</>
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <div style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div className="spinner" style={{ width: 24, height: 24 }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
                style={{
                    width: 36, height: 36, borderRadius: "var(--radius-sm)",
                    background: "rgba(108, 92, 231, 0.1)", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "var(--accent-secondary)", flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {label}
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>{value}</div>
            </div>
        </div>
    );
}
