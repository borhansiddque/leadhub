"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { FiSearch, FiMapPin, FiBriefcase, FiDollarSign, FiChevronLeft, FiChevronRight, FiFilter, FiGlobe } from "react-icons/fi";

interface Lead {
    id: string;
    websiteName: string;
    websiteUrl: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    industry: string;
    location: string;
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

    async function fetchLeads(reset = false) {
        setLoading(true);
        try {
            const constraints = [
                where("status", "==", "available"),
                orderBy("createdAt", "desc"),
                limit(PER_PAGE),
            ];

            if (industry !== "All") {
                constraints.unshift(where("industry", "==", industry));
            }

            const q = !reset && lastDoc
                ? query(collection(db, "leads"), ...constraints, startAfter(lastDoc))
                : query(collection(db, "leads"), ...constraints);

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lead));

            setLeads(data);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === PER_PAGE);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
        setLoading(false);
    }

    useEffect(() => {
        setPage(1);
        setLastDoc(null);
        fetchLeads(true);
    }, [industry]);

    function handleNextPage() {
        setPage((p) => p + 1);
        fetchLeads(false);
    }

    const filteredLeads = leads.filter((lead) => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            lead.firstName?.toLowerCase().includes(s) ||
            lead.lastName?.toLowerCase().includes(s) ||
            lead.websiteName?.toLowerCase().includes(s) ||
            lead.industry?.toLowerCase().includes(s) ||
            lead.location?.toLowerCase().includes(s) ||
            lead.jobTitle?.toLowerCase().includes(s)
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
            {loading && (
                <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
                    <div className="spinner" />
                </div>
            )}

            {/* Leads Grid */}
            {!loading && filteredLeads.length === 0 && (
                <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                    <FiSearch size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                    <h3 style={{ fontSize: "1.2rem", marginBottom: 8, color: "var(--text-secondary)" }}>No leads found</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        Try adjusting your search or filters, or check back later for new leads.
                    </p>
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
                                <span className="badge badge-available">Available</span>
                            </div>

                            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 6 }}>
                                {lead.firstName} {lead.lastName}
                            </h3>
                            {lead.jobTitle && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 4 }}>
                                    <FiBriefcase size={13} /> {lead.jobTitle}
                                </div>
                            )}
                            {lead.websiteName && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 4 }}>
                                    <FiGlobe size={13} /> {lead.websiteName}
                                </div>
                            )}
                            {lead.location && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 4 }}>
                                    <FiMapPin size={13} /> {lead.location}
                                </div>
                            )}
                            {lead.industry && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 12 }}>
                                    <FiBriefcase size={13} /> {lead.industry}
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-color)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-secondary)", fontWeight: 700, fontSize: "1.1rem" }}>
                                    <FiDollarSign size={16} />
                                    {lead.price?.toFixed(2) || "0.00"}
                                </div>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>View Details →</span>
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
