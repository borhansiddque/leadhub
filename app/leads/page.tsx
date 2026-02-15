"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { FiSearch, FiMapPin, FiBriefcase, FiDollarSign, FiChevronLeft, FiChevronRight, FiFilter, FiGlobe, FiShoppingCart, FiPlus, FiCheck, FiLoader } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";

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
}

const INDUSTRIES = ["All", "Technology", "Healthcare", "Finance", "Real Estate", "E-commerce", "Education", "Marketing", "Legal", "Manufacturing", "Retail", "Food & Beverage", "Other"];
const PER_PAGE = 12;

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [industry, setIndustry] = useState("All");
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [indexUrl, setIndexUrl] = useState<string | null>(null);
    const [purchasedLeadIds, setPurchasedLeadIds] = useState<Set<string>>(new Set());
    const { addToCart, isInCart } = useCart();
    const { user } = useAuth();

    // Debounce search term for smoother UI
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const isSearching = searchTerm !== debouncedSearchTerm;

    async function fetchLeads(reset = false) {
        setLoading(true);
        setError(null);
        try {
            const constraints: any[] = [
                where("status", "==", "available"),
                orderBy("createdAt", "desc"),
                limit(PER_PAGE),
            ];

            if (industry !== "All") {
                constraints.push(where("industry", "==", industry));
            }

            const q = !reset && lastDoc
                ? query(collection(db, "leads"), ...constraints, startAfter(lastDoc))
                : query(collection(db, "leads"), ...constraints);

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lead));

            if (reset) {
                setLeads(data);
            } else {
                setLeads(prev => [...prev, ...data]);
            }
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === PER_PAGE);
        } catch (error: any) {
            console.error("Error fetching leads:", error);
            const msg = error.message || "";
            if (msg.toLowerCase().includes("index")) {
                setError("This filter requires a database index.");
                // Extract link if present in error message
                const match = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
                if (match) setIndexUrl(match[0]);
            } else {
                setError("Failed to load leads. Please try again.");
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        setPage(1);
        setLastDoc(null);
        fetchLeads(true);
    }, [industry]);

    useEffect(() => {
        async function fetchPurchasedLeads() {
            if (!user) {
                setPurchasedLeadIds(new Set());
                return;
            }
            try {
                const q = query(collection(db, "orders"), where("userId", "==", user.uid));
                const snapshot = await getDocs(q);
                const ids = new Set(snapshot.docs.map(doc => doc.data().leadId));
                setPurchasedLeadIds(ids);
            } catch (error) {
                console.error("Error fetching purchased leads:", error);
            }
        }
        fetchPurchasedLeads();
    }, [user]);

    function handleNextPage() {
        setPage((p) => p + 1);
        fetchLeads(false);
    }

    const filteredLeads = leads.filter((l) => {
        if (!debouncedSearchTerm) return true;
        const s = debouncedSearchTerm.toLowerCase();
        return (
            (l.firstName || "").toLowerCase().includes(s) ||
            (l.lastName || "").toLowerCase().includes(s) ||
            (l.websiteName || "").toLowerCase().includes(s) ||
            (l.industry || "").toLowerCase().includes(s) ||
            (l.location || "").toLowerCase().includes(s) ||
            (l.jobTitle || "").toLowerCase().includes(s) ||
            (l.email || "").toLowerCase().includes(s) ||
            (l.instagram || "").toLowerCase().includes(s) ||
            (l.linkedin || "").toLowerCase().includes(s) ||
            (l.tiktok || "").toLowerCase().includes(s) ||
            (l.founded || "").toLowerCase().includes(s) ||
            (l.facebookPixel || "").toLowerCase().includes(s)
        );
    });

    return (
        <div className="page-container grid-bg" style={{ minHeight: "100vh", position: "relative" }}>
            <div className="glow-orb" style={{ width: 350, height: 350, background: "#6c5ce7", top: 50, right: -100 }} />

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-1px" }}>
                    Lead <span className="gradient-text">Marketplace</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
                    Browse and purchase verified business leads
                </p>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
                    <FiSearch
                        size={18}
                        style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                    />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search by name, website, industry, location, job title..."
                        style={{ paddingLeft: 44 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearching && (
                        <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "var(--accent-secondary)" }}>
                            <FiLoader className="spinner" size={16} />
                        </div>
                    )}
                </div>
                <button
                    className="btn-secondary btn-small"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FiFilter size={16} /> Filters
                </button>
            </div>

            {/* Industry Filter */}
            {showFilters && (
                <div
                    className="animate-fade-in"
                    style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}
                >
                    {INDUSTRIES.map((ind) => (
                        <button
                            key={ind}
                            onClick={() => setIndustry(ind)}
                            style={{
                                padding: "8px 18px",
                                borderRadius: "var(--radius-full)",
                                border: "1px solid",
                                borderColor: industry === ind ? "var(--accent-primary)" : "var(--border-color)",
                                background: industry === ind ? "rgba(108, 92, 231, 0.15)" : "var(--bg-card)",
                                color: industry === ind ? "var(--accent-secondary)" : "var(--text-secondary)",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                fontFamily: "inherit",
                            }}
                        >
                            {ind}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading */}
            {error && (
                <div className="glass-card" style={{ padding: 40, textAlign: "center", border: "1px solid rgba(255, 107, 107, 0.2)", background: "rgba(255, 107, 107, 0.05)" }}>
                    <p style={{ color: "#ff6b6b", marginBottom: 16, fontWeight: 500 }}>{error}</p>
                    {indexUrl ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: 400 }}>
                                Firestore requires a composite index for this specific filter combination.
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
                                After clicking, wait ~1 minute for the index to build, then click "Try Again".
                            </p>
                        </div>
                    ) : (
                        <button className="btn-secondary btn-small" onClick={() => fetchLeads(true)}>
                            Try Again
                        </button>
                    )}
                </div>
            )}

            {/* Leads Grid */}
            {!loading && filteredLeads.length === 0 && (
                <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                    <FiSearch size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                    <h3 style={{ fontSize: "1.2rem", marginBottom: 8, color: "var(--text-secondary)" }}>No leads available</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto 24px" }}>
                        We couldn't find any leads matching your criteria. If you just created a database index, it may take a moment to sync.
                    </p>
                    <button className="btn-secondary btn-small" onClick={() => fetchLeads(true)}>
                        Refresh Marketplace
                    </button>
                </div>
            )}

            {!loading && filteredLeads.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: 20,
                    }}
                >
                    {filteredLeads.map((lead, i) => (
                        <Link
                            href={`/leads/${lead.id}`}
                            key={lead.id}
                            className="glass-card animate-fade-in-up"
                            style={{
                                padding: 24,
                                textDecoration: "none",
                                color: "inherit",
                                animationDelay: `${i * 0.05}s`,
                                opacity: 0,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "var(--radius-md)",
                                        background: "var(--accent-gradient)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                    }}
                                >
                                    {lead.firstName?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                {purchasedLeadIds.has(lead.id) ? (
                                    <span className="badge" style={{ background: "rgba(0, 214, 143, 0.1)", color: "var(--success)" }}>Purchased</span>
                                ) : (
                                    <span className="badge badge-available">Available</span>
                                )}
                            </div>

                            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 6 }}>
                                {lead.firstName} {lead.lastName}
                            </h3>
                            {lead.jobTitle && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-secondary)", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}>
                                    <FiBriefcase size={13} /> {lead.jobTitle}
                                </div>
                            )}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                                {lead.industry && (
                                    <span style={{ fontSize: "0.75rem", padding: "3px 10px", background: "rgba(108, 92, 231, 0.1)", borderRadius: "var(--radius-full)", color: "var(--accent-secondary)", border: "1px solid rgba(108, 92, 231, 0.2)" }}>
                                        {lead.industry}
                                    </span>
                                )}
                                {lead.location && (
                                    <span style={{ fontSize: "0.75rem", padding: "3px 10px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "var(--radius-full)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                                        <FiMapPin size={11} /> {lead.location}
                                    </span>
                                )}
                            </div>

                            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 12 }}>
                                {lead.websiteName && <div style={{ marginBottom: 4 }}>Company: {lead.websiteName}</div>}
                                {lead.facebookPixel && <div>FB Pixel: {lead.facebookPixel}</div>}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-color)" }}>
                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, color: "var(--accent-secondary)", fontWeight: 700, fontSize: "1.1rem" }}>
                                    <FiDollarSign size={16} />
                                    {lead.price?.toFixed(2) || "0.00"}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (purchasedLeadIds.has(lead.id)) return;
                                        if (!isInCart(lead.id)) addToCart(lead);
                                    }}
                                    disabled={purchasedLeadIds.has(lead.id)}
                                    className={isInCart(lead.id) || purchasedLeadIds.has(lead.id) ? "btn-secondary btn-small" : "btn-primary btn-small"}
                                    style={{
                                        padding: "6px 14px",
                                        fontSize: "0.8rem",
                                        background: purchasedLeadIds.has(lead.id) ? "rgba(255, 255, 255, 0.05)" : (isInCart(lead.id) ? "rgba(0, 214, 143, 0.1)" : undefined),
                                        color: purchasedLeadIds.has(lead.id) ? "var(--text-muted)" : (isInCart(lead.id) ? "var(--success)" : undefined),
                                        borderColor: purchasedLeadIds.has(lead.id) ? "transparent" : (isInCart(lead.id) ? "rgba(0, 214, 143, 0.2)" : undefined),
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        cursor: purchasedLeadIds.has(lead.id) ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {purchasedLeadIds.has(lead.id) ? <><FiCheck size={14} /> Owned</> : (isInCart(lead.id) ? <><FiCheck size={14} /> In Cart</> : <><FiPlus size={14} /> Add</>)}
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && filteredLeads.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 48 }}>
                    <button
                        className="btn-secondary btn-small"
                        disabled={page === 1}
                        onClick={() => { setPage(1); setLastDoc(null); fetchLeads(true); }}
                    >
                        <FiChevronLeft size={16} /> Previous
                    </button>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Page {page}</span>
                    <button
                        className="btn-secondary btn-small"
                        disabled={!hasMore}
                        onClick={handleNextPage}
                    >
                        Next <FiChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
