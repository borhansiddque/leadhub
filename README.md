# 🚀 LeadHub - High-Quality Lead Marketplace

LeadHub is a premium, performance-driven marketplace designed for purchasing and managing high-quality business leads. Built with a focus on rich aesthetics, security, and an industry-standard order approval workflow.

## ✨ Core Features

### 🛒 Marketplace & Advanced Discovery
- **Multi-View Interface**: Toggle between a sleek Grid/List view and an **Interactive Map View** powered by `react-leaflet`.
- **Advanced Filtering**: Drill down into leads by **Industry**, **Location**, **Job Title**, and **Price Range**.
- **Global Search**: Instant search across all lead metadata with optimized debouncing.
- **Wishlist**: Save leads for later with a personalized wishlist.

### 🔐 Secure Order Approval Flow
- **Payment Verification**: To ensure quality and security, lead details are protected until payment is confirmed.
- **Manual Reveal**: Full contact information (Email, Socials, Website) is only revealed after an Admin approves the purchase.
- **Order Tracking**: Real-time status updates (Pending vs. Confirmed) in both the User and Admin dashboards.

### 📊 Comprehensive User Dashboard
- **Purchased Inventory**: Access all confirmed leads in a clean, organized interface.
- **Dynamic Access**: View blurred data for pending approvals and full data for confirmed orders.
- **Excel Export**: Download lead lists into structured XLSX files for easy CRM integration.

### 🛡️ Admin Management Suite
- **Lead Management**: Complete CRUD interface with bulk CSV/Excel upload support.
- **Order Approval**: Dedicated order management system to verify payments and release leads.
- **Revenue Analytics**: Track total vs. confirmed revenue metrics.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication, Security Rules)
- **Mapping**: [React Leaflet](https://react-leaflet.js.org/) & [Leaflet](https://leafletjs.com/)
- **Styling**: Vanilla CSS with Glassmorphism and CSS Variables
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Data Export**: [XLSX](https://sheetjs.com/)

## 🚀 Getting Started

1. **Environment Setup**: Configure your Firebase project and add credentials to your environment variables.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Deploy Security Rules**: Ensure `firestore.rules` are deployed to your Firebase console to enable role-based access.

## 📄 License

Proprietary License - All rights reserved.
