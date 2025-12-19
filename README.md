# Smart Healthcare System

Microservices-based healthcare management system dengan **GraphQL API** dan **Docker containerization**.

---

## 🏗️ Architecture

- **5 Microservices** (containerized dengan Docker):
  - Patient Service (port 3001) - GraphQL
  - Doctor Service (port 3002) - GraphQL
  - Appointment Service (port 3003) - GraphQL
  - Medical Record Service (port 3004) - REST
  - API Gateway (port 3000) - Request forwarding

- **Database:** MongoDB Atlas (cloud) - Dual Database Architecture
  - Database 1 (healthcare_db): Patient, Doctor, Appointment
  - Database 2 (healthcare_medical_db): Medical Records
- **Frontend:** Vanilla JavaScript + HTML/CSS

---

## ▶️ How to Run

### Option 1: Using Docker Compose (Recommended)

**Prerequisites:**
- Docker & Docker Compose installed
- `.env` file dengan MongoDB URI

**Run:**
```bash
docker-compose up --build
```

Services akan berjalan di:
- Patient GraphQL: http://localhost:3001/graphql
- Doctor GraphQL: http://localhost:3002/graphql
- Appointment GraphQL: http://localhost:3003/graphql
- Medical Record REST: http://localhost:3004
- API Gateway: http://localhost:3000

**Stop:**
```bash
docker-compose down
```

---

## 🌐 Access URLs

| Service | URL | Type |
|---------|-----|------|
| Patient GraphQL | http://localhost:3001/graphql | GraphQL Playground |
| Doctor GraphQL | http://localhost:3002/graphql | GraphQL Playground |
| Appointment GraphQL | http://localhost:3003/graphql | GraphQL Playground |
| Medical Record | http://localhost:3004 | REST API |
| API Gateway | http://localhost:3000 | REST API |
| Frontend | `frontend/index.html` | Web App |
| Swagger Docs | http://localhost:3000/api-docs | Swagger UI |

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **GraphQL:** express-graphql
- **Database:** MongoDB Atlas
- **Containerization:** Docker & Docker Compose
- **Frontend:** Vanilla JavaScript
- **API Documentation:** Swagger/OpenAPI

---

## 📝 Features

- ✅ 3 GraphQL microservices (Patient, Doctor, Appointment)
- ✅ 1 REST microservice (Medical Record)
- ✅ Inter-service validation & communication
- ✅ Docker containerization & orchestration
- ✅ API Gateway for request routing
- ✅ Cloud database (MongoDB Atlas)
- ✅ Frontend integration with GraphQL & REST