// admin/admin.js
// Simple admin dashboard client-side code.
(function(){
  const API_BASE = 'http://localhost:9000';
  function token(){ try { return localStorage.getItem('quickfix-token'); } catch(_) { return null; } }
  function authHeader(){ const t = token(); return t ? { 'Authorization': 'Bearer ' + t } : {}; }

  async function fetchSummary(){
    const res = await fetch(API_BASE + '/api/admin/summary', { headers: { ...authHeader() } });
    if (!res.ok) throw new Error('Failed to load summary');
    const data = await res.json();
    document.getElementById('sumUsers').textContent = data.users ?? '-';
    document.getElementById('sumServices').textContent = data.services ?? '-';
    document.getElementById('sumBookings').textContent = data.bookings ?? '-';
  }

  async function fetchBookings(){
    const status = document.getElementById('statusFilter').value;
    const url = new URL(API_BASE + '/api/admin/bookings');
    if (status) url.searchParams.set('status', status);
    const res = await fetch(url, { headers: { 'Content-Type':'application/json', ...authHeader() } });
    if (!res.ok) throw new Error('Failed to load bookings');
    const data = await res.json();
    const tbody = document.getElementById('bookingsBody');
    tbody.innerHTML = '';
(data.items || []).forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2">${b.name || (b.userId?.name || '-')}</td>
        <td class="p-2">${b.serviceType || (b.serviceId?.name || '-')}</td>
        <td class="p-2">${b.date || '-'} ${b.time || ''}</td>
        <td class="p-2">${b.status}</td>
        <td class="p-2">
          <select class="border rounded px-1 py-0.5 text-xs" data-id="${b._id}">
            ${['Pending','Accepted','En route','Arrived','Completed','Cancelled'].map(s => `<option ${s===b.status?'selected':''}>${s}</option>`).join('')}
          </select>
          <button class="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded" data-save="${b._id}">Save</button>
          <button title="Assign technician by ID" class="ml-2 px-2 py-1 text-xs bg-gray-600 text-white rounded" data-assign="${b._id}">Assign</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  async function saveStatus(id, status){
    const res = await fetch(API_BASE + '/api/admin/bookings/' + id, {
      method:'PATCH',
      headers: { 'Content-Type':'application/json', ...authHeader() },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      alert(err.message || 'Failed to update');
    }
  }

  async function assignTech(id){
    const techId = prompt('Enter technicianId to assign to this booking:');
    if (!techId) return;
    const res = await fetch(API_BASE + '/api/admin/bookings/' + id + '/assign', {
      method:'PATCH',
      headers: { 'Content-Type':'application/json', ...authHeader() },
      body: JSON.stringify({ technicianId: techId })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      alert(err.message || 'Failed to assign');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!token()) { window.location.href = '../login.html'; return; }
    fetchSummary().catch(err => console.error(err));
    fetchBookings().catch(err => console.error(err));
    document.getElementById('statusFilter').addEventListener('change', fetchBookings);

    document.getElementById('bookingsBody').addEventListener('click', async (e) => {
      if (e.target && e.target.dataset && e.target.dataset.save) {
        const id = e.target.dataset.save;
        const select = e.target.parentElement.querySelector('select');
        const status = select.value;
        await saveStatus(id, status);
        await fetchBookings();
      } else if (e.target && e.target.dataset && e.target.dataset.assign) {
        const id = e.target.dataset.assign;
        await assignTech(id);
        await fetchBookings();
      }
    });
  });
})();