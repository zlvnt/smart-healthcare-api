// API Gateway Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Global data storage
let patients = [];
let doctors = [];
let appointments = [];
let records = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    loadPatients();
});

// ===== TAB NAVIGATION =====
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load data for the active tab
    if (tabName === 'patients') loadPatients();
    if (tabName === 'doctors') loadDoctors();
    if (tabName === 'appointments') loadAppointments();
    if (tabName === 'records') loadMedicalRecords();
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// ===== PATIENTS =====
async function loadPatients() {
    const loading = document.getElementById('patients-loading');
    const table = document.getElementById('patients-table');
    const tbody = document.getElementById('patients-tbody');

    loading.classList.remove('hidden');
    table.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/patients`);
        const data = await response.json();

        if (data.success) {
            patients = data.data;
            tbody.innerHTML = '';

            patients.forEach(patient => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${patient.name}</td>
                    <td>${patient.birth_date}</td>
                    <td>${patient.gender}</td>
                    <td>${patient.phone}</td>
                    <td>${patient.blood_type || '-'}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deletePatient('${patient._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            loading.classList.add('hidden');
            table.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        loading.textContent = 'Error loading patients';
        showNotification('Error loading patients', 'error');
    }
}

function showAddPatientForm() {
    document.getElementById('add-patient-form').classList.remove('hidden');
}

function hideAddPatientForm() {
    document.getElementById('add-patient-form').classList.add('hidden');
    document.querySelector('#add-patient-form form').reset();
}

async function addPatient(event) {
    event.preventDefault();

    const patientData = {
        name: document.getElementById('patient-name').value,
        birth_date: document.getElementById('patient-birthdate').value,
        gender: document.getElementById('patient-gender').value,
        phone: document.getElementById('patient-phone').value,
        address: document.getElementById('patient-address').value,
        blood_type: document.getElementById('patient-bloodtype').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Patient added successfully!');
            hideAddPatientForm();
            loadPatients();
        } else {
            showNotification(data.message || 'Error adding patient', 'error');
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        showNotification('Error adding patient', 'error');
    }
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Patient deleted successfully!');
            loadPatients();
        } else {
            showNotification(data.message || 'Error deleting patient', 'error');
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
        showNotification('Error deleting patient', 'error');
    }
}

// ===== DOCTORS =====
async function loadDoctors() {
    const loading = document.getElementById('doctors-loading');
    const table = document.getElementById('doctors-table');
    const tbody = document.getElementById('doctors-tbody');

    loading.classList.remove('hidden');
    table.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/doctors`);
        const data = await response.json();

        if (data.success) {
            doctors = data.data;
            tbody.innerHTML = '';

            doctors.forEach(doctor => {
                const row = document.createElement('tr');
                const scheduleDisplay = doctor.schedule && doctor.schedule.length > 0
                    ? doctor.schedule.join('<br>')
                    : '-';

                row.innerHTML = `
                    <td>${doctor.name}</td>
                    <td>${doctor.specialization}</td>
                    <td>${doctor.phone}</td>
                    <td>${scheduleDisplay}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteDoctor('${doctor._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            loading.classList.add('hidden');
            table.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
        loading.textContent = 'Error loading doctors';
        showNotification('Error loading doctors', 'error');
    }
}

function showAddDoctorForm() {
    document.getElementById('add-doctor-form').classList.remove('hidden');
}

function hideAddDoctorForm() {
    document.getElementById('add-doctor-form').classList.add('hidden');
    document.querySelector('#add-doctor-form form').reset();
}

async function addDoctor(event) {
    event.preventDefault();

    const scheduleText = document.getElementById('doctor-schedule').value;
    const scheduleArray = scheduleText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const doctorData = {
        name: document.getElementById('doctor-name').value,
        specialization: document.getElementById('doctor-specialization').value,
        phone: document.getElementById('doctor-phone').value,
        schedule: scheduleArray
    };

    try {
        const response = await fetch(`${API_BASE_URL}/doctors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Doctor added successfully!');
            hideAddDoctorForm();
            loadDoctors();
        } else {
            showNotification(data.message || 'Error adding doctor', 'error');
        }
    } catch (error) {
        console.error('Error adding doctor:', error);
        showNotification('Error adding doctor', 'error');
    }
}

async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Doctor deleted successfully!');
            loadDoctors();
        } else {
            showNotification(data.message || 'Error deleting doctor', 'error');
        }
    } catch (error) {
        console.error('Error deleting doctor:', error);
        showNotification('Error deleting doctor', 'error');
    }
}

// ===== APPOINTMENTS =====
async function loadAppointments() {
    const loading = document.getElementById('appointments-loading');
    const table = document.getElementById('appointments-table');
    const tbody = document.getElementById('appointments-tbody');

    loading.classList.remove('hidden');
    table.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`);
        const data = await response.json();

        if (data.success) {
            appointments = data.data;
            tbody.innerHTML = '';

            appointments.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appointment.patient_id.substring(0, 8)}...</td>
                    <td>${appointment.doctor_id.substring(0, 8)}...</td>
                    <td>${appointment.appointment_date}</td>
                    <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                    <td>${appointment.complaint || '-'}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteAppointment('${appointment._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            loading.classList.add('hidden');
            table.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        loading.textContent = 'Error loading appointments';
        showNotification('Error loading appointments', 'error');
    }
}

async function showAddAppointmentForm() {
    document.getElementById('add-appointment-form').classList.remove('hidden');

    // Load patients and doctors for dropdowns
    await loadPatientsDropdown('appointment-patient');
    await loadDoctorsDropdown('appointment-doctor');
}

function hideAddAppointmentForm() {
    document.getElementById('add-appointment-form').classList.add('hidden');
    document.querySelector('#add-appointment-form form').reset();
}

async function loadPatientsDropdown(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/patients`);
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Patient</option>';

            data.data.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient._id;
                option.textContent = `${patient.name} - ${patient.phone}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading patients dropdown:', error);
    }
}

async function loadDoctorsDropdown(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors`);
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Doctor</option>';

            data.data.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor._id;
                option.textContent = `${doctor.name} - ${doctor.specialization}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading doctors dropdown:', error);
    }
}

async function addAppointment(event) {
    event.preventDefault();

    const datetimeValue = document.getElementById('appointment-datetime').value;
    // Convert from "2024-11-15T10:00" to "2024-11-15 10:00"
    const formattedDate = datetimeValue.replace('T', ' ');

    const appointmentData = {
        patient_id: document.getElementById('appointment-patient').value,
        doctor_id: document.getElementById('appointment-doctor').value,
        appointment_date: formattedDate,
        complaint: document.getElementById('appointment-complaint').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Appointment created successfully!');
            hideAddAppointmentForm();
            loadAppointments();
        } else {
            showNotification(data.message || 'Error creating appointment', 'error');
        }
    } catch (error) {
        console.error('Error creating appointment:', error);
        showNotification('Error creating appointment', 'error');
    }
}

async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Appointment deleted successfully!');
            loadAppointments();
        } else {
            showNotification(data.message || 'Error deleting appointment', 'error');
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
        showNotification('Error deleting appointment', 'error');
    }
}

// ===== MEDICAL RECORDS =====
async function loadMedicalRecords() {
    const loading = document.getElementById('records-loading');
    const table = document.getElementById('records-table');
    const tbody = document.getElementById('records-tbody');

    loading.classList.remove('hidden');
    table.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/records`);
        const data = await response.json();

        if (data.success) {
            records = data.data;
            tbody.innerHTML = '';

            records.forEach(record => {
                const row = document.createElement('tr');
                const recordDate = new Date(record.date).toLocaleDateString();

                row.innerHTML = `
                    <td>${record.patient_id.substring(0, 8)}...</td>
                    <td>${record.doctor_id.substring(0, 8)}...</td>
                    <td>${record.diagnosis}</td>
                    <td>${record.prescription || '-'}</td>
                    <td>${recordDate}</td>
                    <td>
                        <button class="btn btn-success" onclick="viewRecord('${record._id}')">View</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            loading.classList.add('hidden');
            table.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading medical records:', error);
        loading.textContent = 'Error loading medical records';
        showNotification('Error loading medical records', 'error');
    }
}

async function showAddRecordForm() {
    document.getElementById('add-record-form').classList.remove('hidden');

    // Load patients, doctors, and appointments for dropdowns
    await loadPatientsDropdown('record-patient');
    await loadDoctorsDropdown('record-doctor');
    await loadAppointmentsDropdown('record-appointment');
}

function hideAddRecordForm() {
    document.getElementById('add-record-form').classList.add('hidden');
    document.querySelector('#add-record-form form').reset();
}

async function loadAppointmentsDropdown(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments`);
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Appointment (Optional)</option>';

            data.data.forEach(appointment => {
                const option = document.createElement('option');
                option.value = appointment._id;
                option.textContent = `${appointment.appointment_date} - ${appointment.status}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading appointments dropdown:', error);
    }
}

async function addMedicalRecord(event) {
    event.preventDefault();

    const recordData = {
        patient_id: document.getElementById('record-patient').value,
        doctor_id: document.getElementById('record-doctor').value,
        appointment_id: document.getElementById('record-appointment').value || undefined,
        diagnosis: document.getElementById('record-diagnosis').value,
        prescription: document.getElementById('record-prescription').value,
        notes: document.getElementById('record-notes').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Medical record added successfully!');
            hideAddRecordForm();
            loadMedicalRecords();
        } else {
            showNotification(data.message || 'Error adding medical record', 'error');
        }
    } catch (error) {
        console.error('Error adding medical record:', error);
        showNotification('Error adding medical record', 'error');
    }
}

function viewRecord(id) {
    const record = records.find(r => r._id === id);
    if (record) {
        alert(`Medical Record Details:\n\n` +
              `Patient ID: ${record.patient_id}\n` +
              `Doctor ID: ${record.doctor_id}\n` +
              `Diagnosis: ${record.diagnosis}\n` +
              `Prescription: ${record.prescription || 'N/A'}\n` +
              `Notes: ${record.notes || 'N/A'}\n` +
              `Date: ${new Date(record.date).toLocaleString()}`);
    }
}
