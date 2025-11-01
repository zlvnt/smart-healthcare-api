# Smart Healthcare System

Microservices-based healthcare management system dengan REST API dan Swagger documentation.

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install --prefix services/patient-service
npm install --prefix services/doctor-service
npm install --prefix services/appointment-service
npm install --prefix services/medical-record-service
npm install --prefix api-gateway
```

### 2. Configure Environment

Copy `.env.example` ke `.env` lalu edit `MONGODB_URI`:

```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=your_mongodb_atlas_connection_string_here
```

**⚠️ Important:** Whitelist IP address di MongoDB Atlas (Network Access).

---

## ▶️ How to Run

Jalankan di **5 terminal terpisah**:

```bash
# Terminal 1
cd services/patient-service && node server.js

# Terminal 2
cd services/doctor-service && node server.js

# Terminal 3
cd services/appointment-service && node server.js

# Terminal 4
cd services/medical-record-service && node server.js

# Terminal 5
cd api-gateway && node server.js
```

---

## 🌐 Access URLs

- **Swagger UI:** http://localhost:3000/api-docs
- **Frontend:** Buka file `frontend/index.html` di browser
- **API Gateway:** http://localhost:3000

---

**Dokumentasi lengkap:** Lihat `DOCUMENTATION.md`
