# Project Requirement — UTS

**Mata Kuliah:** Enterprise Application Integration / Web Service Development  
**Tema:** Pengembangan Layanan Terhubung melalui API dengan Dokumentasi Swagger/Postman

---

## 1. Latar Belakang

Di era digital saat ini, banyak aplikasi tidak lagi berdiri sendiri, melainkan saling terhubung melalui Application Programming Interface (API).

API memungkinkan sistem berbeda untuk bertukar data dan fungsi, seperti sistem pembayaran, layanan e-commerce, transportasi online, hingga aplikasi kesehatan digital.

Untuk memastikan komunikasi antar sistem berjalan baik dan terdokumentasi dengan jelas, digunakan Postman/Swagger (OpenAPI) sebagai alat dokumentasi API.

---

## 2. Tujuan Proyek

Mahasiswa diharapkan mampu:

1. **Membangun minimal dua/lebih layanan (services)** yang dapat berkomunikasi melalui API (Masing-masing berperan sebagai provider, dan Consumer)

2. **Service as Provider:** Penyedia API
   - Contohnya: user-service
   - Menyediakan endpoint seperti `/users`, `/users/:id`, dsb.
   - Format data: JSON
   - Komunikasi via HTTP (GET, POST, PUT, DELETE)

3. **Consumer:** Untuk consumer, cukup menggunakan frontend sederhana (bisa menggunakan React, Vue, atau HTML + JS biasa).
   - Frontend ini nanti:
     - Memanggil API Gateway
     - Menampilkan data dari dua layanan
     - Misalnya: Halaman "Users" ambil data dari REST API Users

4. **Komunikasi melalui 1 API Gateway**

5. **Mengimplementasikan REST API** dengan format JSON

6. **Membuat dokumentasi API** menggunakan Swagger / OpenAPI Specification

7. **Memahami konsep service integration** antar sistem secara sederhana

---

## 3. Deskripsi Proyek

Mahasiswa diminta membuat **dua atau lebih layanan** yang saling berkomunikasi menggunakan API.

Setiap layanan harus memiliki **endpoint sendiri** dan saling bertukar data menggunakan **protokol HTTP**.

Dokumentasi API wajib dibuat dan dapat diakses melalui **Swagger UI**.

---

## 4. Contoh Tema/Topik Pilihan (pilih salah satu atau kembangkan)

| No | Topik | Deskripsi Singkat |
|----|-------|-------------------|
| 1 | **Digital Payment Service (E-Wallet)** | Layanan pengguna dan transaksi saling berkomunikasi; misalnya user-service dan payment-service. |
| 2 | **Smart Healthcare System** | Layanan pasien dan layanan rekam medis terhubung via API untuk pendaftaran dan pengecekan riwayat. |
| 3 | **E-Commerce Microservice** | Layanan produk, order, dan user saling terhubung; order-service memanggil product-service melalui API. |
| 4 | **Online Learning Platform (EduConnect)** | Layanan siswa, kursus, dan nilai saling berkomunikasi (misal: course-service dan student-service). |
| 5 | **Public Transportation Tracker** | Layanan kendaraan dan jadwal terhubung; misal bus-service dan route-service. |
| 6 | **Food Delivery System** | Layanan restoran, pelanggan, dan pesanan saling terhubung menggunakan REST API. |

---

## 5. Spesifikasi Teknis Minimal

| Komponen | Keterangan |
|----------|------------|
| **Arsitektur** | Minimal 2 layanan REST API yang saling berkomunikasi (misal: User Service ↔ Order Service) |
| **Format Data** | JSON |
| **Dokumentasi** | Menggunakan Swagger / OpenAPI |
| **Framework Backend** | Boleh menggunakan Node.js (Express), Flask, Spring Boot, Laravel, atau lainnya |
| **Database** | MySQL / MongoDB / PostgreSQL (pilih salah satu) |
| **Testing Tools** | Postman atau Swagger UI |
| **Integrasi API** | Salah satu service melakukan API call ke service lain |

---

## 6. Output yang Diharapkan

1. Aplikasi API berjalan dan bisa saling berkomunikasi
2. Dokumentasi Swagger lengkap dan bisa diakses di endpoint `/api-docs`
3. File `.json` atau `.yaml` dari OpenAPI Specification disertakan

---

## 7. Waktu Pengerjaan

- Diberikan selama **2 minggu**
- Presentasi & demo sistem dilakukan saat **minggu UTS**

---

## 8. Kriteria Penilaian

| Komponen | Bobot |
|----------|-------|
| Arsitektur layanan dan komunikasi API | 30% |
| Fungsionalitas sistem (berjalan dengan baik) | 25% |
| Dokumentasi API (Swagger) | 20% |
| Presentasi & pemahaman konsep | 25% |

---

## 9. Rubrikasi Penilaian

### 1. Arsitektur Layanan dan Komunikasi API (30%)

| Level | Kriteria | Rentang Nilai |
|-------|----------|---------------|
| **Low** | Hanya terdapat 2 layanan sederhana, belum ada komunikasi antar layanan atau API masih bersifat statis. | < 75 |
| **Medium** | Terdapat dua layanan yang saling berkomunikasi melalui API, tetapi masih ada kendala dalam alur integrasi atau struktur arsitektur belum sepenuhnya jelas. | 75 – 80 |
| **High** | Arsitektur sistem terstruktur dan jelas, terdapat lebih dari dua layanan saling berkomunikasi secara dinamis melalui API (GET, POST, PUT, DELETE) dengan integrasi lancar. | 81 – 100 |

### 2. Fungsionalitas Sistem (Berjalan dengan Baik) (25%)

| Level | Kriteria | Rentang Nilai |
|-------|----------|---------------|
| **Low** | Aplikasi belum berjalan penuh; hanya sebagian fitur yang bisa digunakan atau sering error. | < 75 |
| **Medium** | Sebagian besar fitur dapat dijalankan dengan baik, meski masih terdapat bug minor. | 75 – 80 |
| **High** | Semua fitur berfungsi dengan baik, sistem stabil, dan respons cepat tanpa error saat pengujian API. | 81 – 100 |

### 3. Dokumentasi API (Swagger) (20%)

| Level | Kriteria | Rentang Nilai |
|-------|----------|---------------|
| **Low** | Dokumentasi Swagger belum lengkap, hanya menampilkan sebagian endpoint tanpa deskripsi parameter dan respons. | < 75 |
| **Medium** | Dokumentasi Swagger menampilkan sebagian besar endpoint, sudah ada contoh input/output tapi belum konsisten. | 75 – 80 |
| **High** | Dokumentasi Swagger lengkap dan rapi, mencakup semua endpoint, parameter, contoh request/response, serta mudah dipahami oleh pengguna. | 81 – 100 |

### 4. Presentasi & Pemahaman Konsep (25%)

| Level | Kriteria | Rentang Nilai |
|-------|----------|---------------|
| **Low** | Kurang mampu menjelaskan konsep integrasi API dan Swagger; penyampaian tidak runtut. | < 75 |
| **Medium** | Dapat menjelaskan sebagian konsep dan alur kerja API, namun masih kurang mendalam atau ada bagian yang belum dikuasai. | 75 – 80 |
| **High** | Menjelaskan konsep API, arsitektur layanan, dan Swagger dengan jelas, runtut, serta mampu menjawab pertanyaan dengan baik. | 81 – 100 |

---

## 10. Konversi Nilai

| Level | Keterangan | Rentang Nilai |
|-------|------------|---------------|
| **Low** | Implementasi dasar, masih banyak kekurangan. | < 75 |
| **Medium** | Cukup baik, memenuhi sebagian besar kriteria. | 75 – 80 |
| **High** | Lengkap, rapi, dan menunjukkan pemahaman kuat. | 81 – 100 |