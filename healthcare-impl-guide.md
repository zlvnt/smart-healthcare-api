# Smart Healthcare System - Implementation Guide

Panduan implementasi detail untuk project UTS berdasarkan diskusi.

---

## 📌 Overview

**Topik Pilihan:** Smart Healthcare System  
**Jumlah Services:** 4 layanan + 1 API Gateway + 1 Frontend  
**Target Nilai:** High (81-100)

---

## 🏗️ Arsitektur Sistem

### **Services yang Harus Dibuat:**

1. **Patient Service** (Port 3001)
   - Role: Provider
   - Fungsi: Manajemen data pasien
   
2. **Doctor Service** (Port 3002)
   - Role: Provider
   - Fungsi: Manajemen data dokter dan jadwal praktek

3. **Appointment Service** (Port 3003)
   - Role: Provider & Consumer
   - Fungsi: Manajemen appointment/janji temu
   - Komunikasi: Memanggil Patient Service dan Doctor Service untuk validasi

4. **Medical Record Service** (Port 3004)
   - Role: Consumer
   - Fungsi: Manajemen rekam medis pasien
   - Komunikasi: Memanggil Patient Service, Doctor Service, dan Appointment Service

5. **API Gateway** (Port 3000)
   - Fungsi: Central access point untuk semua services
   - Routing request ke masing-masing service
   - Host Swagger documentation di `/api-docs`

6. **Frontend** (Port 5000)
   - Admin/Staff Dashboard
   - Consume API via API Gateway

### **Diagram Flow:**

```
Frontend (HTML+CSS+JS) 
    ↓
API Gateway (:3000)
    ↓
┌───┴────┬──────────┬───────────┐
↓        ↓          ↓           ↓
Patient  Doctor  Appointment  Medical Record
(:3001)  (:3002)    (:3003)      (:3004)
                    ↓ ↑          ↓ ↑ ↑ ↑
                    └─┤          └─┤ │ │
                      └────────────┴─┴─┘
```

---

## 💾 Database Structure (MongoDB)

### **Database Name:** `healthcare_db`

### **Collection 1: patients**
```
Fields:
- _id: ObjectId (auto-generated)
- name: String (required) - Nama pasien
- birth_date: String (required) - Format: "YYYY-MM-DD"
- gender: String (required) - "male" atau "female"
- phone: String (required) - Nomor telepon
- address: String - Alamat lengkap
- blood_type: String - Golongan darah (O+, A+, B+, AB+, O-, A-, B-, AB-)
```

### **Collection 2: doctors**
```
Fields:
- _id: ObjectId (auto-generated)
- name: String (required) - Nama dokter dengan gelar
- specialization: String (required) - Spesialisasi (Cardiologist, Neurologist, etc)
- phone: String (required) - Nomor telepon
- schedule: Array of String - Jadwal praktek (contoh: ["Monday 09:00-12:00", "Wednesday 14:00-17:00"])
```

### **Collection 3: appointments**
```
Fields:
- _id: ObjectId (auto-generated)
- patient_id: String (required) - Reference ke collection patients
- doctor_id: String (required) - Reference ke collection doctors
- appointment_date: String (required) - Format: "YYYY-MM-DD HH:mm"
- status: String - Status appointment: "pending", "confirmed", "completed", "cancelled"
- complaint: String - Keluhan pasien
- created_at: Date (auto-generated) - Timestamp pembuatan
```

### **Collection 4: medical_records**
```
Fields:
- _id: ObjectId (auto-generated)
- patient_id: String (required) - Reference ke collection patients
- doctor_id: String (required) - Reference ke collection doctors
- appointment_id: String - Reference ke collection appointments (optional)
- diagnosis: String (required) - Diagnosis dokter
- prescription: String - Resep obat
- notes: String - Catatan tambahan
- date: Date (auto-generated) - Tanggal pemeriksaan
```

---

## 🛠️ Tech Stack

| Komponen | Technology |
|----------|------------|
| Backend Framework | Node.js + Express |
| Database | MongoDB |
| Frontend | HTML + CSS + Vanilla JavaScript |
| HTTP Client | Axios (untuk komunikasi antar service) |
| API Documentation | Swagger UI + swagger-jsdoc |
| CORS | cors package |

### **Package yang Dibutuhkan (npm):**

**Untuk semua services:**
- express
- mongoose
- cors
- axios (khusus untuk service yang jadi consumer)

**Untuk API Gateway:**
- express
- cors
- axios
- swagger-ui-express
- swagger-jsdoc

---

## 📡 API Endpoints Detail

### **1. Patient Service (Port 3001)**

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/patients` | Get all patients |
| GET | `/patients/:id` | Get patient by ID |
| POST | `/patients` | Create new patient |
| PUT | `/patients/:id` | Update patient |
| DELETE | `/patients/:id` | Delete patient |

### **2. Doctor Service (Port 3002)**

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/doctors` | Get all doctors |
| GET | `/doctors/:id` | Get doctor by ID |
| POST | `/doctors` | Create new doctor |
| PUT | `/doctors/:id` | Update doctor |
| DELETE | `/doctors/:id` | Delete doctor |

### **3. Appointment Service (Port 3003)**

| Method | Endpoint | Fungsi | Komunikasi |
|--------|----------|--------|------------|
| GET | `/appointments` | Get all appointments | - |
| GET | `/appointments/:id` | Get appointment by ID | - |
| POST | `/appointments` | Create new appointment | Panggil Patient & Doctor Service |
| PUT | `/appointments/:id/status` | Update appointment status | - |
| DELETE | `/appointments/:id` | Delete appointment | - |

**⚠️ PENTING untuk POST `/appointments`:**
1. Validasi patient_id dengan memanggil Patient Service
2. Validasi doctor_id dengan memanggil Doctor Service
3. Jika tidak valid, return error 404
4. Jika valid, save ke database

### **4. Medical Record Service (Port 3004)**

| Method | Endpoint | Fungsi | Komunikasi |
|--------|----------|--------|------------|
| GET | `/records` | Get all medical records | - |
| GET | `/records/:id` | Get record by ID | - |
| GET | `/records/patient/:patientId` | Get records by patient | Optional: Enrich dengan data |
| POST | `/records` | Create new medical record | Panggil Patient, Doctor, Appointment |

**⚠️ PENTING untuk POST `/records`:**
1. Validasi patient_id dengan Patient Service
2. Validasi doctor_id dengan Doctor Service
3. (Optional) Validasi appointment_id dengan Appointment Service
4. Jika tidak valid, return error 404
5. Jika valid, save ke database

### **5. API Gateway (Port 3000)**

| Method | Path | Forward To |
|--------|------|------------|
| ALL | `/api/patients/*` | Patient Service (:3001) |
| ALL | `/api/doctors/*` | Doctor Service (:3002) |
| ALL | `/api/appointments/*` | Appointment Service (:3003) |
| ALL | `/api/records/*` | Medical Record Service (:3004) |
| GET | `/api-docs` | Swagger UI |
| GET | `/api-docs.json` | OpenAPI spec JSON |

---

## 🔄 Komunikasi Antar Service - Flow Detail

### **Flow 1: Create Appointment**

```
1. User mengisi form appointment di Frontend
   ↓
2. Frontend POST ke API Gateway: /api/appointments
   ↓
3. API Gateway forward ke Appointment Service
   ↓
4. Appointment Service:
   a. GET Patient Service untuk validasi patient_id
   b. GET Doctor Service untuk validasi doctor_id
   c. Jika valid → Save ke database
   d. Jika tidak valid → Return error 404
   ↓
5. Response kembali ke Frontend
```

### **Flow 2: Create Medical Record**

```
1. Dokter mengisi form medical record di Frontend
   ↓
2. Frontend POST ke API Gateway: /api/records
   ↓
3. API Gateway forward ke Medical Record Service
   ↓
4. Medical Record Service:
   a. GET Patient Service untuk validasi
   b. GET Doctor Service untuk validasi
   c. GET Appointment Service untuk validasi (optional)
   d. Jika semua valid → Save ke database
   ↓
5. Response kembali ke Frontend
```

---

## 📝 Swagger Documentation Requirements

### **Setup Lokasi:**
Swagger UI di **API Gateway** (Port 3000)

### **Endpoints:**
- `/api-docs` → Swagger UI interface
- `/api-docs.json` → OpenAPI spec JSON export

### **Dokumentasi Harus Mencakup:**

Untuk setiap endpoint:
1. **Tags** - Group by service (Patients, Doctors, Appointments, Medical Records)
2. **Summary** - Deskripsi singkat
3. **Description** - Penjelasan detail
4. **Parameters** - Path/query parameters dengan type & description
5. **Request Body** - Schema untuk POST/PUT dengan example
6. **Responses** - Success (200/201) dan Error (400/404/500) responses

---

## 🎨 Frontend Requirements

### **Type:** Admin/Staff Dashboard

### **Halaman/Sections:**

1. **Patients Management**
   - List patients (table)
   - Add patient (form)
   - Edit patient
   - Delete patient

2. **Doctors Management**
   - List doctors (table)
   - Add doctor (form)
   - Edit doctor
   - Delete doctor

3. **Appointments Management**
   - List appointments
   - Create appointment (dropdown patient & doctor)
   - Update status
   - Delete appointment

4. **Medical Records Management**
   - List records
   - View patient history
   - Create record (form)

### **Technical:**
- Semua API call via API Gateway (localhost:3000)
- Handle loading & error states
- Form validation
- Success/error notifications

---

## 📁 Project Structure

```
healthcare-project/
│
├── api-gateway/
│   ├── server.js
│   ├── swagger.js
│   ├── package.json
│   └── .env
│
├── services/
│   ├── patient-service/
│   │   ├── server.js
│   │   ├── models/
│   │   │   └── Patient.js
│   │   └── package.json
│   │
│   ├── doctor-service/
│   │   ├── server.js
│   │   ├── models/
│   │   │   └── Doctor.js
│   │   └── package.json
│   │
│   ├── appointment-service/
│   │   ├── server.js
│   │   ├── models/
│   │   │   └── Appointment.js
│   │   └── package.json
│   │
│   └── medical-record-service/
│       ├── server.js
│       ├── models/
│       │   └── MedicalRecord.js
│       └── package.json
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── openapi-spec.json
└── README.md
```

---

## ✅ Implementation Checklist

### **Phase 1: Setup & Basic Services**
- [ ] Setup project structure
- [ ] Install dependencies
- [ ] Setup MongoDB
- [ ] Buat Patient Service (CRUD)
- [ ] Buat Doctor Service (CRUD)
- [ ] Test dengan Postman

### **Phase 2: Service Communication**
- [ ] Buat Appointment Service
- [ ] Implementasi komunikasi ke Patient & Doctor
- [ ] Buat Medical Record Service
- [ ] Implementasi komunikasi ke Patient, Doctor, Appointment
- [ ] Test service communication

### **Phase 3: API Gateway**
- [ ] Buat API Gateway
- [ ] Setup routing ke semua services
- [ ] Error handling
- [ ] Test via gateway

### **Phase 4: Swagger**
- [ ] Setup Swagger di Gateway
- [ ] Dokumentasi semua endpoints
- [ ] Test Swagger UI
- [ ] Export openapi-spec.json

### **Phase 5: Frontend**
- [ ] Buat HTML structure
- [ ] Buat CSS styling
- [ ] Implementasi semua management pages
- [ ] Test semua flow

### **Phase 6: Testing**
- [ ] Test di Swagger UI
- [ ] Test di frontend
- [ ] Buat seed data
- [ ] Siapkan presentation

---

## 🎯 Tips Nilai High (81-100)

### **Arsitektur (30%):**
✅ 4 services (lebih dari minimal)
✅ Komunikasi dinamis (GET, POST, PUT, DELETE)
✅ API Gateway berfungsi sempurna
✅ Service communication dengan validasi

### **Fungsionalitas (25%):**
✅ Semua endpoint tanpa error
✅ Frontend CRUD lengkap
✅ Error handling baik
✅ Response cepat

### **Swagger (20%):**
✅ Dokumentasi lengkap semua endpoints
✅ Ada parameters, request/response examples
✅ Grouping dengan tags
✅ Bisa test dari Swagger UI
✅ Export JSON

### **Presentasi (25%):**
✅ Jelaskan arsitektur dengan diagram
✅ Demo live (bukan screenshot)
✅ Tunjukkan service communication
✅ Siap jawab pertanyaan

---

## 🚀 Run Instructions

**Start semua services (5 terminal):**

1. Patient Service: `cd services/patient-service && node server.js`
2. Doctor Service: `cd services/doctor-service && node server.js`
3. Appointment Service: `cd services/appointment-service && node server.js`
4. Medical Record Service: `cd services/medical-record-service && node server.js`
5. API Gateway: `cd api-gateway && node server.js`

**Access:**
- Frontend: `http://localhost:5000`
- Swagger: `http://localhost:3000/api-docs`

---

**Good luck! 🚀**