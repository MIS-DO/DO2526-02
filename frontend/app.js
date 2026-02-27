// helpers for nested properties
function getNested(obj, path) {
  if (!obj) return '';
  return path.split('.').reduce((o, i) => (o ? o[i] : ''), obj) || '';
}

function setNested(obj, path, value) {
  if (value === undefined) return;
  const parts = path.split('.');
  const last = parts.pop();
  let current = obj;
  parts.forEach(part => {
    if (!current[part]) current[part] = {};
    current = current[part];
  });
  current[last] = value;
}

// ===== API Configuration =====
const API_CONFIG = {
  employees: {
    baseUrl: 'http://localhost:8001/api/v1/employees',
    name: 'Empleado',
    icon: '👥',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readOnlyOnEdit: true },
      { key: 'fullName', label: 'Nombre completo', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'salary', label: 'Salario', type: 'number', required: true },
      { key: 'hireDate', label: 'Fecha contrato', type: 'date' },
      { key: 'city', label: 'Ciudad', type: 'text' },
      { key: 'teleworking', label: 'Teletrabajo', type: 'checkbox' },
      { key: 'spokenLanguages', label: 'Idiomas (separados por coma)', type: 'text', isArray: true },
    ],
  },
  flights: {
    baseUrl: 'http://localhost:8002/api/v1/flight',
    name: 'Vuelo',
    icon: '✈️',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readOnlyOnEdit: true },
      { key: 'flightNumber', label: 'Nº Vuelo', type: 'text', required: true },
      { key: 'airline', label: 'Aerolínea', type: 'text', required: true },
      { key: 'departure.city', label: 'Origen (Ciudad)', type: 'text', required: true },
      { key: 'departure.airport', label: 'Origen (Aeropuerto)', type: 'text' },
      { key: 'departure.dateTime', label: 'Fecha/Hora Salida', type: 'text' },
      { key: 'arrival.city', label: 'Destino (Ciudad)', type: 'text', required: true },
      { key: 'arrival.airport', label: 'Destino (Aeropuerto)', type: 'text' },
      { key: 'arrival.dateTime', label: 'Fecha/Hora Llegada', type: 'text' },
      { key: 'aircraft', label: 'Avión', type: 'text' },
      { key: 'seatCapacity', label: 'Capacidad', type: 'number' },
      { key: 'seatsAvailable', label: 'Asientos disponibles', type: 'number' },
      { key: 'price.amount', label: 'Precio', type: 'number' },
      { key: 'price.currency', label: 'Moneda (EUR/USD...)', type: 'text' },
      { key: 'hasWifi', label: 'WiFi', type: 'checkbox' },
    ],
  },
  spacemissions: {
    baseUrl: 'http://localhost:8003/api/v1/spacemissions',
    name: 'Misión Espacial',
    icon: '🛸',
    fields: [
      { key: 'id', label: 'ID', type: 'number', required: true, readOnlyOnEdit: true },
      { key: 'missionName', label: 'Nombre de misión', type: 'text', required: true },
      { key: 'status', label: 'Estado', type: 'select', options: ['planned', 'active', 'completed', 'cancelled'] },
      { key: 'target.planet', label: 'Planeta destino', type: 'text' },
      { key: 'target.region', label: 'Región objetivo', type: 'text' },
      { key: 'launch.year', label: 'Año de lanzamiento', type: 'number' },
      { key: 'launch.location', label: 'Centro de lanzamiento', type: 'text' },
      { key: 'launch.city', label: 'Ciudad de lanzamiento (Para búsqueda Global)', type: 'text', required: true },
      { key: 'crew.isManned', label: 'Misión tripulada', type: 'checkbox' },
      { key: 'crew.capacity', label: 'Capacidad de tripulación', type: 'number' },
      { key: 'crew.requiresLifeSupport', label: 'Soporte vital', type: 'checkbox' },
      { key: 'financials.estimatedBudget', label: 'Presupuesto Estimado', type: 'number' },
      { key: 'financials.currency', label: 'Moneda (USD/EUR...)', type: 'text' },
    ],
  },
};

// ===== State =====
let currentTab = 'employees';
let editingItem = null;
let editingType = null;
const dataCache = { employees: [], flights: [], spacemissions: [] };

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  loadAllData();
});

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`section-${tab}`).classList.add('active');
}

// ===== Data Loading =====
async function loadAllData() {
  await Promise.all([
    loadData('employees'),
    loadData('flights'),
    loadData('spacemissions'),
  ]);
}

async function loadData(type) {
  const config = API_CONFIG[type];
  const grid = document.getElementById(`${type}-grid`);
  grid.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    const res = await fetch(config.baseUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    dataCache[type] = data;
    document.getElementById(`count-${type}`).textContent = data.length;
    renderCards(type, data);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><h3>Error al conectar</h3><p>${err.message}</p></div>`;
    console.error(`Error loading ${type}:`, err);
  }
}

// ===== Card Rendering =====
function renderCards(type, items) {
  const grid = document.getElementById(`${type}-grid`);

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state"><h3>No hay datos</h3><p>Crea el primer registro para comenzar</p></div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    switch (type) {
      case 'employees': return renderEmployeeCard(item);
      case 'flights': return renderFlightCard(item);
      case 'spacemissions': return renderSpaceMissionCard(item);
    }
  }).join('');
}

function renderEmployeeCard(e) {
  const salary = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(e.salary);
  const rating = e.performance ? '⭐'.repeat(e.performance.lastRating || 0) : 'N/A';
  const languages = e.spokenLanguages ? e.spokenLanguages.join(', ') : 'N/A';

  return `
    <div class="card" id="employee-card-${e.id}">
      <div class="card-header">
        <div>
          <div class="card-title">${e.fullName || 'Sin nombre'}</div>
          <div class="card-id">ID: ${e.id}</div>
        </div>
        <span class="card-badge ${e.teleworking ? 'badge-yes' : 'badge-no'}">
          ${e.teleworking ? '🏠 Remoto' : '🏢 Oficina'}
        </span>
      </div>
      <div class="card-details">
        <div class="detail"><div class="detail-label">Ciudad</div><div class="detail-value">${e.city || 'N/A'}</div></div>
        <div class="detail"><div class="detail-label">Salario</div><div class="detail-value">${salary}</div></div>
        <div class="detail"><div class="detail-label">Contrato</div><div class="detail-value">${e.hireDate || 'N/A'}</div></div>
        <div class="detail"><div class="detail-label">Rating</div><div class="detail-value">${rating}</div></div>
        <div class="detail"><div class="detail-label">Idiomas</div><div class="detail-value">${languages}</div></div>
      </div>
      <div class="card-actions">
        <button class="btn-secondary" onclick='editItem("employees", ${JSON.stringify(e).replace(/'/g, "&#39;")})'>✏️ Editar</button>
        <button class="btn-danger" onclick="deleteItem('employees', ${e.id})">🗑️ Eliminar</button>
      </div>
    </div>`;
}

function renderFlightCard(f) {
  const dep = f.departure || {};
  const arr = f.arrival || {};
  const price = f.price ? `${f.price.amount} ${f.price.currency || 'EUR'}` : 'N/A';

  return `
    <div class="card" id="flight-card-${f.id}">
      <div class="card-header">
        <div>
          <div class="card-title">${f.flightNumber || 'Sin número'} — ${f.airline || ''}</div>
          <div class="card-id">ID: ${f.id}</div>
        </div>
        <span class="card-badge ${f.hasWifi ? 'badge-yes' : 'badge-no'}">
          ${f.hasWifi ? '📶 WiFi' : '📵 Sin WiFi'}
        </span>
      </div>
      <div class="card-details">
        <div class="detail"><div class="detail-label">Origen</div><div class="detail-value">${dep.city || 'N/A'} (${dep.airport || ''})</div></div>
        <div class="detail"><div class="detail-label">Destino</div><div class="detail-value">${arr.city || 'N/A'} (${arr.airport || ''})</div></div>
        <div class="detail"><div class="detail-label">Avión</div><div class="detail-value">${f.aircraft || 'N/A'}</div></div>
        <div class="detail"><div class="detail-label">Precio</div><div class="detail-value">${price}</div></div>
        <div class="detail"><div class="detail-label">Capacidad</div><div class="detail-value">${f.seatCapacity || 'N/A'}</div></div>
        <div class="detail"><div class="detail-label">Disponibles</div><div class="detail-value">${f.seatsAvailable || 'N/A'}</div></div>
      </div>
      <div class="card-actions">
        <button class="btn-secondary" onclick='editItem("flights", ${JSON.stringify(f).replace(/'/g, "&#39;")})'>✏️ Editar</button>
        <button class="btn-danger" onclick="deleteItem('flights', ${f.id})">🗑️ Eliminar</button>
      </div>
    </div>`;
}

function renderSpaceMissionCard(m) {
  const target = m.target || {};
  const launch = m.launch || {};
  const crew = m.crew || {};
  const financials = m.financials || {};
  const budget = financials.estimatedBudget
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: financials.currency || 'USD', notation: 'compact' }).format(financials.estimatedBudget)
    : 'N/A';

  return `
    <div class="card" id="spacemission-card-${m.id}">
      <div class="card-header">
        <div>
          <div class="card-title">${m.missionName || 'Sin nombre'}</div>
          <div class="card-id">ID: ${m.id}</div>
        </div>
        <span class="card-badge badge-status">${m.status || 'unknown'}</span>
      </div>
      <div class="card-details">
        <div class="detail"><div class="detail-label">Origen (Ciudad)</div><div class="detail-value">${launch.city || 'N/A'}</div></div>
        <div class="detail"><div class="detail-label">Destino</div><div class="detail-value">${target.planet || 'N/A'} ${target.region ? '(' + target.region + ')' : ''}</div></div>
        <div class="detail"><div class="detail-label">Lanzamiento</div><div class="detail-value">${launch.year || 'N/A'} — ${launch.location || ''}</div></div>
        <div class="detail"><div class="detail-label">Tripulación</div><div class="detail-value">${crew.isManned ? 'Tripulada (' + (crew.capacity || '?') + ')' : 'No tripulada'}</div></div>
        <div class="detail"><div class="detail-label">Presupuesto</div><div class="detail-value">${budget}</div></div>
      </div>
      <div class="card-actions">
        <button class="btn-secondary" onclick='editItem("spacemissions", ${JSON.stringify(m).replace(/'/g, "&#39;")})'>✏️ Editar</button>
        <button class="btn-danger" onclick="deleteItem('spacemissions', ${m.id})">🗑️ Eliminar</button>
      </div>
    </div>`;
}

// ===== Modal =====
function openModal(type) {
  editingType = type;
  editingItem = null;
  const config = API_CONFIG[type];
  document.getElementById('modal-title').textContent = `Nuevo ${config.name}`;
  renderFormFields(type, null);
  document.getElementById('modal-overlay').classList.add('active');
}

function editItem(type, item) {
  editingType = type;
  editingItem = item;
  const config = API_CONFIG[type];
  document.getElementById('modal-title').textContent = `Editar ${config.name}`;
  renderFormFields(type, item);
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  editingItem = null;
  editingType = null;
}

function renderFormFields(type, item) {
  const config = API_CONFIG[type];
  const container = document.getElementById('modal-fields');
  let html = '';

  config.fields.forEach(field => {
    let rawVal = getNested(item, field.key);
    const value = item ? (field.isArray && Array.isArray(rawVal) ? rawVal.join(', ') : rawVal) : '';
    const disabled = field.readOnlyOnEdit && item ? 'disabled' : '';
    const required = field.required ? 'required' : '';

    if (field.type === 'checkbox') {
      const checked = item && getNested(item, field.key) ? 'checked' : '';
      html += `
        <div class="form-group">
          <div class="checkbox-group">
            <input type="checkbox" name="${field.key}" id="field-${field.key}" ${checked} ${disabled}>
            <label for="field-${field.key}">${field.label}</label>
          </div>
        </div>`;
    } else if (field.type === 'select') {
      const options = field.options.map(o => `<option value="${o}" ${value === o ? 'selected' : ''}>${o}</option>`).join('');
      html += `
        <div class="form-group">
          <label for="field-${field.key}">${field.label}</label>
          <select name="${field.key}" id="field-${field.key}" ${disabled} ${required}>
            <option value="">Seleccionar...</option>
            ${options}
          </select>
        </div>`;
    } else {
      html += `
        <div class="form-group">
          <label for="field-${field.key}">${field.label}${field.required ? ' *' : ''}</label>
          <input type="${field.type}" name="${field.key}" id="field-${field.key}" value="${value || ''}" ${disabled} ${required}>
        </div>`;
    }
  });

  container.innerHTML = html;
}

// ===== Form Submit =====
async function handleSubmit(event) {
  event.preventDefault();
  const config = API_CONFIG[editingType];
  const formData = {};

  config.fields.forEach(field => {
    const el = document.getElementById(`field-${field.key}`);
    if (!el) return;

    let valueToSet;
    if (field.type === 'checkbox') {
      valueToSet = el.checked;
    } else if (field.type === 'number') {
      valueToSet = el.value !== '' ? Number(el.value) : undefined;
    } else if (field.isArray) {
      valueToSet = el.value ? el.value.split(',').map(s => s.trim()).filter(Boolean) : [];
    } else {
      valueToSet = el.value || undefined;
    }

    setNested(formData, field.key, valueToSet);
  });

  try {
    let res;
    if (editingItem) {
      // PUT update
      const url = `${config.baseUrl}/${editingItem.id}`;
      res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      // POST create
      res = await fetch(config.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }

    if (res.ok || res.status === 201 || res.status === 204 || res.status === 200) {
      showToast(`${config.name} ${editingItem ? 'actualizado' : 'creado'} correctamente`, 'success');
      closeModal();
      await loadData(editingType || currentTab);
    } else {
      const status = res.status;
      let msg = `Error ${status}`;
      if (status === 409) msg = 'Ya existe un registro con ese ID';
      if (status === 422) msg = 'Datos incompletos o mal formados';
      showToast(msg, 'error');
    }
  } catch (err) {
    showToast('Error de conexión: ' + err.message, 'error');
  }
}

// ===== Delete =====
async function deleteItem(type, id) {
  const config = API_CONFIG[type];
  if (!confirm(`¿Estás seguro de que quieres eliminar este ${config.name.toLowerCase()}?`)) return;

  try {
    const res = await fetch(`${config.baseUrl}/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      showToast(`${config.name} eliminado correctamente`, 'success');
      await loadData(type);
    } else {
      showToast(`Error al eliminar (${res.status})`, 'error');
    }
  } catch (err) {
    showToast('Error de conexión: ' + err.message, 'error');
  }
}

// ===== Search Logic =====
async function handleSearch(event) {
  event.preventDefault();
  const input = document.getElementById('search-input');
  const city = input.value.trim();
  if (!city) return;

  const container = document.getElementById('search-results-container');
  container.innerHTML = '<div class="loading">Buscando...</div>';

  try {
    const res = await fetch(`http://localhost:3000/api/v1/search?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error("Error en la búsqueda");
    const data = await res.json();
    renderSearchResults(data.results, city);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
  }
}

function clearSearch() {
  const input = document.getElementById('search-input');
  input.value = '';
  const container = document.getElementById('search-results-container');
  container.innerHTML = `
    <div class="empty-state">
        <h3>Indica una ciudad para buscar</h3>
        <p>Buscaremos empleados radicados ahí, vuelos que salgan/lleguen, y misiones lanzadas desde ahí.</p>
    </div>
  `;
}

function renderSearchResults(results, city) {
  const container = document.getElementById('search-results-container');
  let html = '';

  const { employees, flights, spacemissions } = results;

  if (employees.length === 0 && flights.length === 0 && spacemissions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Sin resultados</h3>
        <p>No se encontraron datos que coincidan con la ciudad '${city}'.</p>
      </div>`;
    return;
  }

  if (employees.length > 0) {
    html += `<h3 class="search-category-title">👥 Empleados en ${city} (${employees.length})</h3>`;
    html += `<div class="cards-grid">`;
    html += employees.map(renderEmployeeCard).join('');
    html += `</div>`;
  }

  if (flights.length > 0) {
    html += `<h3 class="search-category-title">✈️ Vuelos relacionados con ${city} (${flights.length})</h3>`;
    html += `<div class="cards-grid">`;
    html += flights.map(renderFlightCard).join('');
    html += `</div>`;
  }

  if (spacemissions.length > 0) {
    html += `<h3 class="search-category-title">🛸 Misiones espaciales desde ${city} (${spacemissions.length})</h3>`;
    html += `<div class="cards-grid">`;
    html += spacemissions.map(renderSpaceMissionCard).join('');
    html += `</div>`;
  }

  container.innerHTML = html;
}

// ===== Toast =====
function showToast(message, type) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
