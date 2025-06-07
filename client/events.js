// event.js
import { 
  updatePackage, 
  addPackage, 
  loadPackages, 
  searchLocation, 
  confirmLocation ,
  getPackage
} from './api.js';

import { showToast, showMapImage } from './ui.js';

import { 
  openLocationModal, 
  closeLocationModal, 
  getCurrentLocationPkgId 
} from './modal.js';

export function bindGlobalEvents() {
  $(document).on('click', '.edit-btn', handleEditClick);
  $(document).on('submit', '#location-form', handleLocationSearch);
  $(document).on('click', '#confirm-location', handleLocationConfirm);
  $(document).on('click', '.show-customer', handleCustomerInfo);
  $(document).on('click', '.show-path', handlePathInfo);
  $(document).on('click', '.view-map-btn', handleMapView);
  $(document).on('click', '.add-loc-btn', handleAddLocationClick);
  $(document).on('click', '.add-loc-btn', handleAddLocationClick);
  $('#add-package-top, #add-package-bottom').on('click', () =>
    $('#add-package-modal').removeClass('hidden')
  );
}


function handleAddLocationClick(e) {
  e.preventDefault();
  const pkgId = $(this).data('id');
  console.log('Add Location Clicked, pkgId:', pkgId);

  if (!pkgId) return;

  openLocationModal(pkgId);
}
function handleEditClick() {
  const id = $(this).data('id');
  const eta = $(this).data('eta'); // Don't convert to Date yet
  const status = $(this).data('status');

  openEditModal(id, eta, status);
}

function handleEditSubmit(form) {
  const id = $('#edit-modal').data('id');
  const currentEta = $('#edit-modal').data('eta');
  const currentStatus = $('#edit-modal').data('status');

  const etaInput = form.elements.eta.value.trim();
  const statusInput = form.elements.status.value.trim();

  const update = {};

  if (etaInput) {
    const newEta = Math.floor(new Date(etaInput).getTime() / 1000);
    if (newEta !== currentEta) {
      update.eta = newEta;
    }
  }

  if (statusInput && statusInput !== currentStatus) {
    update.status = statusInput;
  }

  if (!Object.keys(update).length) {
    showToast('No changes detected', 'error');
    return;
  }

  updatePackage(id, update, () => $('#edit-modal').addClass('hidden'));
}

function handleAddSubmit(form) {
  const startDateStr = form.elements.start_date.value.trim();
  const etaStr = form.elements.eta.value.trim();

  const startTimestamp = startDateStr 
    ? new Date(startDateStr).getTime() 
    : Date.now();

  const etaTimestamp = new Date(etaStr).getTime();

  const formData = {
    prod_id: form.elements.prod_id.value,
    name: form.elements.name.value,
    customer: {
      id: form.elements.customerId.value,
      name: form.elements.customerName.value,
      email: form.elements.email.value,
      address: {
        street: form.elements.street.value,
        number: parseInt(form.elements.number.value, 10),
        city: form.elements.city.value
      }
    },
    start_date: startTimestamp,
    eta: etaTimestamp,
    status: form.elements.status.value
  };

  addPackage(formData, (response) => {
    showToast(`Package added! ID: ${response.id}`, 'success');
    $('#add-package-modal').addClass('hidden');
    $('#package-form')[0].reset();
    getPackage(response.id); 
  });
}

function handleCustomerInfo(e) {
  e.preventDefault();
  const data = JSON.parse(decodeURIComponent($(this).data('info')));
  $('#cust-name').text(data.name);
  $('#cust-email').text(data.email);

  const address = data.address;
  const addressHtml = `
    <li>Street: ${address.street}</li>
    <li>Number: ${address.number}</li>
    <li>City: ${address.city}</li>
  `;
  $('#cust-address').html(addressHtml);
  $('#customer-modal').removeClass('hidden');
}

function handlePathInfo(e) {
  e.preventDefault();
  const pathArray = JSON.parse(decodeURIComponent($(this).data('path')));
  const container = $('#path-details');
  container.html(
    pathArray.length
      ? pathArray.map((p, i) =>
          `<p><strong>Location ${i + 1}:</strong><br>
            <ul style="margin: 4px 0 0 20px; padding: 0; list-style-type: disc;">
              <li>Lat: ${p.lat}</li>
              <li>Lon: ${p.lon}</li>
            </ul>
          </p>`)
      : '<p>No path data available.</p>'
  );
  $('#path-modal').removeClass('hidden');
}

function handleMapView(e) {
  e.preventDefault();
  const pkgId = $(this).data('id');
  const mapUrl = `${apiBase}/${pkgId}/staticmap`;

  openMapModal();

  fetch(mapUrl)
    .then((response) => {
      const contentType = response.headers.get('Content-Type');
      if (contentType.includes('application/json')) {
        return response.json().then((json) => {
          closeMapModal();
          showToast(json.message || 'No path data available', 'info');
        });
      }
      showMapImage(mapUrl);
    })
    .catch(() => {
      closeMapModal();
      showToast('Failed to fetch map', 'error');
    });
}
function handleLocationSearch(form) {
const location = form.elements.location.value.trim();
  const pkgId = getCurrentLocationPkgId();

  if (!location || !pkgId) return;

  const $btn = $(form).find('button[type="submit"]');
  $btn.prop('disabled', true).text('Searching...');

  const ajax = searchLocation(pkgId, location,
    (data) => {
      $('#location-suggestion').html(`
        <strong>Found:</strong> ${data.address}<br>
        <strong>Lat:</strong> ${data.lat}, <strong>Lon:</strong> ${data.lon}<br>
        <button type="button" id="confirm-location" class="btn small" data-lat="${data.lat}" data-lon="${data.lon}">Confirm</button>
      `).removeClass('hidden').addClass('visible');
    },
    () => {}
  );

  if (ajax?.always) {
    ajax.always(() => {
      $btn.prop('disabled', false).text('Search');
    });
  } else {
    $btn.prop('disabled', false).text('Search');
  }
}


function handleLocationConfirm() {
  const $btn = $(this);
  const lat = parseFloat($btn.data('lat'));
  const lon = parseFloat($btn.data('lon'));
  const pkgId = getCurrentLocationPkgId();

  if (!pkgId || isNaN(lat) || isNaN(lon)) return;

  $btn.prop('disabled', true).text('Saving...');

  confirmLocation(pkgId, lat, lon,
    (response) => {
      showToast(response.message || 'Package updated successfully', 'success');

      const row = $('#package-list tbody tr').filter(function () {
        return $(this).find('td:first a.show-path').text() == pkgId;
      });

      if (row.length) {
        const pathLink = row.find('td:first a.show-path');
        let currentPath = [];

        try {
          currentPath = JSON.parse(decodeURIComponent(pathLink.data('path')));
        } catch (e) {
          console.warn('Failed to parse existing path data:', e);
        }

        currentPath.push({ lat, lon });

        const updatedPath = encodeURIComponent(JSON.stringify(currentPath));
        pathLink.data('path', updatedPath).attr('data-path', updatedPath);
      }

      closeLocationModal();
    },
    () => {
      $btn.prop('disabled', false).text('Confirm');
    }
  );
}
window.handleAddSubmit = handleAddSubmit;
window.handleEditSubmit = handleEditSubmit;
window.handleLocationSearch = handleLocationSearch;