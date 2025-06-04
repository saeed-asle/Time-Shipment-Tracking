// event.js
import { 
  updatePackage, 
  addPackage, 
  loadPackages, 
  fetchStaticMap, 
  searchLocation, 
  confirmLocation 
} from './api.js';

import { showToast, showMapImage } from './ui.js';

import { 
  openLocationModal, 
  closeLocationModal, 
  getCurrentLocationPkgId 
} from './modal.js';

export function bindGlobalEvents() {
  $('#edit-form').on('submit', handleEditSubmit);
  $('#package-form').on('submit', handleAddSubmit);
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
  $('#edit-eta').val(new Date($(this).data('eta')).toISOString().split('T')[0]);
  $('#edit-status').val($(this).data('status'));
  $('#edit-modal').data('id', id).removeClass('hidden');
}

function handleEditSubmit(e) {
  e.preventDefault();
  const id = $('#edit-modal').data('id');
  const eta = $('#edit-eta').val();
  const status = $('#edit-status').val();
  const update = {};

  if (eta) update.eta = eta;
  if (status) update.status = status;

  if (!Object.keys(update).length) {
    showToast('No changes detected', 'error');
    return;
  }

  updatePackage(id, update, () => $('#edit-modal').addClass('hidden'));
}

function handleAddSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const startDateStr = form.start_date.value.trim();
  const etaStr = form.eta.value.trim();

  const formData = {
    prod_id: form.prod_id.value,
    name: form.name.value,
    customer: {
      id: form.customerId.value,
      name: form.customerName.value,
      email: form.email.value,
      address: {
        street: form.street.value,
        number: parseInt(form.number.value),
        city: form.city.value
      }
    },
    start_date: startDateStr || new Date().toISOString().split('T')[0],
    eta: etaStr,
    status: form.status.value
  };

  addPackage(formData, (response) => {
    showToast(`Package added! ID: ${response.id}`, 'success');
    $('#add-package-modal').addClass('hidden');
     $('#package-form')[0].reset(); 
    loadPackages();
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

function handleLocationSearch(e) {
  e.preventDefault();

  const location = $('#location-input').val().trim();
  const pkgId = getCurrentLocationPkgId();

  if (!location || !pkgId) return;

  const $btn = $('#location-form button');
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
