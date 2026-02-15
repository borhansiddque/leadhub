"use client";

import { useEffect, useState, useRef } from "react";
import {
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    writeBatch,
    DocumentData,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FiPlus, FiUpload, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiSearch, FiEye } from "react-icons/fi";

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
    // Legacy fields
    name?: string;
    company?: string;
}

const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Real Estate", "E-commerce", "Education", "Marketing", "Legal", "Manufacturing", "Retail", "Food & Beverage", "Other"];
const PER_PAGE = 20;

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const emptyForm = {
        websiteName: "", websiteUrl: "", firstName: "", lastName: "", jobTitle: "",
        email: "", instagram: "", linkedin: "", industry: "Technology", location: "",
        tiktok: "", founded: "", facebookPixel: "", price: "",
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { setMounted(true); }, []);

    async function fetchLeads(reset = false) {
        setLoading(true);
        try {
            const constraints = [orderBy("createdAt", "desc"), limit(PER_PAGE)];
            const q = !reset && lastDoc
                ? query(collection(db, "leads"), ...constraints, startAfter(lastDoc))
                : query(collection(db, "leads"), ...constraints);

            const snapshot = await getDocs(q);
            setLeads(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Lead)));
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === PER_PAGE);
        } catch (error) {
            console.error("Error:", error);
        }
        setLoading(false);
    }

    useEffect(() => { if (mounted) fetchLeads(true); }, [mounted]);

    async function handleAddLead(e: React.FormEvent) {
        e.preventDefault();
        try {
            await addDoc(collection(db, "leads"), {
                ...form,
                price: parseFloat(form.price.toString().replace(/[$,]/g, "")) || 0,
                status: "available",
                createdAt: serverTimestamp(),
            });
            setShowModal(false);
            setForm(emptyForm);
            fetchLeads(true);
        } catch (error) {
            console.error("Error adding lead:", error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this lead?")) return;
        try {
            await deleteDoc(doc(db, "leads", id));
            setLeads((prev) => prev.filter((l) => l.id !== id));
            if (selectedLead?.id === id) setSelectedLead(null);
        } catch (error) {
            console.error("Error deleting:", error);
        }
    }

    function normalizeHeader(h: string): string {
        const lower = h.toLowerCase().trim();
        const map: Record<string, string> = {
            "website name": "websiteName",
            "website name ": "websiteName",
            "website url": "websiteUrl",
            "website url ": "websiteUrl",
            "first name": "firstName",
            "last name": "lastName",
            "job title": "jobTitle",
            "email": "email",
            "instagram": "instagram",
            "linkedin": "linkedin",
            "industry": "industry",
            "location": "location",
            "tiktok": "tiktok",
            "founded": "founded",
            "facebook pixel": "facebookPixel",
            "facebookpixel": "facebookPixel",
            "facebook_pixel": "facebookPixel",
            "fb pixel": "facebookPixel",
            "facebook pixel status": "facebookPixel",
        };

        if (map[lower]) return map[lower];

        // Dynamic mapping for common patterns
        if (lower.includes("website") && lower.includes("name")) return "websiteName";
        if (lower.includes("website") && lower.includes("url")) return "websiteUrl";
        if (lower.includes("first") && lower.includes("name")) return "firstName";
        if (lower.includes("last") && lower.includes("name")) return "lastName";
        if (lower.includes("facebook") && lower.includes("pixel")) return "facebookPixel";
        if (lower.includes("fb") && lower.includes("pixel")) return "facebookPixel";
        if (lower === "company") return "websiteName";
        if (lower === "name" && !map["first name"]) return "firstName"; // Fallback for single 'name' column

        return lower.replace(/\s+/g, "");
    }

    async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress("Analyzing file...");

        try {
            const text = await file.text();
            const lines = text.split(/\r?\n/).filter((line) => line.trim());
            if (lines.length < 2) throw new Error("File is empty or missing data.");

            // Delimiter detection
            const firstLine = lines[0];
            const delimiters = [",", "\t", ";"];
            let delimiter = ",";
            let maxCount = 0;
            delimiters.forEach(d => {
                const count = firstLine.split(d).length;
                if (count > maxCount) {
                    maxCount = count;
                    delimiter = d;
                }
            });

            setUploadProgress(`Detected delimiter: ${delimiter === "\t" ? "TAB" : delimiter}`);

            const parseRow = (line: string) => {
                const values: string[] = [];
                let current = "";
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"' && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === delimiter && !inQuotes) {
                        values.push(current.trim());
                        current = "";
                    } else {
                        current += char;
                    }
                }
                values.push(current.trim());
                return values;
            };

            const rawHeaders = parseRow(lines[0]);
            const headers = rawHeaders.map(normalizeHeader);

            const rows = lines.slice(1).map(parseRow).map(values => {
                const obj: Record<string, string> = {};
                headers.forEach((h, i) => {
                    if (h) obj[h] = values[i] || "";
                });
                return obj;
            });

            setUploadProgress(`Uploading ${rows.length} leads...`);

            const batchSize = 100; // Smaller batches for better reliability
            let uploaded = 0;
            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = writeBatch(db);
                const chunk = rows.slice(i, i + batchSize);

                chunk.forEach((row) => {
                    const docRef = doc(collection(db, "leads"));
                    batch.set(docRef, {
                        websiteName: row.websiteName || "",
                        websiteUrl: row.websiteUrl || "",
                        firstName: row.firstName || "",
                        lastName: row.lastName || "",
                        jobTitle: row.jobTitle || "",
                        email: row.email || "",
                        instagram: row.instagram || "",
                        linkedin: row.linkedin || "",
                        industry: row.industry || "Other",
                        location: row.location || "",
                        tiktok: row.tiktok || "",
                        founded: row.founded || "",
                        facebookPixel: row.facebookPixel || "",
                        price: parseFloat(row.price?.toString().replace(/[$,]/g, "")) || 5,
                        status: "available",
                        createdAt: serverTimestamp(),
                    });
                });

                await batch.commit();
                uploaded += chunk.length;
                setUploadProgress(`Uploaded ${uploaded} of ${rows.length} leads...`);
            }

            setUploadProgress(`✅ Successfully uploaded ${rows.length} leads!`);
            fetchLeads(true);
        } catch (error: any) {
            console.error("Upload error:", error);
            setUploadProgress(`❌ Error: ${error.message || "Failed to parse file"}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    const filtered = leads.filter((l) => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            (l.firstName || l.name || "").toLowerCase().includes(s) ||
            (l.lastName || "").toLowerCase().includes(s) ||
            l.email?.toLowerCase().includes(s) ||
            (l.websiteName || l.company || "").toLowerCase().includes(s) ||
            l.websiteUrl?.toLowerCase().includes(s) ||
            l.industry?.toLowerCase().includes(s) ||
            l.location?.toLowerCase().includes(s) ||
            l.jobTitle?.toLowerCase().includes(s) ||
            l.instagram?.toLowerCase().includes(s) ||
            l.linkedin?.toLowerCase().includes(s) ||
            l.tiktok?.toLowerCase().includes(s) ||
            l.founded?.toLowerCase().includes(s) ||
            l.facebookPixel?.toLowerCase().includes(s)
        );
    });

    const totalLeadsCount = leads.length;

    if (!mounted) {
        return (
            <div className="page-container" style={{ display: "flex", justifyContent: "center", padding: 120 }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4, letterSpacing: "-0.5px" }}>
                        Manage <span className="gradient-text">Leads</span>
                        {mounted && <span style={{ marginLeft: 12, fontSize: "0.8rem", padding: "4px 10px", background: "rgba(108,92,231,0.1)", borderRadius: "var(--radius-full)", color: "var(--accent-secondary)", verticalAlign: "middle" }}>{totalLeadsCount} Total</span>}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Add, upload, and manage your lead inventory</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-secondary btn-small" onClick={() => setShowUpload(!showUpload)}>
                        <FiUpload size={15} /> CSV Upload
                    </button>
                    <button className="btn-primary btn-small" onClick={() => setShowModal(true)}>
                        <FiPlus size={15} /> Add Lead
                    </button>
                </div>
            </div>

            {/* CSV Upload Section */}
            {showUpload && (
                <div className="glass-card animate-fade-in" style={{ padding: 24, marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 12, fontSize: "1rem", fontWeight: 600 }}>Bulk CSV Upload</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 8 }}>
                        CSV columns: <code style={{ color: "var(--accent-secondary)" }}>Website Name, Website URL, First Name, Last Name, Job Title, Email, Instagram, Linkedin, Industry, Location, Tiktok, Founded, Facebook Pixel Status</code>
                    </p>
                    <a
                        href="/template-leads.csv"
                        download
                        style={{ display: "inline-block", marginBottom: 16, color: "var(--accent-secondary)", fontSize: "0.85rem", textDecoration: "underline" }}
                    >
                        ⬇ Download template CSV
                    </a>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        disabled={uploading}
                        className="input-field"
                        style={{ maxWidth: 400 }}
                    />
                    {uploadProgress && (
                        <p style={{ marginTop: 12, color: "var(--accent-secondary)", fontSize: "0.9rem" }}>{uploadProgress}</p>
                    )}
                </div>
            )}

            {/* Search */}
            <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", maxWidth: 400, flex: 1 }}>
                    <FiSearch size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                        className="input-field"
                        placeholder="Search all fields..."
                        style={{ paddingLeft: 40 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {searchTerm && (
                    <button className="btn-secondary btn-small" onClick={() => setSearchTerm("")}>
                        Clear Search
                    </button>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                    <div className="spinner" />
                </div>
            ) : (
                <div style={{ overflowX: "auto", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 140 }}>Name</th>
                                <th>Email</th>
                                <th>Website</th>
                                <th>Industry</th>
                                <th>Location</th>
                                <th style={{ width: 100 }}>Founded</th>
                                <th style={{ width: 100 }}>Price</th>
                                <th style={{ width: 110 }}>Status</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                        No leads found. Add your first lead or upload a CSV.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((lead) => (
                                    <tr key={lead.id} className="hover-row">
                                        <td style={{ fontWeight: 500 }}>{((lead.firstName || lead.name || "") + " " + (lead.lastName || "")).trim()}</td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                {lead.email}
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(lead.email || ""); alert("Email copied!"); }}
                                                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}
                                                    title="Copy Email"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{lead.websiteName || lead.company || "—"}</td>
                                        <td>
                                            <span style={{
                                                fontSize: "0.75rem",
                                                padding: "4px 10px",
                                                background: lead.industry === "Technology" ? "rgba(108,92,231,0.1)" : "rgba(255,255,255,0.05)",
                                                borderRadius: "var(--radius-full)",
                                                color: lead.industry === "Technology" ? "var(--accent-secondary)" : "var(--text-secondary)",
                                                border: "1px solid rgba(255,255,255,0.05)"
                                            }}>
                                                {lead.industry}
                                            </span>
                                        </td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{lead.location || "—"}</td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{lead.founded || "—"}</td>
                                        <td style={{ fontWeight: 600 }}>${lead.price?.toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${lead.status === "available" ? "badge-available" : "badge-sold"}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    className="btn-secondary btn-small"
                                                    onClick={() => setSelectedLead(lead)}
                                                    style={{ padding: "5px 10px" }}
                                                    title="View All Details"
                                                >
                                                    <FiEye size={14} />
                                                </button>
                                                <button
                                                    className="btn-danger btn-small"
                                                    onClick={() => handleDelete(lead.id)}
                                                    style={{ padding: "5px 12px", fontSize: "0.75rem" }}
                                                >
                                                    <FiTrash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 24 }}>
                <button className="btn-secondary btn-small" disabled={page === 1} onClick={() => { setPage(1); setLastDoc(null); fetchLeads(true); }}>
                    <FiChevronLeft size={16} /> Prev
                </button>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Page {page}</span>
                <button className="btn-secondary btn-small" disabled={!hasMore} onClick={() => { setPage((p) => p + 1); fetchLeads(false); }}>
                    Next <FiChevronRight size={16} />
                </button>
            </div>

            {/* View Details Modal */}
            {selectedLead && (
                <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Lead Details</h2>
                            <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                                <FiX size={20} />
                            </button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <DetailItem label="Website Name" value={selectedLead.websiteName || selectedLead.company} />
                            <DetailItem label="Website URL" value={selectedLead.websiteUrl} isUrl />
                            <DetailItem label="First Name" value={selectedLead.firstName || selectedLead.name} />
                            <DetailItem label="Last Name" value={selectedLead.lastName} />
                            <DetailItem label="Job Title" value={selectedLead.jobTitle} />
                            <DetailItem label="Email" value={selectedLead.email} />
                            <DetailItem label="Instagram" value={selectedLead.instagram} isSocial />
                            <DetailItem label="LinkedIn" value={selectedLead.linkedin} isSocial />
                            <DetailItem label="Industry" value={selectedLead.industry} />
                            <DetailItem label="Location" value={selectedLead.location} />
                            <DetailItem label="TikTok" value={selectedLead.tiktok} isSocial />
                            <DetailItem label="Founded" value={selectedLead.founded} />
                            <DetailItem label="Facebook Pixel Status" value={selectedLead.facebookPixel} />
                            <DetailItem label="Price" value={`$${selectedLead.price?.toFixed(2)}`} />
                            <DetailItem label="Status" value={selectedLead.status} />
                        </div>
                        <button className="btn-primary" style={{ width: "100%", marginTop: 24 }} onClick={() => setSelectedLead(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Add Lead Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Add New Lead</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddLead} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {/* 1 & 2 */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label className="input-label">Website Name</label>
                                    <input className="input-field" value={form.websiteName} onChange={(e) => setForm({ ...form, websiteName: e.target.value })} placeholder="Acme Corp" />
                                </div>
                                <div>
                                    <label className="input-label">Website URL</label>
                                    <input className="input-field" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://acme.com" />
                                </div>
                            </div>
                            {/* 3 & 4 */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label className="input-label">First Name *</label>
                                    <input className="input-field" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" />
                                </div>
                                <div>
                                    <label className="input-label">Last Name *</label>
                                    <input className="input-field" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
                                </div>
                            </div>
                            {/* 5 & 6 */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label className="input-label">Job Title</label>
                                    <input className="input-field" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Marketing Manager" />
                                </div>
                                <div>
                                    <label className="input-label">Email *</label>
                                    <input className="input-field" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                                </div>
                            </div>
                            {/* 7 & 8 */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label className="input-label">Instagram</label>
                                    <input className="input-field" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@handle" />
                                </div>
                                <div>
                                    <label className="input-label">LinkedIn</label>
                                    <input className="input-field" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/..." />
                                </div>
                            </div>
                            {/* 9 & 10 */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label className="input-label">Industry</label>
                                    <select className="input-field" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                                        {INDUSTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Location</label>
                                    <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="New York, USA" />
                                </div>
                            </div>
                            {/* 11, 12, 13 */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                <div>
                                    <label className="input-label">TikTok</label>
                                    <input className="input-field" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} placeholder="@handle" />
                                </div>
                                <div>
                                    <label className="input-label">Founded</label>
                                    <input className="input-field" value={form.founded} onChange={(e) => setForm({ ...form, founded: e.target.value })} placeholder="2020" />
                                </div>
                                <div>
                                    <label className="input-label">Facebook Pixel Status</label>
                                    <input className="input-field" value={form.facebookPixel} onChange={(e) => setForm({ ...form, facebookPixel: e.target.value })} placeholder="Active / No" />
                                </div>
                            </div>
                            {/* Price */}
                            <div>
                                <label className="input-label">Price ($) *</label>
                                <input className="input-field" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="9.99" />
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 8 }}>
                                <FiPlus size={16} /> Add Lead
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, value, isUrl, isSocial }: { label: string; value: any; isUrl?: boolean; isSocial?: boolean }) {
    let displayValue = value || "—";
    if (value && isUrl) {
        const url = value.startsWith("http") ? value : `https://${value}`;
        displayValue = <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-secondary)", textDecoration: "underline" }}>{value}</a>;
    }
    if (value && isSocial) {
        displayValue = <span style={{ color: "var(--accent-secondary)" }}>{value}</span>;
    }

    return (
        <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-primary)" }}>{displayValue}</div>
        </div>
    );
}
