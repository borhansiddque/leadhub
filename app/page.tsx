"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiZap, FiSearch, FiShield, FiTrendingUp, FiUsers, FiDatabase, FiArrowRight, FiStar, FiMapPin, FiBriefcase, FiCheck } from "react-icons/fi";
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Lead {
  id: string;
  websiteName: string;
  websiteUrl: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  industry: string;
  location: string;
  price: number;
}

export default function Home() {
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [featuredLeads, setFeaturedLeads] = useState<Lead[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [totalIndsCount, setTotalIndsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchHomeData() {
      try {
        const countSnapshot = await getCountFromServer(collection(db, "leads"));
        setTotalLeads(countSnapshot.data().count);

        // 2. Fetch Total Orders
        const ordersSnapshot = await getCountFromServer(collection(db, "orders"));
        setTotalOrders(ordersSnapshot.data().count);

        // 3. Fetch Featured Leads (Latest 3)
        const q = query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(3));
        const leadSnapshot = await getDocs(q);
        setFeaturedLeads(leadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));

        // 4. Fetch Industries for Matrix
        const metaQ = query(collection(db, "leads"), limit(300));
        const metaSnap = await getDocs(metaQ);
        const inds = new Set<string>();
        metaSnap.docs.forEach(doc => {
          const ind = doc.data().industry;
          if (ind) inds.add(ind);
        });

        const allInds = Array.from(inds);
        setTotalIndsCount(allInds.length);

        // Shuffle and pick 15
        const shuffled = allInds.sort(() => 0.5 - Math.random());
        setIndustries(shuffled.slice(0, 15).sort());
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  return (
    <div className="grid-bg" style={{ minHeight: "100vh", overflow: "hidden", position: "relative" }}>
      {/* Glow orbs */}
      <div className="glow-orb" style={{ width: 400, height: 400, background: "#6c5ce7", top: -100, right: -100 }} />
      <div className="glow-orb" style={{ width: 300, height: 300, background: "#a78bfa", bottom: 200, left: -50 }} />

      {/* Hero */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "160px 24px 80px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          className="animate-fade-in-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(108, 92, 231, 0.1)",
            border: "1px solid rgba(108, 92, 231, 0.2)",
            borderRadius: "var(--radius-full)",
            padding: "8px 20px",
            marginBottom: 32,
            fontSize: "0.85rem",
            color: "var(--accent-secondary)",
            fontWeight: 600,
          }}
        >
          <FiStar size={14} />
          Trusted by 10,000+ businesses worldwide
        </div>

        <h1
          className="animate-fade-in-up delay-100"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-2px",
            marginBottom: 24,
            maxWidth: 900,
            margin: "0 auto 24px",
          }}
        >
          Access{" "}
          <span className="gradient-text">Premium Verified</span>
          <br />
          Business Leads Instantly
        </h1>

        <p
          className="animate-fade-in-up delay-200"
          style={{
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            maxWidth: 600,
            margin: "0 auto 48px",
            lineHeight: 1.7,
          }}
        >
          Browse, search, and purchase verified business leads across every industry.
          Fuel your sales pipeline with high-quality contacts.
        </p>

        <div
          className="animate-fade-in-up delay-300"
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link href="/leads" className="btn-primary" style={{ padding: "16px 36px", fontSize: "1.05rem" }}>
            Browse Leads <FiArrowRight size={18} />
          </Link>
          <Link href="/register" className="btn-secondary" style={{ padding: "16px 36px", fontSize: "1.05rem" }}>
            Create Account
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section
        className="animate-fade-in-up delay-400"
        style={{
          maxWidth: 1000,
          margin: "0 auto 100px",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 24,
        }}
      >
        {[
          { value: (mounted && totalLeads !== null) ? `${totalLeads}+` : "1M+", label: "Verified Leads", icon: <FiDatabase size={22} /> },
          { value: (mounted && totalIndsCount > 0) ? `${totalIndsCount}` : "12", label: "Core Industries", icon: <FiTrendingUp size={22} /> },
          { value: "99%", label: "Accuracy Rate", icon: <FiShield size={22} /> },
          { value: (mounted && totalOrders !== null) ? `${totalOrders}+` : "10K+", label: "Happy Customers", icon: <FiUsers size={22} /> },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: 28,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "rgba(108, 92, 231, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "var(--accent-secondary)",
              }}
            >
              {stat.icon}
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 4 }} className="gradient-text">
              {stat.value}
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Featured Leads Section */}
      {mounted && featuredLeads.length > 0 && (
        <section
          style={{
            maxWidth: 1280,
            margin: "0 auto 120px",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
            <div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 12, letterSpacing: "-1px" }}>
                Featured <span className="gradient-text">Leads</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Hand-picked premium business contacts</p>
            </div>
            <Link href="/leads" className="btn-secondary btn-small" style={{ textDecoration: "none" }}>
              View Marketplace <FiArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {featuredLeads.map((lead, i) => (
              <div
                key={lead.id}
                className="glass-card"
                style={{ padding: 28, position: "relative" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.1rem" }}>
                    {lead.firstName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{lead.firstName} {lead.lastName}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{lead.jobTitle}</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <FiBriefcase size={14} style={{ color: "var(--accent-secondary)" }} />
                    {lead.industry}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <FiMapPin size={14} style={{ color: "var(--accent-secondary)" }} />
                    {lead.location}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent-secondary)" }}>${lead.price.toFixed(2)}</div>
                  <Link href={`/leads/${lead.id}`} className="btn-primary btn-small" style={{ textDecoration: "none" }}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core Industries Matrix */}
      {mounted && industries.length > 0 && (
        <section
          style={{
            maxWidth: 1280,
            margin: "0 auto 120px",
            padding: "0 24px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 12, letterSpacing: "-1px" }}>
              Core <span className="gradient-text">Industries</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Browse leads across diverse business sectors</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {industries.map((ind, i) => (
              <Link
                key={ind}
                href={`/leads?industry=${encodeURIComponent(ind)}`}
                className="glass-card hover-lift"
                style={{
                  padding: "24px",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(108, 92, 231, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-secondary)"
                }}>
                  <FiBriefcase size={20} />
                </div>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{ind}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto 120px",
          padding: "0 24px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: "-1px",
          }}
        >
          Why Choose <span className="gradient-text">LeadHub</span>?
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            marginBottom: 64,
            maxWidth: 500,
            margin: "0 auto 64px",
          }}
        >
          Everything you need to supercharge your sales pipeline
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              icon: <FiSearch size={28} />,
              title: "Smart Search & Filter",
              desc: "Find exactly the leads you need with powerful search, industry filters, and location targeting.",
            },
            {
              icon: <FiShield size={28} />,
              title: "Verified & Accurate",
              desc: "Every lead is verified for accuracy. Get real contact details including email, phone, and company info.",
            },
            {
              icon: <FiZap size={28} />,
              title: "Instant Access",
              desc: "Purchase leads and get instant access to full contact details. No waiting, no delays.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: 36 }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  color: "white",
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12 }}>{feature.title}</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.95rem" }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto 100px",
          padding: "0 24px",
        }}
      >
        <div
          className="glass-card animate-pulse-glow"
          style={{
            padding: "60px 40px",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(167, 139, 250, 0.05))",
          }}
        >
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Ready to Grow Your Business?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "1.05rem", maxWidth: 500, margin: "0 auto 32px" }}>
            Join thousands of businesses using LeadHub to find their next customers.
          </p>
          <Link href="/register" className="btn-primary" style={{ padding: "16px 40px", fontSize: "1.05rem" }}>
            Get Started Free <FiArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        © 2026 LeadHub. All rights reserved.
      </footer>
    </div>
  );
}
