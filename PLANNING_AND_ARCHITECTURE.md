# Meeran Times ERP + POS - System Architecture & Plan

## 1. System Architecture
**Type:** Single Page Application (SPA) with Serverless Backend.
**Pattern:** Modular, Component-based architecture.

### Components:
1.  **Client (Frontend):** React.js (Vite)
    *   **Admin Portal:** Dashboard, Reports, Management (Inventory, Employees, Suppliers).
    *   **POS Portal:** Fast billing interface, high availability.
    *   **Mobile/Tablet View:** Responsive design for on-the-floor management.
2.  **Backend (BaaS):** Firebase
    *   **Authentication:** Firebase Auth (Email/Password).
    *   **Database:** Cloud Firestore (NoSQL, Real-time).
    *   **Storage:** Firebase Storage (Product images, Bills).
    *   **Hosting:** Firebase Hosting.
3.  **Integrations:**
    *   **WhatsApp:** WhatsApp Business API (via Twilio or similar) or `wa.me` deep links for MVP.
    *   **Image Recognition:** TensorFlow.js (Client-side) or Google Cloud Vision API.

---

## 2. Database Schema (Firestore)

### `shops`
*   `id`: "wholesale", "retail_1", "retail_2"
*   `name`: String
*   `location`: String
*   `type`: "wholesale" | "retail"

### `users`
*   `uid`: String (Auth ID)
*   `name`: String
*   `role`: "admin" | "cashier" | "manager"
*   `assignedShopId`: String (or Array)
*   `pin`: String (for quick POS access - optional)

### `inventory` (Global Collection)
*   `sku`: String (Unique)
*   `modelNumber`: String
*   `brand`: String
*   `category`: String
*   `gender`: "Men" | "Women" | "Unisex" | "Kids"
*   `costPrice`: Number
*   `sellingPrice`: Number
*   `warrantyPeriod`: String
*   `images`: Array<URL> (First is primary)
*   `barcode`: String
*   `stock`: Map
    *   `wholesale`: Number
    *   `retail_1`: Number
    *   `retail_2`: Number
*   `searchKeywords`: Array<String> (for smart search)

### `transactions` (Sales)
*   `billId`: String
*   `shopId`: String
*   `timestamp`: Timestamp
*   `salesmanId`: String
*   `cashierId`: String
*   `customerName`: String (Optional)
*   `customerPhone`: String (Optional)
*   `items`: Array
    *   `sku`: String
    *   `model`: String
    *   `qty`: Number
    *   `price`: Number
    *   `discount`: Number
*   `subTotal`: Number
*   `tax`: Number
*   `grandTotal`: Number
*   `status`: "paid" | "refunded"

### `transfers` (Stock Movement)
*   `transferId`: String
*   `fromShop`: String
*   `toShop`: String
*   `items`: Array<{sku, qty}>
*   `status`: "completed"
*   `timestamp`: Timestamp
*   `approvedBy`: String

### `expenses`
*   `id`: String
*   `shopId`: String
*   `category`: String
*   `amount`: Number
*   `date`: Timestamp
*   `note`: String

### `suppliers`
*   `id`: String
*   `name`: String
*   `phone`: String
*   `balance`: Number (Credit)
*   `ledger`: Sub-collection of transactions

---

## 3. Module-wise Feature Breakdown

### A. Core (Admin)
*   **Master Dashboard:** Aggregated stats (Sales, Stock, Expenses).
*   **User Management:** Create users, assign roles/shops.
*   **Settings:** Tax rates, Shop details, Print configuration.

### B. Inventory & Logistics
*   **Product Master:** CRUD for watches.
*   **Stock Transfer:** UI to move stock between Wholesale and Retail units.
*   **Barcode Gen:** Generate and print labels.
*   **Smart Search:** Image/Text based lookup.

### C. POS (Point of Sale) for Retail/Wholesale
*   **Billing Screen:** Touch-friendly, grid/list view.
*   **Cart:** Hold/Resume bills (optional), Disc, Tax.
*   **Checkout:** Multiple payment modes (Cash, Card, UPI).
*   **Receipt:** Thermal print & WhatsApp share.

### D. HR & Expenses
*   **Staff:** Performance graphs, Commission calc.
*   **Expenses:** Petty cash logs.

---

## 4. User Flow Diagrams (Textual)

**Flow 1: Stock Transfer**
1. Admin selects "Stock Transfer".
2. Selects Source (Wholesale) -> Destination (Retail 1).
3. Scans/Selects Items -> Enters Qty.
4. Clicks "Transfer".
5. System updates `stock.wholesale` (-qty) and `stock.retail_1` (+qty).
6. Log created in `transfers`.

**Flow 2: Billing**
1. Cashier logs in (POS View).
2. Selects Salesman (Dropdown).
3. Scans Item / Searches Model / Uploads Image to find.
4. Adds to Cart.
5. Apply Discount (if any).
6. Checkout -> Enter Amount -> Confirm.
7. Print Bill & Auto-send WhatsApp.
8. Inventory deducted from current shop.

---

## 5. UI Layout Description

**Theme:** "Light & Airy" - White backgrounds, soft gray borders (#E5E7EB), strong accent color (Royal Blue or Emerald Green), heavy use of white-space and soft shadows (glassmorphism overlays).

**Admin Layout:**
*   **Sidebar (Left, Fixed):** Navigation with icons.
*   **Header (Top):** Global Search, Notifications, User Profile.
*   **Main Content:** Card-based layout.
    *   *Dashboard:* Grid of 4 cards (Stats) + 1 large Chart + Recent Activity Table.

**POS Layout:**
*   **Full Screen Mode.**
*   **Left (65%):** Product Grid/List with Search bar on top and Category chips.
*   **Right (35%):** Cart Summary. Fixed at right.
    *   Top: Customer & Salesman Select.
    *   Middle: Item List (Scrollable).
    *   Bottom: Totals & BIG "Pay" Button.

---

## 6. Mobile-First Approach
*   **CSS Grid/Flexbox:** Layouts stack vertically on mobile.
*   **Touch Targets:** Buttons min-height 44px.
*   **Scanning:** Use mobile camera for barcode/image scanning via WebRTC.
*   **Dashboard:** Swipeable cards on mobile.

---

## 7. Tech Stack Recommendation (The "Best" Stack)
**Frontend:**
*   **Framework:** React 18 + Vite (Fastest dev experience & performance).
*   **Language:** JavaScript (ES6+).
*   **Styling:** **Tailwind CSS** (Strongly Recommended for "Commercial" look & responsiveness) + **Framer Motion** (for smooth animations/transitions).
    *   *Note: If restricted to Vanilla CSS, we will implement a custom utility system, but Tailwind is better for this scale.*
*   **State:** Zustand (Simpler than Redux, great for global POS state).
*   **Icons:** Lucide React or Phosphor Icons (Modern, clean).

**Backend:**
*   **Firebase:** Best for real-time stock updates across 3 shops without complex server maintanence.

---

## 8. WhatsApp Integration Approach
**Strategy:**
1.  **Direct Link (MVP):** Generate URL `https://wa.me/91XXXXXXXXXX?text=Bill%20Details...`. Opens WhatsApp Web/App on the cashier's device.
2.  **Twilio / Meta API:** Server-side function triggers a template message with PDF link. (Requires paid account).
*Recommendation:* Start with Direct Link for immediate cost-savings, upgrade to API later.

---

## 9. Image Recognition Strategy
**Feature:** "Find Watch by Photo"
**Implementation:**
1.  **Client-Side (TensorFlow.js + MobileNet):**
    *   Use a pre-trained model to extract feature vectors (embeddings) from the uploaded watch image.
    *   Compare these vectors against pre-computed vectors of the ~400 stored watch images using Cosine Similarity.
    *   Return top 5 matches.
2.  **Advantages:** Fast, offline-capable, no cloud API costs per request.

---

## 10. Deployment
*   **CI/CD:** GitHub Actions to deploy to Firebase Hosting on merge.
*   **PWA:** Configure `manifest.json` so it can be installed as an App on iPads/Tablets.
