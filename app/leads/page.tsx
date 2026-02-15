"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiMapPin, FiBriefcase, FiDollarSign, FiChevronLeft, FiChevronRight, FiFilter, FiGlobe, FiShoppingCart, FiPlus, FiCheck, FiLoader, FiHeart } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";

// Dynamically import Map with no SSR
const MarketplaceMap = dynamic(() => import("@/components/MarketplaceMap"), {
    ssr: false,
    loading: () => <div className="glass-card" style={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" /></div>
});

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

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [industry, setIndustry] = useState("All");
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [perPage, setPerPage] = useState<number | "all">(12);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [indexUrl, setIndexUrl] = useState<string | null>(null);
    const [purchasedLeadIds, setPurchasedLeadIds] = useState<Set<string>>(new Set());
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const [locationFilter, setLocationFilter] = useState("All");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [jobTitleFilter, setJobTitleFilter] = useState("");
    const [industries, setIndustries] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [jobTitles, setJobTitles] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
    const router = useRouter();
    const { addToCart, isInCart } = useCart();
    const { user } = useAuth();

    // Debounce search term for smoother UI
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const isSearching = searchTerm !== debouncedSearchTerm;

    async function fetchLeads(reset = false) {
        setLoading(true);
        setError(null);
        try {
            const limitValue = perPage === "all" ? 5000 : perPage;
            const constraints: any[] = [
                where("status", "==", "available"),
                orderBy("createdAt", "desc"),
                limit(limitValue),
            ];

            if (industry !== "All") {
                constraints.push(where("industry", "==", industry));
            }
            if (locationFilter !== "All") {
                constraints.push(where("location", "==", locationFilter));
            }
            if (jobTitleFilter && jobTitleFilter !== "All") {
                constraints.push(where("jobTitle", "==", jobTitleFilter));
            }
            if (priceMin) {
                constraints.push(where("price", ">=", parseFloat(priceMin)));
            }
            if (priceMax) {
                constraints.push(where("price", "<=", parseFloat(priceMax)));
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
            setHasMore(perPage === "all" ? false : snapshot.docs.length === perPage);
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
    }, [industry, locationFilter, jobTitleFilter, priceMin, priceMax, perPage]);

    useEffect(() => {
        async function fetchMetadata() {
            // Check cache first
            const cached = sessionStorage.getItem("leads_metadata");
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setLocations(parsed.locations);
                    setJobTitles(parsed.jobTitles);
                    setIndustries(parsed.industries);
                    return;
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            try {
                const q = query(collection(db, "leads"), limit(150)); // Optimized sample size
                const snap = await getDocs(q);
                const locs = new Set<string>();
                const titles = new Set<string>();
                const inds = new Set<string>();
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.location) locs.add(data.location);
                    if (data.jobTitle) titles.add(data.jobTitle);
                    if (data.industry) inds.add(data.industry);
                });

                const finalLocs = ["All", ...Array.from(locs).sort()];
                const finalTitles = ["All", ...Array.from(titles).sort()];
                const finalInds = ["All", ...Array.from(inds).sort()];

                setLocations(finalLocs);
                setJobTitles(finalTitles);
                setIndustries(finalInds);

                // Save to cache
                sessionStorage.setItem("leads_metadata", JSON.stringify({
                    locations: finalLocs,
                    jobTitles: finalTitles,
                    industries: finalInds
                }));
            } catch (err) {
                console.error("Error fetching metadata:", err);
            }
        }
        fetchMetadata();
    }, []);

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

    useEffect(() => {
        async function fetchWishlist() {
            if (!user) {
                setWishlistIds(new Set());
                return;
            }
            try {
                const q = query(collection(db, "wishlist"), where("userId", "==", user.uid));
                const snapshot = await getDocs(q);
                const ids = new Set(snapshot.docs.map(doc => doc.data().leadId));
                setWishlistIds(ids);
            } catch (error) {
                console.error("Error fetching wishlist:", error);
            }
        }
        fetchWishlist();
    }, [user]);

    const toggleWishlist = async (leadId: string) => {
        if (!user) {
            router.push("/login");
            return;
        }

        const isFavorited = wishlistIds.has(leadId);
        const newIds = new Set(wishlistIds);

        try {
            if (isFavorited) {
                newIds.delete(leadId);
                setWishlistIds(newIds);
                // Find and delete the doc
                const q = query(
                    collection(db, "wishlist"),
                    where("userId", "==", user.uid),
                    where("leadId", "==", leadId)
                );
                const snapshot = await getDocs(q);
                const { deleteDoc, doc } = await import("firebase/firestore");
                for (const d of snapshot.docs) {
                    await deleteDoc(doc(db, "wishlist", d.id));
                }
            } else {
                newIds.add(leadId);
                setWishlistIds(newIds);
                const { addDoc } = await import("firebase/firestore");
                await addDoc(collection(db, "wishlist"), {
                    userId: user.uid,
                    leadId: leadId,
                    addedAt: new Date()
                });
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            // Revert on error
            setWishlistIds(wishlistIds);
        }
    };

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

            {/* Main Layout with Sidebar */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Fixed Filter Sidebar */}
                <aside style={{ width: 280, flexShrink: 0 }} className={showFilters ? "show-filters" : "hide-filters-mobile"}>
                    <div className="glass-card" style={{ padding: 24, position: "sticky", top: 100 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Filters</h2>
                            <button
                                onClick={() => {
                                    setIndustry("All");
                                    setLocationFilter("All");
                                    setJobTitleFilter("");
                                    setPriceMin("");
                                    setPriceMax("");
                                }}
                                style={{ background: "none", border: "none", color: "var(--accent-secondary)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                            >
                                Reset All
                            </button>
                        </div>

                        {/* Industry */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>INDUSTRY</label>
                            <select
                                className="input-field"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                style={{ fontSize: "0.9rem" }}
                            >
                                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                            </select>
                        </div>

                        {/* Location */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>LOCATION</label>
                            <select
                                className="input-field"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                style={{ fontSize: "0.9rem" }}
                            >
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>JOB TITLE</label>
                            <select
                                className="input-field"
                                value={jobTitleFilter}
                                onChange={(e) => setJobTitleFilter(e.target.value)}
                                style={{ fontSize: "0.9rem" }}
                            >
                                {jobTitles.map(title => <option key={title} value={title}>{title}</option>)}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>PRICE RANGE ($)</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Min"
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    style={{ fontSize: "0.9rem" }}
                                />
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Max"
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    style={{ fontSize: "0.9rem" }}
                                />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div style={{ flex: 1, minWidth: 280 }}>
                    {/* Search Bar */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <FiSearch
                                size={18}
                                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                            />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Global search leads..."
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

                        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={viewMode === "grid" ? "btn-primary btn-xs" : "btn-ghost btn-xs"}
                                style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "none" }}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode("map")}
                                className={viewMode === "map" ? "btn-primary btn-xs" : "btn-ghost btn-xs"}
                                style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "none" }}
                            >
                                Map
                            </button>
                        </div>

                        <button
                            className="btn-secondary btn-small mobile-only"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter size={16} /> Filters
                        </button>
                    </div>

                    {/* Leads View */}
                    {viewMode === "map" ? (
                        <MarketplaceMap leads={filteredLeads} />
                    ) : (
                        <>
                            {error && (
                                <div className="glass-card" style={{ padding: 40, textAlign: "center", border: "1px solid rgba(255, 107, 107, 0.2)", background: "rgba(255, 107, 107, 0.05)", marginBottom: 24 }}>
                                    <p style={{ color: "#ff6b6b", marginBottom: 16, fontWeight: 500 }}>{error}</p>
                                    {indexUrl ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: 400 }}>
                                                Firestore requires a composite index for this specific filter combination.
                                            </p>
                                            <a href={indexUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-small" style={{ textDecoration: "none" }}>
                                                Create Required Index
                                            </a>
                                        </div>
                                    ) : (
                                        <button className="btn-secondary btn-small" onClick={() => fetchLeads(true)}>Try Again</button>
                                    )}
                                </div>
                            )}

                            {!loading && filteredLeads.length === 0 && (
                                <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                                    <FiSearch size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                                    <h3 style={{ fontSize: "1.2rem", marginBottom: 8, color: "var(--text-secondary)" }}>No leads available</h3>
                                    <button className="btn-secondary btn-small" onClick={() => fetchLeads(true)}>Refresh Marketplace</button>
                                </div>
                            )}

                            {!loading && filteredLeads.length > 0 && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                                    {filteredLeads.map((lead, i) => (
                                        <Link href={`/leads/${lead.id}`} key={lead.id} className="glass-card animate-fade-in-up" style={{ padding: 24, textDecoration: "none", color: "inherit", animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem" }}>
                                                    {lead.firstName?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                {purchasedLeadIds.has(lead.id) ? (
                                                    <span className="badge" style={{ background: "rgba(0, 214, 143, 0.1)", color: "var(--success)" }}>Purchased</span>
                                                ) : (
                                                    <div style={{ display: "flex", gap: 8 }}>
                                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(lead.id); }} style={{ background: "none", border: "none", color: wishlistIds.has(lead.id) ? "#ff4757" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, transition: "all 0.2s" }}>
                                                            <FiHeart size={20} fill={wishlistIds.has(lead.id) ? "#ff4757" : "none"} />
                                                        </button>
                                                        <span className="badge badge-available">Available</span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 6 }}>{lead.firstName} {lead.lastName}</h3>
                                            {lead.jobTitle && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-secondary)", fontSize: "0.85rem", marginBottom: 6, fontWeight: 500 }}><FiBriefcase size={13} /> {lead.jobTitle}</div>}
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                                                {lead.industry && <span style={{ fontSize: "0.75rem", padding: "3px 10px", background: "rgba(108, 92, 231, 0.1)", borderRadius: "var(--radius-full)", color: "var(--accent-secondary)", border: "1px solid rgba(108, 92, 231, 0.2)" }}>{lead.industry}</span>}
                                                {lead.location && <span style={{ fontSize: "0.75rem", padding: "3px 10px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "var(--radius-full)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><FiMapPin size={11} /> {lead.location}</span>}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-color)" }}>
                                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, color: "var(--accent-secondary)", fontWeight: 700, fontSize: "1.1rem" }}><FiDollarSign size={16} />{lead.price?.toFixed(2) || "0.00"}</div>
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (purchasedLeadIds.has(lead.id)) return; if (!isInCart(lead.id)) addToCart(lead); }} disabled={purchasedLeadIds.has(lead.id)} className={isInCart(lead.id) || purchasedLeadIds.has(lead.id) ? "btn-secondary btn-small" : "btn-primary btn-small"} style={{ padding: "6px 14px", fontSize: "0.8rem", cursor: purchasedLeadIds.has(lead.id) ? "not-allowed" : "pointer" }}>
                                                    {purchasedLeadIds.has(lead.id) ? <><FiCheck size={14} /> Owned</> : (isInCart(lead.id) ? <><FiCheck size={14} /> In Cart</> : <><FiPlus size={14} /> Add</>)}
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && filteredLeads.length > 0 && (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginTop: 48, paddingBottom: 40, flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Show:</span>
                                        <select
                                            value={perPage}
                                            onChange={(e) => setPerPage(e.target.value === "all" ? "all" : Number(e.target.value))}
                                            className="input-field"
                                            style={{ width: "auto", padding: "4px 8px", fontSize: "0.85rem", height: "auto" }}
                                        >
                                            <option value={12}>12</option>
                                            <option value={24}>24</option>
                                            <option value={48}>48</option>
                                            <option value={96}>96</option>
                                            <option value="all">All</option>
                                        </select>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
                                        <button className="btn-secondary btn-small" disabled={page === 1 || perPage === "all"} onClick={() => { setPage(1); setLastDoc(null); fetchLeads(true); }}>
                                            <FiChevronLeft size={16} /> Prev
                                        </button>
                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                            {perPage === "all" ? "Showing All" : `Page ${page}`}
                                        </span>
                                        <button className="btn-secondary btn-small" disabled={!hasMore || perPage === "all"} onClick={handleNextPage}>
                                            Next <FiChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 992px) {
                    .hide-filters-mobile {
                        display: none;
                    }
                    .show-filters {
                        display: block;
                        width: 100% !important;
                        margin-bottom: 24px;
                    }
                    .mobile-only {
                        display: flex;
                    }
                }
                @media (min-width: 993px) {
                    .mobile-only {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
