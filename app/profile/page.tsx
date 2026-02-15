"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FiUser, FiBriefcase, FiGlobe, FiMapPin, FiBell, FiSave, FiArrowLeft, FiCheck, FiX
} from "react-icons/fi";
import Swal from "sweetalert2";

import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProfilePage() {
    const { user, userData, loading: authLoading, updateUserProfile } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dbIndustries, setDbIndustries] = useState<string[]>([]);
    const [dbLocations, setDbLocations] = useState<string[]>([]);

    // Form states
    const [displayName, setDisplayName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [website, setWebsite] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [alertEnabled, setAlertEnabled] = useState(false);
    const [alertIndustries, setAlertIndustries] = useState<string[]>([]);
    const [alertLocations, setAlertLocations] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
        if (!authLoading && !user) {
            router.push("/login");
        }

        async function fetchMetadata() {
            try {
                const q = query(collection(db, "leads"), limit(300));
                const snap = await getDocs(q);
                const locs = new Set<string>();
                const inds = new Set<string>();
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.location) locs.add(data.location);
                    if (data.industry) inds.add(data.industry);
                });
                setDbLocations(Array.from(locs).sort());
                setDbIndustries(Array.from(inds).sort());
            } catch (err) {
                console.error("Error fetching metadata:", err);
            }
        }
        fetchMetadata();
    }, [user, authLoading, router]);

    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || "");
            setCompanyName(userData.companyName || "");
            setJobTitle(userData.jobTitle || "");
            setWebsite(userData.website || "");
            setInterests(userData.professionalInterests || []);
            setAlertEnabled(userData.alertPreferences?.enabled || false);
            setAlertIndustries(userData.alertPreferences?.industries || []);
            setAlertLocations(userData.alertPreferences?.locations || []);
        }
    }, [userData]);

    const toggleInterest = (industry: string) => {
        setInterests(prev =>
            prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
        );
    };

    const toggleAlertIndustry = (industry: string) => {
        setAlertIndustries(prev =>
            prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
        );
    };

    const toggleAlertLocation = (location: string) => {
        setAlertLocations(prev =>
            prev.includes(location) ? prev.filter(i => i !== location) : [...prev, location]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError(null);

        try {
            await updateUserProfile({
                displayName,
                companyName,
                jobTitle,
                website,
                professionalInterests: interests,
                alertPreferences: {
                    enabled: alertEnabled,
                    industries: alertIndustries,
                    locations: alertLocations
                }
            });

            Swal.fire({
                title: "Profile Updated!",
                text: "Your professional details have been saved successfully.",
                icon: "success",
                background: "#1a1a1a",
                color: "#fff",
                confirmButtonColor: "var(--accent-secondary)",
                timer: 3000
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("Profile update error:", err);
            Swal.fire({
                title: "Update Failed",
                text: "There was an error saving your changes. Please try again.",
                icon: "error",
                background: "#1a1a1a",
                color: "#fff",
                confirmButtonColor: "var(--accent-secondary)"
            });
            setError("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!mounted || authLoading) {
        return (
            <div className="page-container" style={{ display: "flex", justifyContent: "center", padding: 120 }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page-container grid-bg" style={{ minHeight: "100vh" }}>
            <div className="glow-orb" style={{ width: 400, height: 400, background: "rgba(108, 92, 231, 0.15)", top: "10%", right: "-5%" }} />

            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <Link
                    href="/dashboard"
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", marginBottom: 32,
                    }}
                >
                    <FiArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 8 }}>
                        Profile <span className="gradient-text">Settings</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage your account, professional interests, and lead alerts.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                    {/* Basic Information */}
                    <section className="glass-card animate-fade-in-up" style={{ padding: 32 }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                            <FiUser style={{ color: "var(--accent-secondary)" }} /> Basic Information
                        </h2>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <div className="form-group">
                                <label className="label">Full Name</label>
                                <input
                                    className="input-field"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Email Address</label>
                                <input
                                    className="input-field"
                                    value={user?.email || ""}
                                    disabled
                                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                                />
                                <small style={{ color: "var(--text-muted)", marginTop: 4, display: "block" }}>Email cannot be changed.</small>
                            </div>
                            <div className="form-group">
                                <label className="label">Company Name</label>
                                <input
                                    className="input-field"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Job Title</label>
                                <input
                                    className="input-field"
                                    value={jobTitle}
                                    onChange={e => setJobTitle(e.target.value)}
                                    placeholder="e.g. Marketing Director"
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                <label className="label">Website</label>
                                <div style={{ position: "relative" }}>
                                    <FiGlobe size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        className="input-field"
                                        style={{ paddingLeft: 40 }}
                                        value={website}
                                        onChange={e => setWebsite(e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Professional Interests */}
                    <section className="glass-card animate-fade-in-up" style={{ padding: 32, animationDelay: "0.1s" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                            <FiBriefcase style={{ color: "var(--accent-secondary)" }} /> Professional Interests
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 24 }}>
                            Select the industries you are most interested in. This helps us personalize your marketplace experience.
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                            {dbIndustries.length > 0 ? dbIndustries.map(industry => (
                                <button
                                    key={industry}
                                    type="button"
                                    onClick={() => toggleInterest(industry)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "var(--radius-full)",
                                        border: interests.includes(industry)
                                            ? "1px solid var(--accent-secondary)"
                                            : "1px solid var(--border-color)",
                                        background: interests.includes(industry)
                                            ? "rgba(108, 92, 231, 0.1)"
                                            : "rgba(255,255,255,0.03)",
                                        color: interests.includes(industry)
                                            ? "white"
                                            : "var(--text-secondary)",
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {industry}
                                </button>
                            )) : (
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading industries...</p>
                            )}
                        </div>
                    </section>

                    {/* Lead Alerts */}
                    <section className="glass-card animate-fade-in-up" style={{ padding: 32, animationDelay: "0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
                                <FiBell style={{ color: "var(--accent-secondary)" }} /> Lead Alerts
                            </h2>
                            <label className="switch" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{alertEnabled ? "Enabled" : "Disabled"}</span>
                                <input
                                    type="checkbox"
                                    checked={alertEnabled}
                                    onChange={e => setAlertEnabled(e.target.checked)}
                                    style={{ cursor: "pointer" }}
                                />
                            </label>
                        </div>

                        <div style={{ opacity: alertEnabled ? 1 : 0.5, pointerEvents: alertEnabled ? "auto" : "none", transition: "all 0.3s ease" }}>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 20 }}>
                                Receive notifications when new leads match your specific criteria.
                            </p>

                            <div style={{ marginBottom: 24 }}>
                                <label className="label" style={{ marginBottom: 12, display: "block" }}>Alert Industries</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {dbIndustries.map(ind => (
                                        <button
                                            key={ind}
                                            type="button"
                                            onClick={() => toggleAlertIndustry(ind)}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "var(--radius-md)",
                                                border: alertIndustries.includes(ind) ? "1px solid var(--accent-secondary)" : "1px solid var(--border-color)",
                                                background: alertIndustries.includes(ind) ? "rgba(108, 92, 231, 0.1)" : "transparent",
                                                color: alertIndustries.includes(ind) ? "white" : "var(--text-muted)",
                                                fontSize: "0.75rem",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {ind}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label" style={{ marginBottom: 12, display: "block" }}>Alert Locations</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {dbLocations.map(loc => (
                                        <button
                                            key={loc}
                                            type="button"
                                            onClick={() => toggleAlertLocation(loc)}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "var(--radius-md)",
                                                border: alertLocations.includes(loc) ? "1px solid var(--success)" : "1px solid var(--border-color)",
                                                background: alertLocations.includes(loc) ? "rgba(0, 214, 143, 0.1)" : "transparent",
                                                color: alertLocations.includes(loc) ? "white" : "var(--text-muted)",
                                                fontSize: "0.75rem",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                            style={{ padding: "14px 40px", fontSize: "1rem", display: "flex", alignItems: "center", gap: 10 }}
                        >
                            {saving ? (
                                <><FiSave className="spinner" /> Saving...</>
                            ) : success ? (
                                <><FiCheck /> Profile Updated!</>
                            ) : (
                                <><FiSave /> Save Changes</>
                            )}
                        </button>

                        {error && (
                            <span style={{ color: "var(--error)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6 }}>
                                <FiX size={16} /> {error}
                            </span>
                        )}

                        {success && (
                            <span style={{ color: "var(--success)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6 }}>
                                <FiCheck size={16} /> Your profile has been updated successfully.
                            </span>
                        )}
                    </div>
                </form>
            </div>

            <style jsx>{`
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .switch input {
                    appearance: none;
                    width: 44px;
                    height: 22px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 20px;
                    position: relative;
                    transition: 0.3s;
                    border: 1px solid var(--border-color);
                }
                .switch input:checked {
                    background: var(--accent-secondary);
                }
                .switch input:before {
                    content: "";
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    background: white;
                    border-radius: 50%;
                    top: 2px;
                    left: 2px;
                    transition: 0.3s;
                }
                .switch input:checked:before {
                    left: 24px;
                }
            `}</style>
        </div>
    );
}
