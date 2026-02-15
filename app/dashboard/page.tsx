"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FiDollarSign, FiInstagram, FiLinkedin, FiMonitor, FiDownload, FiSearch, FiHeart,
    FiMail, FiGlobe, FiBriefcase, FiMapPin, FiShoppingBag, FiCalendar, FiClock, FiSettings, FiActivity, FiUser
} from "react-icons/fi";
import * as XLSX from "xlsx";

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
}

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
    status: "pending" | "confirmed";
    purchasedAt: { toDate: () => Date } | null;
}

export default function DashboardPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [indexUrl, setIndexUrl] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [activeTab, setActiveTab] = useState<"purchased" | "wishlist" | "activity">("purchased");
    const [wishlistLeads, setWishlistLeads] = useState<Lead[]>([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        async function fetchOrders() {
            setError(null);
            try {
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user!.uid),
                    orderBy("purchasedAt", "desc")
                );
                const snapshot = await getDocs(q);
                setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)));
            } catch (error: any) {
                console.error("Error fetching orders:", error);
                const msg = error.message || "";
                if (msg.toLowerCase().includes("index")) {
                    setError("This view requires a database index.");
                    const match = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
                    if (match) setIndexUrl(match[0]);
                } else {
                    setError("Failed to load your orders. Please try again.");
                }
            }
            setLoading(false);
        }

        fetchOrders();
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user || activeTab !== "wishlist") return;

        async function fetchWishlist() {
            setWishlistLoading(true);
            try {
                const q = query(collection(db, "wishlist"), where("userId", "==", user!.uid));
                const snapshot = await getDocs(q);
                const leadIds = snapshot.docs.map(doc => doc.data().leadId);

                if (leadIds.length === 0) {
                    setWishlistLeads([]);
                    setWishlistLoading(false);
                    return;
                }

                // Fetch lead details for these IDs
                // Note: Firestore 'in' query has a limit of 30. For simple MVP this is fine.
                const leadsQuery = query(collection(db, "leads"), where("__name__", "in", leadIds.slice(0, 30)));
                const leadsSnap = await getDocs(leadsQuery);
                setWishlistLeads(leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
            } catch (error) {
                console.error("Error fetching wishlist details:", error);
            }
            setWishlistLoading(false);
        }

        fetchWishlist();
    }, [user, activeTab]);

    const filteredOrders = orders.filter(order => {
        const d = order.leadData;
        const search = searchTerm.toLowerCase();
        return (
            d.firstName?.toLowerCase().includes(search) ||
            d.lastName?.toLowerCase().includes(search) ||
            d.email?.toLowerCase().includes(search) ||
            d.websiteName?.toLowerCase().includes(search) ||
            d.industry?.toLowerCase().includes(search) ||
            d.location?.toLowerCase().includes(search)
        );
    });

    const exportToExcel = () => {
        setExporting(true);
        try {
            const dataToExport = orders
                .filter(order => order.status === "confirmed")
                .map(order => ({
                    "First Name": order.leadData.firstName,
                    "Last Name": order.leadData.lastName,
                    "Email": order.leadData.email,
                    "Role": order.leadData.jobTitle,
                    "Company": order.leadData.websiteName,
                    "Website": order.leadData.websiteUrl,
                    "Industry": order.leadData.industry,
                    "Location": order.leadData.location,
                    "LinkedIn": order.leadData.linkedin,
                    "Instagram": order.leadData.instagram,
                    "Price Paid": order.price,
                    "Purchase Date": order.purchasedAt?.toDate().toLocaleDateString() || "N/A"
                }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Purchased Leads");
            XLSX.writeFile(workbook, `LeadHub_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
        } catch (err) {
            console.error("Export error:", err);
            alert("Failed to export leads. Please try again.");
        }
        setExporting(false);
    };

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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, gap: 20, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-1px" }}>
                        My <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
                        Welcome back, {userData?.displayName || user?.email}
                    </p>
                </div>
                <Link href="/profile" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                    <FiSettings size={18} /> Profile Settings
                </Link>
            </div>

            {/* Profile Completion Prompt */}
            {!userData?.companyName && (
                <div className="glass-card animate-fade-in" style={{ padding: "16px 24px", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(108, 92, 231, 0.05)", border: "1px solid rgba(108, 92, 231, 0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                            <FiUser size={20} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: "1rem" }}>Complete your professional profile</h4>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>Add your company details and interests to get better lead recommendations.</p>
                        </div>
                    </div>
                    <Link href="/profile" className="btn-small btn-primary" style={{ textDecoration: "none" }}>Set Up Profile</Link>
                </div>
            )}

            {/* Dashboard Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
                    <FiSearch style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={18} />
                    <input
                        type="text"
                        placeholder="Search your leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 16px 12px 48px",
                            borderRadius: "var(--radius-md)",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-color)",
                            color: "white",
                        }}
                    />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        onClick={exportToExcel}
                        disabled={exporting || orders.length === 0}
                        className="btn-secondary btn-small"
                        style={{ gap: 8 }}
                    >
                        <FiDownload size={16} />
                        {exporting ? "Exporting..." : "Export to Excel"}
                    </button>
                    <button
                        className="btn-primary btn-small"
                        onClick={() => router.push("/leads")}
                        style={{ gap: 8 }}
                    >
                        Buy More Leads
                    </button>
                </div>
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

            {/* Tabs */}
            <div style={{ display: "flex", gap: 32, borderBottom: "1px solid var(--border-color)", marginBottom: 32 }}>
                {[
                    { id: "purchased", label: "Purchased Leads", count: orders.length },
                    { id: "wishlist", label: "Wishlist", count: wishlistLeads.length || "New" },
                    { id: "activity", label: "Activity Log", count: "" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            padding: "12px 4px",
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === tab.id ? "2px solid var(--accent-primary)" : "2px solid transparent",
                            color: activeTab === tab.id ? "white" : "var(--text-muted)",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s"
                        }}
                    >
                        {tab.id === "purchased" && <FiShoppingBag size={16} />}
                        {tab.id === "wishlist" && <FiHeart size={16} />}
                        {tab.id === "activity" && <FiActivity size={16} />}
                        {tab.label}
                        {tab.count !== "" && (
                            <span style={{
                                fontSize: "0.7rem",
                                padding: "2px 8px",
                                background: activeTab === tab.id ? "var(--accent-gradient)" : "rgba(255,255,255,0.05)",
                                borderRadius: "var(--radius-full)",
                                color: "white"
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === "purchased" ? (
                <>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 20 }}>Purchased Leads</h2>

                    {error ? (
                        <div className="glass-card" style={{ padding: 40, textAlign: "center", border: "1px solid rgba(255, 107, 107, 0.2)", background: "rgba(255, 107, 107, 0.05)" }}>
                            <p style={{ color: "#ff6b6b", marginBottom: 16, fontWeight: 500 }}>{error}</p>
                            {indexUrl ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: 400 }}>
                                        Firestore requires a composite index to display your order history.
                                    </p>
                                    <a
                                        href={indexUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary btn-small"
                                        style={{ textDecoration: "none" }}
                                    >
                                        Create Required Index
                                    </a>
                                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        After clicking, wait ~1 minute for the index to build, then refresh the page.
                                    </p>
                                </div>
                            ) : (
                                <button className="btn-secondary btn-small" onClick={() => window.location.reload()}>
                                    Try Again
                                </button>
                            )}
                        </div>
                    ) : orders.length === 0 ? (
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
                            {filteredOrders.length === 0 ? (
                                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                                    No leads matching "{searchTerm}"
                                </div>
                            ) : (
                                filteredOrders.map((order, i) => {
                                    const d = order.leadData;
                                    const fullName = `${d.firstName || ""} ${d.lastName || ""}`.trim();
                                    const isPending = order.status !== "confirmed";

                                    return (
                                        <div
                                            key={order.id}
                                            className="glass-card animate-fade-in-up"
                                            style={{ padding: 24, opacity: 0, animationDelay: `${i * 0.05}s`, border: isPending ? "1px solid rgba(255, 107, 107, 0.2)" : "1px solid var(--border-color)" }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                                                <div style={{ display: "flex", gap: 16, flex: 1 }}>
                                                    <div
                                                        style={{
                                                            width: 48, height: 48, borderRadius: "var(--radius-md)", background: isPending ? "rgba(255, 107, 107, 0.1)" : "var(--accent-gradient)",
                                                            display: "flex", alignItems: "center", justifyContent: "center", color: isPending ? "#ff6b6b" : "white", fontWeight: 700,
                                                            fontSize: "1.1rem", flexShrink: 0,
                                                        }}
                                                    >
                                                        {isPending ? <FiClock size={20} /> : (d.firstName?.charAt(0)?.toUpperCase() || "?")}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                                            <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{isPending ? "Pending Lead Access" : fullName}</h3>
                                                            <span style={{
                                                                fontSize: "0.7rem",
                                                                padding: "2px 8px",
                                                                borderRadius: "var(--radius-full)",
                                                                background: isPending ? "rgba(255, 107, 107, 0.1)" : "rgba(0, 214, 143, 0.1)",
                                                                color: isPending ? "#ff6b6b" : "var(--success)",
                                                                fontWeight: 600,
                                                                textTransform: "uppercase"
                                                            }}>
                                                                {isPending ? "Pending Confirmation" : "Confirmed"}
                                                            </span>
                                                        </div>
                                                        {d.jobTitle && (
                                                            <div style={{ color: "var(--accent-secondary)", fontSize: "0.85rem", marginBottom: 8 }}>{d.jobTitle}</div>
                                                        )}
                                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                                <FiMail size={13} /> {isPending ? "••••••@••••.com" : d.email}
                                                            </div>
                                                            {d.websiteUrl && (
                                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                                    <FiGlobe size={13} /> {isPending ? "https://•••••.com" : d.websiteUrl}
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
                                                                    <FiInstagram size={13} /> {isPending ? "@••••••" : d.instagram}
                                                                </div>
                                                            )}
                                                            {d.linkedin && (
                                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                                    <FiLinkedin size={13} /> {isPending ? "linkedin.com/••••" : d.linkedin}
                                                                </div>
                                                            )}
                                                            {d.tiktok && (
                                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                                    <FiMonitor size={13} /> TikTok: {isPending ? "@••••••" : d.tiktok}
                                                                </div>
                                                            )}
                                                            {!isPending && d.founded && (
                                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                                    <FiCalendar size={13} /> Founded: {d.founded}
                                                                </div>
                                                            )}
                                                            {!isPending && d.facebookPixel && (
                                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                                    <FiMonitor size={13} /> Facebook Pixel: {d.facebookPixel}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isPending && (
                                                            <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                                                                <FiClock size={12} /> Our team is currently verifying your payment.
                                                            </div>
                                                        )}
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
                                })
                            )}
                        </div>
                    )}
                </>
            ) : activeTab === "wishlist" ? (
                <>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 20 }}>My Wishlist</h2>
                    {wishlistLoading ? (
                        <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                    ) : wishlistLeads.length === 0 ? (
                        <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                            <FiHeart size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                            <h3 style={{ fontSize: "1.1rem", marginBottom: 8, color: "var(--text-secondary)" }}>Your wishlist is empty</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
                                Save leads you're interested in while browsing the marketplace.
                            </p>
                            <a href="/leads" className="btn-primary btn-small">Discover Leads</a>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: 16 }}>
                            {wishlistLeads.map((lead, i) => (
                                <div
                                    key={lead.id}
                                    className="glass-card animate-fade-in-up"
                                    style={{ padding: 24, opacity: 0, animationDelay: `${i * 0.05}s` }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                                                {lead.firstName?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{lead.firstName} {lead.lastName}</h3>
                                                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{lead.jobTitle} @ {lead.websiteName}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            <div style={{ fontWeight: 700, color: "var(--accent-secondary)" }}>${lead.price?.toFixed(2)}</div>
                                            <a href={`/leads/${lead.id}`} className="btn-secondary btn-small">View Details</a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="glass-card animate-fade-in" style={{ padding: 32 }}>
                    <h3 style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                        <FiActivity style={{ color: "var(--accent-secondary)" }} /> Recent Account Activity
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {orders.length === 0 && wishlistLeads.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                No recent activity found.
                            </div>
                        ) : (
                            <>
                                {[...orders.slice(0, 5)].map((order) => (
                                    <div key={order.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
                                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0, 214, 143, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
                                            <FiShoppingBag size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                                                Purchased lead: <span style={{ color: "var(--accent-secondary)" }}>{order.leadData.firstName} {order.leadData.lastName}</span>
                                            </div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                {order.purchasedAt?.toDate().toLocaleString()} • Status: {order.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {wishlistLeads.slice(0, 3).map((lead) => (
                                    <div key={lead.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
                                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255, 107, 107, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b" }}>
                                            <FiHeart size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                                                Added lead to wishlist: <span style={{ color: "var(--accent-secondary)" }}>{lead.firstName} {lead.lastName}</span>
                                            </div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                Recently added to wishlist
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
}
