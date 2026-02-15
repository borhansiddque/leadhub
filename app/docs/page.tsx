"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FiBook, FiUserPlus, FiSearch, FiShoppingCart, FiCheckCircle,
    FiBell, FiArrowRight, FiShield, FiBriefcase, FiMapPin,
    FiDatabase, FiDownload, FiLock, FiStar, FiFilter
} from "react-icons/fi";

const SECTIONS = [
    { id: "intro", title: "Introduction", icon: <FiBook /> },
    { id: "account", title: "Getting Started", icon: <FiUserPlus /> },
    { id: "discovery", title: "Marketplace Guide", icon: <FiSearch /> },
    { id: "data", title: "Data Dictionary", icon: <FiDatabase /> },
    { id: "ordering", title: "Purchase & Security", icon: <FiShoppingCart /> },
    { id: "dashboard", title: "Inventory & CRM", icon: <FiCheckCircle /> },
    { id: "alerts", title: "Lead Alerts", icon: <FiBell /> },
    { id: "faq", title: "FAQ", icon: <FiStar /> },
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("intro");

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="grid-bg" style={{ minHeight: "100vh", paddingTop: 100 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 60 }}>

                {/* Sidebar Navigation */}
                <aside style={{ position: "sticky", top: 120, height: "fit-content" }} className="mobile-hide">
                    <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 24, paddingLeft: 16 }}>
                        Customer Manual
                    </h3>
                    <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 16px",
                                    borderRadius: "var(--radius-md)",
                                    background: activeSection === section.id ? "rgba(108, 92, 231, 0.1)" : "transparent",
                                    border: "none",
                                    color: activeSection === section.id ? "var(--accent-secondary)" : "var(--text-secondary)",
                                    fontSize: "0.95rem",
                                    fontWeight: activeSection === section.id ? 600 : 500,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <span style={{ opacity: 0.7 }}>{section.icon}</span>
                                {section.title}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main style={{ paddingBottom: 150 }}>

                    {/* Intro */}
                    <section id="intro" style={{ marginBottom: 100 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <span style={{ padding: "6px 12px", background: "rgba(108, 92, 231, 0.1)", color: "var(--accent-secondary)", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                                Official Documentation
                            </span>
                        </div>
                        <h1 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: 24, letterSpacing: "-2px", lineHeight: 1 }}>
                            Mastering the <span className="gradient-text">LeadHub</span> Platform
                        </h1>
                        <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 40, maxWidth: 700 }}>
                            LeadHub is designed to be the ultimate growth engine for sales teams and business owners. This in-depth manual covers everything from discovering niche business sectors to managing your post-purchase lead pipeline.
                        </p>
                        <div className="glass-card" style={{ padding: 40, border: "1px solid rgba(108, 92, 231, 0.2)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05 }}>
                                <FiShield size={200} />
                            </div>
                            <h4 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                                <FiShield size={24} style={{ color: "var(--accent-secondary)" }} /> The LeadHub Quality Standard
                            </h4>
                            <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.7, margin: 0 }}>
                                Unlike open marketplaces, LeadHub uses a double-verification system. Our algorithms pre-scan leads for format accuracy, and our human operators verify payment security before sensitive data is released. This ensures your ROI is protected and your direct outreach is high-conversion.
                            </p>
                        </div>
                    </section>

                    {/* Getting Started */}
                    <section id="account" style={{ marginBottom: 100 }}>
                        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 32, letterSpacing: "-0.5px" }}>1. Infrastructure & Setup</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                            <div className="glass-card" style={{ padding: 32 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(108, 92, 231, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-secondary)", marginBottom: 20 }}>
                                    <FiUserPlus size={24} />
                                </div>
                                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>Business Accounts</h4>
                                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>Single accounts allow for individual lead management. For corporate teams, we recommend shared credentials or individual logins to track collective activity across the dashboard.</p>
                            </div>
                            <div className="glass-card" style={{ padding: 32 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(108, 92, 231, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-secondary)", marginBottom: 20 }}>
                                    <FiSettings size={22} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </div>
                                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>Profile Intelligence</h4>
                                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>Our platform uses your "Professional Interests" to curate the marketplace. If you specialize in <i>FinTech</i>, ensuring your profile reflects this will prioritize relevant leads on your landing page.</p>
                            </div>
                        </div>
                    </section>

                    {/* Marketplace Discovery */}
                    <section id="discovery" style={{ marginBottom: 100 }}>
                        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 32, letterSpacing: "-0.5px" }}>2. Advanced Discovery</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "1.1rem" }}>LeadHub offers three primary ways to mine the database for opportunities:</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div className="glass-card" style={{ padding: 24, display: "flex", gap: 24, alignItems: "flex-start" }}>
                                <div style={{ flexShrink: 0, padding: 12, borderRadius: 12, background: "rgba(108, 92, 231, 0.05)" }}>
                                    <FiFilter size={24} style={{ color: "var(--accent-secondary)" }} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 700, marginBottom: 8 }}>High-Precision Filtering</h4>
                                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>Our filters are <strong>live-sampled</strong>. This means the Industries, Job Titles, and Locations you see in the sidebar are directly derived from the actual inventory currently available. If a Job Title or Location isn't listed, it means we currently don't have matching leads for it.</p>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: 24, display: "flex", gap: 24, alignItems: "flex-start" }}>
                                <div style={{ flexShrink: 0, padding: 12, borderRadius: 12, background: "rgba(108, 92, 231, 0.05)" }}>
                                    <FiMapPin size={24} style={{ color: "var(--accent-secondary)" }} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Geospatial Map Discovery</h4>
                                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>Toggle to "Map View" to see the density of leads by region. This is essential for territory-based sales teams. Markers on the map are interactive; clicking one provides a quick summary of the lead before you commit to viewing full details.</p>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: 24, display: "flex", gap: 24, alignItems: "flex-start" }}>
                                <div style={{ flexShrink: 0, padding: 12, borderRadius: 12, background: "rgba(108, 92, 231, 0.05)" }}>
                                    <FiSearch size={24} style={{ color: "var(--accent-secondary)" }} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Semantic Global Search</h4>
                                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>Our search bar supports debounced, real-time matching. You can search by partial company names, keywords, or specific contact names. The search applies across all meta-data fields simultaneously.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Dictionary */}
                    <section id="data" style={{ marginBottom: 100 }}>
                        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 32, letterSpacing: "-0.5px" }}>3. Data Dictionary</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>What exactly are you buying? Here is the anatomy of a LeadHub record:</p>

                        <div className="glass-card" style={{ padding: 0 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                                <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                                    <tr>
                                        <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-primary)", fontWeight: 700, borderBottom: "1px solid var(--border-color)" }}>Data Field</th>
                                        <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-primary)", fontWeight: 700, borderBottom: "1px solid var(--border-color)" }}>Description</th>
                                        <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-primary)", fontWeight: 700, borderBottom: "1px solid var(--border-color)" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { f: "Website/Company Name", d: "The official legal or trade name of the businessEntity.", s: "Public" },
                                        { f: "Contact Identity", d: "First and Last Name of the decision-maker or key contact.", s: "Public" },
                                        { f: "Job title", d: "The specific role (e.g., CEO, Marketing Manager, Founder).", s: "Public" },
                                        { f: "Email Address", d: "Direct, verified professional email (No generic help@ aliases).", s: "Purchased Only" },
                                        { f: "Industry/Sector", d: "The primary business classification for categorization.", s: "Public" },
                                        { f: "Geography", d: "City, Region, or Country where the business is headquartered.", s: "Public" },
                                        { f: "Digital Links", d: "LinkedIn, Instagram, TikTok, and direct Website URLs.", s: "Purchased Only" },
                                        { f: "Entity Metadata", d: "Year founded and structural details like Facebook Pixel presence.", s: "Public" },
                                    ].map((row, i) => (
                                        <tr key={i} style={{ borderBottom: i === 7 ? "none" : "1px solid var(--border-color)" }}>
                                            <td style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: 600 }}>{row.f}</td>
                                            <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{row.d}</td>
                                            <td style={{ padding: "16px 24px" }}>
                                                <span style={{
                                                    padding: "4px 10px",
                                                    borderRadius: 6,
                                                    fontSize: "0.75rem",
                                                    fontWeight: 700,
                                                    background: row.s === "Public" ? "rgba(76, 209, 55, 0.1)" : "rgba(108, 92, 231, 0.1)",
                                                    color: row.s === "Public" ? "#4cd137" : "var(--accent-secondary)"
                                                }}>
                                                    {row.s}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Security & Purchase */}
                    <section id="ordering" style={{ marginBottom: 100 }}>
                        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 32, letterSpacing: "-0.5px" }}>4. Transaction & Security</h2>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                            <div>
                                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                                    <FiLock style={{ color: "var(--accent-secondary)" }} /> Why the manual approval?
                                </h4>
                                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                    To maintain the highest level of lead exclusivity, we do not automatically release data upon payment. Our administrative team verifies that the transaction is legitimate and that the lead data is currently active and relevant. This <strong>Pending Approval</strong> state typically lasts between 30 minutes to 4 hours during business days.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                                    <FiLock style={{ color: "var(--accent-secondary)" }} /> Data Encryption
                                </h4>
                                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                    LeadHub utilizes Firestore Security Rules combined with server-side logic to ensure that <i>purchased data</i> is only visible to the specific user account that completed the transaction. Our database is partitioned such that even if a public list is accessed, the "Contact" fields return null without proper authorization.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Inventory & CRM */}
                    <section id="dashboard" style={{ marginBottom: 100 }}>
                        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 32, letterSpacing: "-0.5px" }}>5. Inventory & CRM Integration</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>Once purchased, your leads move to your permanent Dashboard inventory.</p>

                        <div className="glass-card" style={{ padding: 32 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyItems: "space-between", marginBottom: 24 }}>
                                <div>
                                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>Excel/XLSX Portability</h4>
                                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Export your leads for Go-To-Market campaigns.</p>
                                </div>
                                <div style={{ marginLeft: "auto", padding: 12, borderRadius: 12, background: "var(--accent-gradient)", color: "white" }}>
                                    <FiDownload size={24} />
                                </div>
                            </div>
                            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 0 }}>
                                You can download your entire purchase history or specific batches as industry-standard `.xlsx` files. These files are pre-formatted for direct upload into major CRM systems like Salesforce, HubSpot, or Pipedrive. The export includes all full contact details, social links, and metadata.
                            </p>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section id="faq">
                        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 32, letterSpacing: "-0.5px" }}>6. Frequently Asked Questions</h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {[
                                { q: "Why is some data blurred/hidden even after I login?", a: "Data is hidden for all leads that have not been purchased yet. Once you complete a purchase and it is approved by our admin, the data will instantly unblur in your dashboard and on the details page." },
                                { q: "Can I get a refund if the lead data is incorrect?", a: "We guarantee 95%+ accuracy. If you encounter a 'dead' email or defunct business name within 48 hours of purchase, contact our support team with the Lead ID for a credit or exchange." },
                                { q: "What is the maximum number of leads I can buy at once?", a: "LeadHub does not set an upper limit on cart size. For bulk acquisition (1000+ leads), please contact our Enterprise team for dedicated pricing and custom sectoral data." },
                                { q: "How often are the 'Core Industries' updated?", a: "The industries displayed on the home page are synchronized with our database inventory. As we add leads in new sectors (e.g., Green Energy or AI), those categories will automatically appear in the filtered lists." },
                                { q: "Can I resell leads I purchase here?", a: "No. LeadHub leads are sold under a single-organization license for direct outreach only. Re-selling or publishing our database data is a violation of our Terms of Service." },
                            ].map((item, i) => (
                                <div key={i} className="glass-card" style={{ padding: 24 }}>
                                    <h4 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 12, color: "var(--text-primary)" }}>{item.q}</h4>
                                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <footer style={{ marginTop: 100, paddingTop: 60, borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>Still have questions? Our support team is here to help.</p>
                        <a href="mailto:support@leadhub.io" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                            Contact Support
                        </a>
                    </footer>

                </main>
            </div>
        </div>
    );
}

// Dummy Settings icon placeholder for the grid
function FiSettings(props: any) {
    return (
        <svg {...props} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    )
}
