# Smart Healthcare System - API Documentation

## Services Overview

| Service | Port | Protocol | Endpoint |
|---------|------|----------|----------|
| Patient Service | 3001 | GraphQL | http://localhost:3001/graphql |
| Doctor Service | 3002 | GraphQL | http://localhost:3002/graphql |
| Appointment Service | 3003 | GraphQL | http://localhost:3003/graphql |
| Medical Record Service | 3004 | REST | http://localhost:3004 |
| API Gateway | 3000 | Mixed | http://localhost:3000 |

---

## Patient Service (3001) - GraphQL

### Query Examples

**Get All Patients:**
```graphql
query {
  patients {
    id
    nama
    phone
    gender
  }
}
```

**Get Patient by ID:**
```graphql
query {
  patient(id: "507f1f77bcf86cd799439011") {
    id
    nama
    phone
    birth_date
  }
}
```

**Get Patient by Name:**
```graphql
query {
  patientByName(name: "Budi") {
    id
    nama
    phone
  }
}
```

### Mutation Examples

**Create Patient:**
```graphql
mutation {
  createPatient(
    nama: "John Doe"
    birth_date: "1990-05-15"
    gender: "Male"
    phone: "08987654321"
  ) {
    id
    nama
  }
}
```

**Update Patient:**
```graphql
mutation {
  updatePatient(
    id: "507f1f77bcf86cd799439011"
    phone: "08111111111"
  ) {
    id
    nama
    phone
  }
}
```

**Delete Patient:**
```graphql
mutation {
  deletePatient(id: "507f1f77bcf86cd799439011") {
    success
    message
  }
}
```

---

## Doctor Service (3002) - GraphQL

### Query Examples

**Get All Doctors:**
```graphql
query {
  doctors {
    id
    nama
    specialization
    phone
  }
}
```

**Get Doctor by ID:**
```graphql
query {
  doctor(id: "507f1f77bcf86cd799439020") {
    id
    nama
    specialization
  }
}
```

**Get Doctors by Specialization:**
```graphql
query {
  doctorBySpecialization(specialization: "Cardiologist") {
    id
    nama
    phone
  }
}
```

### Mutation Examples

**Create Doctor:**
```graphql
mutation {
  createDoctor(
    nama: "Dr. Siti Nurhaliza"
    specialization: "Cardiologist"
    phone: "08555555555"
  ) {
    id
    nama
  }
}
```

**Update Doctor:**
```graphql
mutation {
  updateDoctor(
    id: "507f1f77bcf86cd799439020"
    phone: "08666666666"
  ) {
    id
    nama
    phone
  }
}
```

**Delete Doctor:**
```graphql
mutation {
  deleteDoctor(id: "507f1f77bcf86cd799439020") {
    success
    message
  }
}
```

---

## Appointment Service (3003) - GraphQL

### Query Examples

**Get All Appointments:**
```graphql
query {
  appointments {
    id
    patient_id
    doctor_id
    appointment_date
    status
  }
}
```

**Get Appointment by ID:**
```graphql
query {
  appointment(id: "507f1f77bcf86cd799439030") {
    id
    appointment_date
    status
  }
}
```

**Get Appointments by Patient:**
```graphql
query {
  appointmentByPatient(patientId: "507f1f77bcf86cd799439011") {
    id
    appointment_date
    doctor_id
  }
}
```

**Get Appointments by Doctor:**
```graphql
query {
  appointmentByDoctor(doctorId: "507f1f77bcf86cd799439020") {
    id
    appointment_date
    patient_id
  }
}
```

### Mutation Examples

**Create Appointment** (validates patient & doctor exist):
```graphql
mutation {
  createAppointment(
    patient_id: "507f1f77bcf86cd799439011"
    doctor_id: "507f1f77bcf86cd799439020"
    appointment_date: "2024-12-20T10:00:00Z"
    complaint: "Regular checkup"
  ) {
    id
    appointment_date
    status
  }
}
```

**Update Appointment Status:**
```graphql
mutation {
  updateAppointmentStatus(
    id: "507f1f77bcf86cd799439030"
    status: "confirmed"
  ) {
    id
    status
  }
}
```

Valid status values: `pending`, `confirmed`, `completed`, `cancelled`

**Delete Appointment:**
```graphql
mutation {
  deleteAppointment(id: "507f1f77bcf86cd799439030") {
    success
    message
  }
}
```

---

## Medical Record Service (3004) - REST API

### Endpoints

**Get All Records:**
```
GET http://localhost:3004/medical-records
```

**Get Record by ID:**
```
GET http://localhost:3004/medical-records/:id
```

**Create Record:**
```
POST http://localhost:3004/medical-records
Body: {
  "patient_id": "507f1f77bcf86cd799439011",
  "diagnosis": "Hypertension",
  "treatment": "Blood pressure management",
  "prescription": "Amlodipine 5mg daily"
}
```

**Update Record:**
```
PUT http://localhost:3004/medical-records/:id
Body: { fields to update }
```

**Delete Record:**
```
DELETE http://localhost:3004/medical-records/:id
```

---

## Sample Response

### Success Response (GraphQL)
```json
{
  "data": {
    "createPatient": {
      "id": "507f1f77bcf86cd799439012",
      "nama": "John Doe"
    }
  }
}
```

### Error Response (GraphQL)
```json
{
  "errors": [
    {
      "message": "Patient not found",
      "status": 400
    }
  ]
}
```

---

## Testing via cURL

**Query Patient:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ patients { id nama } }"}'
```

**Create Patient:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createPatient(nama: \"Test\", birth_date: \"2000-01-01\", gender: \"Male\") { id nama } }"}'
```

---

## Testing via GraphQL Playground

1. Open http://localhost:PORT/graphql in browser
2. Write query/mutation
3. Press Ctrl+Enter or click Play button
4. View response

---

## API Gateway Forwarding

- `/graphql/patients` → Patient Service GraphQL
- `/graphql/doctors` → Doctor Service GraphQL
- `/graphql/appointments` → Appointment Service GraphQL
- `/api/patients` → Patient Service REST
- `/api/doctors` → Doctor Service REST
- `/api/appointments` → Appointment Service REST
- `/api/records` → Medical Record Service REST
