/* ------------------------------
  Smart Healthcare — Frontend JS
  Pure JS, connects to GraphQL API
-------------------------------*/
const API_BASE_URL = 'http://localhost:3000/api'; // REST endpoints
const GRAPHQL_BASE_URL = 'http://localhost:3000/graphql'; // GraphQL endpoints

/* GraphQL Query/Mutation Helpers */
async function graphqlQuery(endpoint, query, variables = {}) {
  try {
    const response = await fetch(`${GRAPHQL_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL Error');
    }

    return result.data;
  } catch (error) {
    console.error(`GraphQL Error (${endpoint}):`, error);
    throw error;
  }
}

// Cached DOM
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const noti = document.getElementById('notification');

// Tables & loading
const patientsTbody = document.getElementById('patients-tbody');
const doctorsTbody = document.getElementById('doctors-tbody');
const appointmentsTbody = document.getElementById('appointments-tbody');
const recordsTbody = document.getElementById('records-tbody');

const patientsLoading = document.getElementById('patients-loading');
const doctorsLoading = document.getElementById('doctors-loading');
const appointmentsLoading = document.getElementById('appointments-loading');
const recordsLoading = document.getElementById('records-loading');

// Cards
const cardPatients = document.getElementById('cardPatients');
const cardDoctors = document.getElementById('cardDoctors');
const cardAppointments = document.getElementById('cardAppointments');

// Modal forms
const modalPatient = document.getElementById('modalPatient');
const modalDoctor = document.getElementById('modalDoctor');
const modalAppointment = document.getElementById('modalAppointment');
const modalRecord = document.getElementById('modalRecord');

const formPatient = document.getElementById('formPatient');
const formDoctor = document.getElementById('formDoctor');
const formAppointment = document.getElementById('formAppointment');
const formRecord = document.getElementById('formRecord');

// Form Hidden IDs
const patientIdInput = document.getElementById('patient-id');
const doctorIdInput = document.getElementById('doctor-id');
const appointmentIdInput = document.getElementById('appointment-id');

// Dropdowns inside modals
const appointmentPatientSelect = document.getElementById('appointment-patient');
const appointmentDoctorSelect = document.getElementById('appointment-doctor');
const recordPatientSelect = document.getElementById('record-patient');
const recordDoctorSelect = document.getElementById('record-doctor');
const recordAppointmentSelect = document.getElementById('record-appointment');
// Tambahkan untuk Status Appointment
const appointmentStatusSelect = document.getElementById('appointment-status');

// Global state cache
let patients = [];
let doctors = [];
let appointments = [];
let records = [];

/* ------------------------------
  Helper utilities
-------------------------------*/
function showNotification(message, type = 'success') {
  noti.className = 'notification';
  if (type === 'error') noti.classList.add('error');
  noti.textContent = message;
  noti.classList.remove('hidden');
  setTimeout(() => noti.classList.add('hidden'), 3500);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  
  const pad = (n) => n.toString().padStart(2, '0');
  
  try {
    const isDateOnly = dateStr.length === 10 && dateStr.includes('-'); // YYYY-MM-DD
    if (isDateOnly) return dateStr; 
    
    // Format ke YYYY-MM-DDTHH:MM
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return d.toLocaleString(); // Fallback
  }
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString();
}

function closeModalById(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('show');
}

/* ------------------------------
  NAV & SECTION SWITCH
-------------------------------*/
navItems.forEach(btn => btn.addEventListener('click', () => {
  navItems.forEach(n => n.classList.remove('active'));
  btn.classList.add('active');

  const sectionId = btn.dataset.section;
  sections.forEach(s => s.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');

  if (sectionId === 'patients') loadPatients();
  if (sectionId === 'doctors') loadDoctors();
  if (sectionId === 'appointments') loadAppointments();
  if (sectionId === 'records') loadMedicalRecords();
}));

/* ------------------------------
  MODAL MANAGEMENT (open/close/setup for Edit)
-------------------------------*/
function openModal(modalEl, isEdit = false, title = 'Add') { 
  if (modalEl === modalPatient) document.getElementById('modalPatientTitle').textContent = isEdit ? 'Edit Patient' : 'Add Patient';
  if (modalEl === modalDoctor) document.getElementById('modalDoctorTitle').textContent = isEdit ? 'Edit Doctor' : 'Add Doctor';
  if (modalEl === modalAppointment) document.getElementById('modalAppointmentTitle').textContent = isEdit ? 'Edit Appointment' : 'Create Appointment';
  modalEl.classList.add('show'); 
}

function closeModal(modalEl) { 
  modalEl.classList.remove('show'); 
}

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const id = btn.dataset.close;
    closeModalById(id);
  });
});

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (ev) => {
    if (ev.target === m) m.classList.remove('show');
  });
});

function setupEditPatientModal(patient) {
  formPatient.reset();
  patientIdInput.value = patient._id;
  document.getElementById('patient-name').value = patient.name || '';
  document.getElementById('patient-birthdate').value = patient.birth_date ? patient.birth_date.split('T')[0] : '';
  document.getElementById('patient-gender').value = patient.gender || '';
  document.getElementById('patient-phone').value = patient.phone || '';
  document.getElementById('patient-address').value = patient.address || '';
  document.getElementById('patient-bloodtype').value = patient.blood_type || '';
  openModal(modalPatient, true);
}

function setupEditDoctorModal(doctor) {
  formDoctor.reset();
  doctorIdInput.value = doctor._id;
  document.getElementById('doctor-name').value = doctor.name || '';
  document.getElementById('doctor-specialization').value = doctor.specialization || '';
  document.getElementById('doctor-phone').value = doctor.phone || '';
  document.getElementById('doctor-schedule').value = Array.isArray(doctor.schedule) ? doctor.schedule.join('\n') : (doctor.schedule || '');
  openModal(modalDoctor, true);
}

async function setupEditAppointmentModal(appointment) {
  await populateDropdowns(); 
  formAppointment.reset();
  appointmentIdInput.value = appointment._id;
  appointmentPatientSelect.value = appointment.patient_id || '';
  appointmentDoctorSelect.value = appointment.doctor_id || '';
  appointmentStatusSelect.value = appointment.status || 'pending';
  document.getElementById('appointment-datetime').value = appointment.appointment_date ? formatDate(appointment.appointment_date) : '';
  document.getElementById('appointment-complaint').value = appointment.complaint || '';
  openModal(modalAppointment, true);
}

/* ------------------------------
  LOAD & RENDER FUNCTIONS
-------------------------------*/
async function loadOverviewCounts() {
  try {
    const [pResp, dResp, aResp] = await Promise.all([
      fetch(`${API_BASE_URL}/patients`),
      fetch(`${API_BASE_URL}/doctors`),
      fetch(`${API_BASE_URL}/appointments/today`).catch(()=>null) 
    ]);

    const pData = await pResp.json();
    const dData = await dResp.json();
    let aData = null;
    if (aResp && aResp.ok) aData = await aResp.json();

    patients = (pData && pData.success) ? pData.data : [];
    doctors = (dData && dData.success) ? dData.data : [];

    let todayCount = 0;
    try {
      if (aData && aData.success) {
        todayCount = Array.isArray(aData.data) ? aData.data.length : 0;
      } else {
        const aAllResp = await fetch(`${API_BASE_URL}/appointments`);
        const aAllData = await aAllResp.json();
        if (aAllData && aAllData.success) {
          appointments = aAllData.data;
          const today = new Date().toDateString();
          todayCount = appointments.filter(ap => new Date(ap.appointment_date).toDateString() === today).length;
        }
      }
    } catch(e) { todayCount = 0; }

    cardPatients.textContent = patients.length;
    cardDoctors.textContent = doctors.length;
    cardAppointments.textContent = todayCount;
  } catch (err) {
    console.error('Error loading overview:', err);
    showNotification('Failed loading overview', 'error');
  }
}

/* ---------- PATIENTS ---------- */
async function loadPatients() {
  patientsLoading.classList.remove('hidden');
  document.getElementById('patients-table').classList.add('hidden');

  try {
    const query = `{
      patients {
        id
        name
        birth_date
        gender
        phone
        blood_type
        address
      }
    }`;

    const data = await graphqlQuery('patients', query);
    if (data && data.patients) {
      patients = data.patients.map(p => ({
        ...p,
        _id: p.id
      }));
      renderPatientsTable();
    } else {
      patientsTbody.innerHTML = `<tr><td colspan="6">No data</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    showNotification('Error loading patients', 'error');
    patientsTbody.innerHTML = `<tr><td colspan="6">Error</td></tr>`;
  } finally {
    patientsLoading.classList.add('hidden');
    document.getElementById('patients-table').classList.remove('hidden');
    loadOverviewCounts();
  }
}

function renderPatientsTable() {
  patientsTbody.innerHTML = '';
  if (!patients || patients.length === 0) {
    patientsTbody.innerHTML = `<tr><td colspan="6">No patients found</td></tr>`;
    return;
  }
  patients.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.birth_date ? p.birth_date.split('T')[0] : '-'}</td>
      <td>${p.gender || '-'}</td>
      <td>${p.phone || '-'}</td>
      <td>${p.blood_type || '-'}</td>
      <td>
        <button class="small-btn edit-btn" data-edit-patient="${p._id}">Edit</button>
        <button class="small-btn delete-btn" data-delete-patient="${p._id}">Delete</button>
      </td>
    `;
    patientsTbody.appendChild(tr);
  });
}

/* ---------- DOCTORS ---------- */
async function loadDoctors() {
  doctorsLoading.classList.remove('hidden');
  document.getElementById('doctors-table').classList.add('hidden');

  try {
    const query = `{
      doctors {
        id
        name
        specialization
        phone
        schedule
      }
    }`;

    const data = await graphqlQuery('doctors', query);
    if (data && data.doctors) {
      doctors = data.doctors.map(d => ({
        ...d,
        _id: d.id
      }));
      renderDoctorsTable();
    } else {
      doctorsTbody.innerHTML = `<tr><td colspan="5">No data</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    showNotification('Error loading doctors', 'error');
    doctorsTbody.innerHTML = `<tr><td colspan="5">Error</td></tr>`;
  } finally {
    doctorsLoading.classList.add('hidden');
    document.getElementById('doctors-table').classList.remove('hidden');
    loadOverviewCounts();
  }
}

function renderDoctorsTable() {
  doctorsTbody.innerHTML = '';
  if (!doctors || doctors.length === 0) {
    doctorsTbody.innerHTML = `<tr><td colspan="5">No doctors found</td></tr>`;
    return;
  }
  doctors.forEach(d => {
    const schedule = Array.isArray(d.schedule) ? d.schedule.join('<br>') : (d.schedule || '-');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.name}</td>
      <td>${d.specialization}</td>
      <td>${d.phone}</td>
      <td>${schedule}</td>
      <td>
        <button class="small-btn edit-btn" data-edit-doctor="${d._id}">Edit</button>
        <button class="small-btn delete-btn" data-delete-doctor="${d._id}">Delete</button>
      </td>
    `;
    doctorsTbody.appendChild(tr);
  });
}

/* ---------- APPOINTMENTS ---------- */
async function loadAppointments() {
  appointmentsLoading.classList.remove('hidden');
  document.getElementById('appointments-table').classList.add('hidden');

  try {
    const query = `{
      appointments {
        id
        patient_id
        doctor_id
        appointment_date
        status
        complaint
      }
    }`;

    const data = await graphqlQuery('appointments', query);
    if (data && data.appointments) {
      appointments = data.appointments.map(a => ({
        ...a,
        _id: a.id
      }));
      renderAppointmentsTable();
    } else {
      appointmentsTbody.innerHTML = `<tr><td colspan="6">No data</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    showNotification('Error loading appointments', 'error');
    appointmentsTbody.innerHTML = `<tr><td colspan="6">Error</td></tr>`;
  } finally {
    appointmentsLoading.classList.add('hidden');
    document.getElementById('appointments-table').classList.remove('hidden');
    loadOverviewCounts();
  }
}

function renderAppointmentsTable() {
  appointmentsTbody.innerHTML = '';
  if (!appointments || appointments.length === 0) {
    appointmentsTbody.innerHTML = `<tr><td colspan="6">No appointments found</td></tr>`;
    return;
  }
  appointments.forEach(a => {
    const pName = resolveNameFromId(patients, a.patient_id) || a.patient_id;
    const dName = resolveNameFromId(doctors, a.doctor_id) || a.doctor_id;
    const statusClass = `status-${(a.status||'pending').toLowerCase()}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pName}</td>
      <td>${dName}</td>
      <td>${formatDisplayDate(a.appointment_date)}</td>
      <td><span class="badge ${statusClass}">${a.status || 'pending'}</span></td>
      <td>${a.complaint || '-'}</td>
      <td>
        <button class="small-btn edit-btn" data-edit-appointment="${a._id}">Edit</button>
        <button class="small-btn delete-btn" data-delete-appointment="${a._id}">Delete</button>
      </td>
    `;
    appointmentsTbody.appendChild(tr);
  });
}

/* ---------- RECORDS ---------- */
async function loadMedicalRecords() {
  recordsLoading.classList.remove('hidden');
  document.getElementById('records-table').classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE_URL}/records`);
    const data = await res.json();
    if (data.success) {
      records = data.data;
      renderRecordsTable();
    } else {
      recordsTbody.innerHTML = `<tr><td colspan="6">No data</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    showNotification('Error loading records', 'error');
    recordsTbody.innerHTML = `<tr><td colspan="6">Error</td></tr>`;
  } finally {
    recordsLoading.classList.add('hidden');
    document.getElementById('records-table').classList.remove('hidden');
  }
}

function renderRecordsTable() {
  recordsTbody.innerHTML = '';
  if (!records || records.length === 0) {
    recordsTbody.innerHTML = `<tr><td colspan="6">No records</td></tr>`;
    return;
  }
  records.forEach(r => {
    const pName = resolveNameFromId(patients, r.patient_id) || r.patient_id;
    const dName = resolveNameFromId(doctors, r.doctor_id) || r.doctor_id;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pName}</td>
      <td>${dName}</td>
      <td>${r.diagnosis}</td>
      <td>${r.prescription || '-'}</td>
      <td>${new Date(r.date || r.createdAt || Date.now()).toLocaleDateString()}</td>
      <td>
        <button class="small-btn" data-view-record="${r._id}">View</button>
      </td>
    `;
    recordsTbody.appendChild(tr);
  });
}

/* ------------------------------
  Utility to map name from id (for display)
-------------------------------*/
function resolveNameFromId(list, id) {
  if (!Array.isArray(list)) return null;
  const found = list.find(x => x._id === id);
  return found ? (found.name || found.fullname || found.title) : null;
}

/* ------------------------------
  Event delegation for Edit/Delete/View buttons
-------------------------------*/
document.addEventListener('click', async (ev) => {
  // === EDIT ===
  if (ev.target.matches('[data-edit-patient]')) {
    const id = ev.target.dataset.editPatient;
    const p = patients.find(x => x._id === id);
    if (p) setupEditPatientModal(p);
  }
  if (ev.target.matches('[data-edit-doctor]')) {
    const id = ev.target.dataset.editDoctor;
    const d = doctors.find(x => x._id === id);
    if (d) setupEditDoctorModal(d);
  }
  if (ev.target.matches('[data-edit-appointment]')) {
    const id = ev.target.dataset.editAppointment;
    const a = appointments.find(x => x._id === id);
    if (a) setupEditAppointmentModal(a);
  }

  // === DELETE ===
  if (ev.target.matches('[data-delete-patient]')) {
    const id = ev.target.dataset.deletePatient;
    if (!confirm('Delete this patient?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) showNotification('Patient deleted');
      else showNotification(data.message || 'Failed to delete', 'error');
      loadPatients();
      loadOverviewCounts();
    } catch (err) { showNotification('Error deleting patient', 'error'); }
  }

  if (ev.target.matches('[data-delete-doctor]')) {
    const id = ev.target.dataset.deleteDoctor;
    if (!confirm('Delete this doctor?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) showNotification('Doctor deleted');
      else showNotification(data.message || 'Failed to delete', 'error');
      loadDoctors();
      loadOverviewCounts();
    } catch (err) { showNotification('Error deleting doctor', 'error'); }
  }

  if (ev.target.matches('[data-delete-appointment]')) {
    const id = ev.target.dataset.deleteAppointment;
    if (!confirm('Delete this appointment?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) showNotification('Appointment deleted');
      else showNotification(data.message || 'Failed to delete', 'error');
      loadAppointments();
      loadOverviewCounts();
    } catch (err) { showNotification('Error deleting appointment', 'error'); }
  }

  // view record
  if (ev.target.matches('[data-view-record]')) {
    const id = ev.target.dataset.viewRecord;
    const r = records.find(x => x._id === id);
    if (!r) { showNotification('Record not found', 'error'); return; }
    alert(
      `Record Details:\n\nPatient: ${resolveNameFromId(patients, r.patient_id)||r.patient_id}\nDoctor: ${resolveNameFromId(doctors, r.doctor_id)||r.doctor_id}\nDiagnosis: ${r.diagnosis}\nPrescription: ${r.prescription||'N/A'}\nNotes: ${r.notes||'N/A'}\nDate: ${formatDisplayDate(r.date||r.createdAt)}`
    );
  }
});

/* ------------------------------
  FORM SUBMISSIONS (create/update)
-------------------------------*/
async function handleFormSubmission(e, formId, urlBase, successMsg, loadFunc) {
  e.preventDefault();

  const id = document.getElementById(`${formId}-id`)?.value;
  const isUpdate = !!id;
  const submitBtn = document.getElementById(`${formId}SubmitBtn`);

  const originalText = submitBtn.textContent;
  submitBtn.textContent = isUpdate ? 'Updating...' : 'Saving...';
  submitBtn.disabled = true;

  try {
    // Use GraphQL for Patient, Doctor, Appointment
    if (['patient', 'doctor', 'appointment'].includes(formId)) {
      await handleGraphQLMutation(formId, id, isUpdate);
    } else if (formId === 'record') {
      // Keep REST for Medical Record
      await handleRESTSubmission(formId, id, isUpdate, urlBase);
    }

    showNotification(`${successMsg} ${isUpdate ? 'updated' : 'added/created'}`);
    e.target.reset();
    closeModalById(`modal${formId.charAt(0).toUpperCase() + formId.slice(1)}`);
    if (id) document.getElementById(`${formId}-id`).value = '';
    loadFunc();
    populateDropdowns();
  } catch (err) {
    console.error(err);
    showNotification(`Error ${isUpdate ? 'updating' : 'adding'} ${formId}`, 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

async function handleGraphQLMutation(formId, id, isUpdate) {
  let mutation = '';

  if (formId === 'patient') {
    const name = document.getElementById('patient-name').value;
    const birth_date = document.getElementById('patient-birthdate').value;
    const gender = document.getElementById('patient-gender').value;
    const phone = document.getElementById('patient-phone').value;
    const address = document.getElementById('patient-address').value;
    const blood_type = document.getElementById('patient-bloodtype').value;

    if (isUpdate) {
      mutation = `mutation {
        updatePatient(id: "${id}", name: "${name}", phone: "${phone}", address: "${address}", blood_type: "${blood_type}") {
          id name birth_date gender phone address blood_type
        }
      }`;
    } else {
      mutation = `mutation {
        createPatient(name: "${name}", birth_date: "${birth_date}", gender: "${gender}", phone: "${phone}", address: "${address}", blood_type: "${blood_type}") {
          id name birth_date gender phone address blood_type
        }
      }`;
    }
    await graphqlQuery('patients', mutation);
  }
  else if (formId === 'doctor') {
    const name = document.getElementById('doctor-name').value;
    const specialization = document.getElementById('doctor-specialization').value;
    const phone = document.getElementById('doctor-phone').value;
    const schedule = (document.getElementById('doctor-schedule').value || '').split('\n').map(s => s.trim()).filter(Boolean);
    const scheduleStr = JSON.stringify(schedule).replace(/"/g, '\\"');

    if (isUpdate) {
      mutation = `mutation {
        updateDoctor(id: "${id}", name: "${name}", phone: "${phone}", schedule: ${JSON.stringify(schedule)}) {
          id name specialization phone schedule
        }
      }`;
    } else {
      mutation = `mutation {
        createDoctor(name: "${name}", specialization: "${specialization}", phone: "${phone}", schedule: ${JSON.stringify(schedule)}) {
          id name specialization phone schedule
        }
      }`;
    }
    await graphqlQuery('doctors', mutation);
  }
  else if (formId === 'appointment') {
    const patient_id = appointmentPatientSelect.value;
    const doctor_id = appointmentDoctorSelect.value;
    const dt = document.getElementById('appointment-datetime').value;
    const appointment_date = dt ? dt.replace('T', ' ') : '';
    const complaint = document.getElementById('appointment-complaint').value;
    const status = appointmentStatusSelect.value;

    if (isUpdate) {
      mutation = `mutation {
        updateAppointmentStatus(id: "${id}", status: "${status}") {
          id patient_id doctor_id appointment_date status complaint
        }
      }`;
    } else {
      mutation = `mutation {
        createAppointment(patient_id: "${patient_id}", doctor_id: "${doctor_id}", appointment_date: "${appointment_date}", complaint: "${complaint}", status: "${status}") {
          id patient_id doctor_id appointment_date status complaint
        }
      }`;
    }
    await graphqlQuery('appointments', mutation);
  }
}

async function handleRESTSubmission(formId, id, isUpdate, urlBase) {
  const method = isUpdate ? 'PUT' : 'POST';
  const url = isUpdate ? `${API_BASE_URL}/${urlBase}/${id}` : `${API_BASE_URL}/${urlBase}`;

  let payload = {
    patient_id: recordPatientSelect.value,
    doctor_id: recordDoctorSelect.value,
    appointment_id: recordAppointmentSelect.value || undefined,
    diagnosis: document.getElementById('record-diagnosis').value,
    prescription: document.getElementById('record-prescription').value,
    notes: document.getElementById('record-notes').value
  };

  const res = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to submit');
  }
}

formPatient.addEventListener('submit', (e) => handleFormSubmission(e, 'patient', 'patients', 'Patient', loadPatients));
formDoctor.addEventListener('submit', (e) => handleFormSubmission(e, 'doctor', 'doctors', 'Doctor', loadDoctors));
formAppointment.addEventListener('submit', (e) => handleFormSubmission(e, 'appointment', 'appointments', 'Appointment', loadAppointments));
formRecord.addEventListener('submit', (e) => handleFormSubmission(e, 'record', 'records', 'Record', loadMedicalRecords));


/* ------------------------------
  OPEN MODAL BUTTONS & POPULATE DROPDOWNS
-------------------------------*/
document.getElementById('btnAddPatient').addEventListener('click', () => {
  formPatient.reset();
  patientIdInput.value = ''; 
  openModal(modalPatient, false);
});
document.getElementById('overviewAddPatient').addEventListener('click', () => {
  formPatient.reset();
  patientIdInput.value = ''; 
  openModal(modalPatient, false);
});
document.getElementById('btnAddDoctor').addEventListener('click', () => {
  formDoctor.reset();
  doctorIdInput.value = ''; 
  openModal(modalDoctor, false);
});
document.getElementById('btnAddAppointment').addEventListener('click', async () => {
  formAppointment.reset();
  appointmentIdInput.value = ''; 
  await populateDropdowns();
  openModal(modalAppointment, false);
});
document.getElementById('btnAddRecord').addEventListener('click', async () => {
  formRecord.reset();
  await populateDropdowns();
  openModal(modalRecord);
});

/* Populate patient/doctor dropdowns used in modals */
async function populateDropdowns() {
  try {
    const pQuery = `{ patients { id name phone } }`;
    const dQuery = `{ doctors { id name specialization } }`;
    const aQuery = `{ appointments { id appointment_date status } }`;

    const [pData, dData, aData] = await Promise.all([
      graphqlQuery('patients', pQuery),
      graphqlQuery('doctors', dQuery),
      graphqlQuery('appointments', aQuery)
    ]);

    patients = (pData && pData.patients) ? pData.patients.map(p => ({ ...p, _id: p.id })) : [];
    doctors = (dData && dData.doctors) ? dData.doctors.map(d => ({ ...d, _id: d.id })) : [];
    appointments = (aData && aData.appointments) ? aData.appointments.map(a => ({ ...a, _id: a.id })) : [];

    [appointmentPatientSelect, recordPatientSelect].forEach(sel => {
      const selectedValue = sel.value; 
      sel.innerHTML = `<option value="">Select Patient</option>`;
      patients.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p._id;
        opt.textContent = `${p.name} — ${p.phone || ''}`;
        sel.appendChild(opt);
      });
      sel.value = selectedValue; 
    });

    [appointmentDoctorSelect, recordDoctorSelect].forEach(sel => {
      const selectedValue = sel.value;
      sel.innerHTML = `<option value="">Select Doctor</option>`;
      doctors.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d._id;
        opt.textContent = `${d.name} — ${d.specialization || ''}`;
        sel.appendChild(opt);
      });
      sel.value = selectedValue;
    });

    const selectedApptValue = recordAppointmentSelect.value;
    recordAppointmentSelect.innerHTML = `<option value="">None</option>`;
    appointments.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a._id;
      opt.textContent = `${formatDisplayDate(a.appointment_date)} — ${a.status || ''}`;
      recordAppointmentSelect.appendChild(opt);
    });
    recordAppointmentSelect.value = selectedApptValue;

  } catch (err) {
    console.error('populateDropdowns error', err);
  }
}

/* ------------------------------
  Refresh all data
-------------------------------*/
document.getElementById('refreshAll').addEventListener('click', () => {
  loadPatients(); loadDoctors(); loadAppointments(); loadMedicalRecords(); loadOverviewCounts();
  showNotification('Refreshed');
});

/* ------------------------------
  Global search (very light)
-------------------------------*/
document.getElementById('globalSearch').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  if (!q) { 
    const active = document.querySelector('.nav-item.active').dataset.section;
    if (active === 'patients') renderPatientsTable();
    if (active === 'doctors') renderDoctorsTable();
    if (active === 'appointments') renderAppointmentsTable();
    if (active === 'records') renderRecordsTable();
    return;
  }
  const filteredPatients = patients.filter(p => (p.name||'').toLowerCase().includes(q) || (p.phone||'').includes(q));
  const filteredDoctors = doctors.filter(d => (d.name||'').toLowerCase().includes(q) || (d.specialization||'').toLowerCase().includes(q));
  
  const activeSectionBtn = document.querySelector('.nav-item.active');
  if (!activeSectionBtn) return;
  const active = activeSectionBtn.dataset.section;

  if (active === 'patients') {
    patientsTbody.innerHTML = '';
    filteredPatients.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.name}</td><td>${p.birth_date ? p.birth_date.split('T')[0] : '-'}</td><td>${p.gender||'-'}</td><td>${p.phone||'-'}</td><td>${p.blood_type||'-'}</td><td><button class="small-btn edit-btn" data-edit-patient="${p._id}">Edit</button> <button class="small-btn delete-btn" data-delete-patient="${p._id}">Delete</button></td>`;
      patientsTbody.appendChild(tr);
    });
  } else if (active === 'doctors') {
    doctorsTbody.innerHTML = '';
    filteredDoctors.forEach(d => {
      const schedule = Array.isArray(d.schedule) ? d.schedule.join('<br>') : (d.schedule || '-');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${d.name}</td><td>${d.specialization}</td><td>${d.phone||'-'}</td><td>${schedule}</td><td><button class="small-btn edit-btn" data-edit-doctor="${d._id}">Edit</button> <button class="small-btn delete-btn" data-delete-doctor="${d._id}">Delete</button></td>`;
      doctorsTbody.appendChild(tr);
    });
  }
});

/* ------------------------------
  INIT: load all initial data
-------------------------------*/
(async function init() {
  await loadOverviewCounts();
  await loadPatients();
  loadDoctors();
  loadAppointments();
  loadMedicalRecords();
  populateDropdowns();
})();