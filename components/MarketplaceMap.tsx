"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icons in Next.js
const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    websiteName: string;
    location: string;
    price: number;
    jobTitle: string;
}

// Simple lookup for common locations to avoid external API calls for this demo
const GEO_LOOKUP: Record<string, [number, number]> = {
    "New York": [40.7128, -74.0060],
    "USA": [37.0902, -95.7129],
    "United States": [37.0902, -95.7129],
    "London": [51.5074, -0.1278],
    "UK": [55.3781, -3.4360],
    "United Kingdom": [55.3781, -3.4360],
    "Canada": [56.1304, -106.3468],
    "Toronto": [43.6532, -79.3832],
    "Germany": [51.1657, 10.4515],
    "Berlin": [52.5200, 13.4050],
    "Australia": [-25.2744, 133.7751],
    "Sydney": [-33.8688, 151.2093],
    "France": [46.2276, 2.2137],
    "Paris": [48.8566, 2.3522],
    "India": [20.5937, 78.9629],
    "Mumbai": [19.0760, 72.8777],
    "California": [36.7783, -119.4179],
    "Texas": [31.9686, -99.9018],
    "Florida": [27.6648, -81.5158],
};

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function MarketplaceMap({ leads }: { leads: Lead[] }) {
    const [center, setCenter] = useState<[number, number]>([20, 0]); // Start with a global view

    const validLeads = leads.map(l => {
        const coords = GEO_LOOKUP[l.location] || null;
        return coords ? { ...l, coords } : null;
    }).filter(Boolean) as (Lead & { coords: [number, number] })[];

    return (
        <div className="glass-card" style={{ height: "600px", width: "100%", overflow: "hidden", position: "relative" }}>
            <MapContainer
                center={center}
                zoom={2}
                style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {validLeads.map(lead => (
                    <Marker key={lead.id} position={lead.coords} icon={markerIcon}>
                        <Popup>
                            <div style={{ color: "black", maxWidth: "200px" }}>
                                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px" }}>{lead.firstName} {lead.lastName}</h4>
                                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
                                    {lead.jobTitle} at {lead.websiteName}
                                </p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "700", color: "var(--accent-secondary)" }}>${lead.price.toFixed(2)}</span>
                                    <a href={`/leads/${lead.id}`} style={{ fontSize: "11px", color: "blue", textDecoration: "underline" }}>View Details</a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {validLeads.length > 0 && <ChangeView center={validLeads[0].coords} />}
            </MapContainer>

            <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 1000, background: "rgba(0,0,0,0.7)", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", color: "white" }}>
                {validLeads.length} leads mapped
            </div>
        </div>
    );
}
