# Smart Healthcare System - Technical Documentation

**UTS - Enterprise Application Integration / Web Service Development**

---

## 📌 Ringkasan Project

**Tema:** Smart Healthcare System
**Requirement:** Minimal 2 layanan yang berkomunikasi via REST API
**Implementasi:** 4 microservices + API Gateway + Frontend
**Database:** MongoDB Atlas

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend Framework** | Node.js + Express | REST API services |
| **Database** | MongoDB Atlas | Cloud database |
| **Frontend** | HTML + CSS + Vanilla JavaScript | Admin dashboard |
| **HTTP Client** | Axios | Inter-service communication |
| **API Documentation** | Swagger UI + swagger-jsdoc | OpenAPI 3.0 documentation |
| **CORS** | cors package | Cross-origin resource sharing |

---

## 🏗️ Arsitektur Sistem

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│              (HTML + CSS + JS)                       │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP Request
                   ↓
┌─────────────────────────────────────────────────────┐
│              API Gateway (:3000)                     │
│          + Swagger Documentation                     │
└──┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │
   │ Forward  │ Forward  │ Forward  │ Forward
   ↓          ↓          ↓          ↓
┌──────┐  ┌──────┐  ┌──────────┐  ┌──────────────┐
│Patient│  │Doctor│  │Appointment│  │Medical Record│
│:3001 │  │:3002 │  │  :3003   │  │    :3004     │
└──────┘  └──────┘  └────┬─────┘  └──────┬───────┘
                         │                │
                         │ Validate       │ Validate
                         │ via HTTP       │ via HTTP
                         ↓                ↓
                    ┌────────────────────────────┐
                    │ Inter-Service Communication│
                    │  Patient & Doctor Service  │
                    └────────────────────────────┘
```

### Peran Setiap Service

| Service | Role | Port | Fungsi |
|---------|------|------|--------|
| **Patient Service** | **Provider** | 3001 | Menyediakan API untuk data pasien |
| **Doctor Service** | **Provider** | 3002 | Menyediakan API untuk data dokter |
| **Appointment Service** | **Provider & Consumer** | 3003 | Manage appointment + validasi ke Patient & Doctor |
| **Medical Record Service** | **Consumer** | 3004 | Manage rekam medis + validasi ke 3 services |
| **API Gateway** | **Gateway** | 3000 | Central routing + Swagger UI |

---

## 🔄 Inter-Service Communication

### 1. Appointment Service (Consumer ke 2 Services)

**Flow saat Create Appointment:**

```
1. Frontend → API Gateway → Appointment Service
2. Appointment Service validates:
   ├─→ HTTP GET Patient Service (/patients/:id)
   └─→ HTTP GET Doctor Service (/doctors/:id)
3. Jika valid → Save appointment
4. Jika tidak valid → Return 404 error
```

### 2. Medical Record Service (Consumer ke 3 Services)

**Flow saat Create Medical Record:**

```
1. Frontend → API Gateway → Medical Record Service
2. Medical Record Service validates:
   ├─→ HTTP GET Patient Service (/patients/:id)
   ├─→ HTTP GET Doctor Service (/doctors/:id)
   └─→ HTTP GET Appointment Service (/appointments/:id) [optional]
3. Jika semua valid → Save medical record
4. Jika ada yang tidak valid → Return 404 error
```

---

## 📡 API Endpoints Summary

### Via API Gateway (http://localhost:3000)

**Format:** Semua endpoint menggunakan JSON

| Endpoint | Method | Service Tujuan | Fungsi |
|----------|--------|----------------|--------|
| `/api/patients` | GET, POST | Patient Service | Manage data pasien |
| `/api/patients/:id` | GET, PUT, DELETE | Patient Service | CRUD individual patient |
| `/api/doctors` | GET, POST | Doctor Service | Manage data dokter |
| `/api/doctors/:id` | GET, PUT, DELETE | Doctor Service | CRUD individual doctor |
| `/api/appointments` | GET, POST | Appointment Service | Manage appointment + validasi |
| `/api/appointments/:id` | GET, DELETE | Appointment Service | CRUD individual appointment |
| `/api/appointments/:id/status` | PUT | Appointment Service | Update status appointment |
| `/api/records` | GET, POST | Medical Record Service | Manage rekam medis + validasi |
| `/api/records/:id` | GET | Medical Record Service | Get individual record |
| `/api/records/patient/:patientId` | GET | Medical Record Service | Get records by patient |

### Dokumentasi Lengkap

**Swagger UI:** `http://localhost:3000/api-docs`
**OpenAPI JSON:** `http://localhost:3000/api-docs.json`

---

## 🧪 Testing Guide

### Test Inter-Service Communication

**1. Create Patient & Doctor:**
```bash
# Create Patient
POST http://localhost:3000/api/patients
Body: {"name":"John Doe","birth_date":"1990-05-15","gender":"male","phone":"081234567890"}
→ Response: patient_id

# Create Doctor
POST http://localhost:3000/api/doctors
Body: {"name":"Dr. Jane Smith","specialization":"Cardiologist","phone":"081234567891"}
→ Response: doctor_id
```

**2. Test Appointment Validation (2 Services):**
```bash
# Valid IDs → Success
POST http://localhost:3000/api/appointments
Body: {"patient_id":"<valid_id>","doctor_id":"<valid_id>","appointment_date":"2024-11-15 10:00"}
→ Response: 201 Created ✅

# Invalid IDs → Error
POST http://localhost:3000/api/appointments
Body: {"patient_id":"invalid","doctor_id":"invalid","appointment_date":"2024-11-15 10:00"}
→ Response: 404 "Patient not found" ✅
```

**3. Test Medical Record Validation (3 Services):**
```bash
# Valid IDs → Success
POST http://localhost:3000/api/records
Body: {
  "patient_id":"<valid_id>",
  "doctor_id":"<valid_id>",
  "appointment_id":"<valid_id>",
  "diagnosis":"Test diagnosis"
}
→ Response: 201 Created ✅
```

### Test via Swagger UI

1. Buka: `http://localhost:3000/api-docs`
2. Expand endpoint (misal: POST /api/appointments)
3. Klik "Try it out"
4. Edit request body
5. Klik "Execute"
6. Lihat response

### Test via Frontend

1. Buka `frontend/index.html`
2. Tab Patients → Add patient
3. Tab Doctors → Add doctor
4. Tab Appointments → Create appointment (dropdown patient & doctor)
5. Verify data tersimpan

---

## 💾 Database Schema

**Database:** MongoDB Atlas
**Database Name:** `healthcare_db`

### Collections

**patients:**
```javascript
{
  name: String,
  birth_date: String (YYYY-MM-DD),
  gender: String (male/female),
  phone: String,
  address: String,
  blood_type: String
}
```

**doctors:**
```javascript
{
  name: String,
  specialization: String,
  phone: String,
  schedule: [String]
}
```

**appointments:**
```javascript
{
  patient_id: String (reference),
  doctor_id: String (reference),
  appointment_date: String (YYYY-MM-DD HH:mm),
  status: String (pending/confirmed/completed/cancelled),
  complaint: String
}
```

**medical_records:**
```javascript
{
  patient_id: String (reference),
  doctor_id: String (reference),
  appointment_id: String (reference, optional),
  diagnosis: String,
  prescription: String,
  notes: String,
  date: Date
}
```

---

## 🎓 Kesimpulan

Project ini mengimplementasikan **microservices architecture** dengan:

1. **4 REST API services** yang independent
2. **Inter-service communication** via HTTP calls untuk validation
3. **API Gateway** sebagai central routing
4. **Complete Swagger documentation** (OpenAPI 3.0)
5. **Frontend consumer** yang memanggil API Gateway
6. **JSON format** untuk semua data exchange

**Highlight:**
- Appointment Service berkomunikasi dengan **2 services** (Patient & Doctor)
- Medical Record Service berkomunikasi dengan **3 services** (Patient, Doctor, Appointment)
- Semua komunikasi menggunakan **HTTP REST API**
