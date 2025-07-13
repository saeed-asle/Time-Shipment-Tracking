import { setupFormValidation } from './packageValidator.js';

$(document).ready(function () {
  setupFormValidation ();
  let packages = [];
  let customers = [];
  const pathParts = window.location.pathname.split('/');
  const buisnessId = pathParts[pathParts.length - 1];
  const isValidId = /^[a-fA-F0-9]{24}$/.test(buisnessId);

  if (!isValidId) {
    $('.container').html(`
      <div style="text-align:center; margin-top:80px; font-size:1.5rem; color: red;">
        Invalid Buisness Id
      </div>
    `).show();
    return;
  }
  $('.container').show();

  function renderPackagesTable() {
    const tbody = $('#package-table tbody');
    tbody.empty();
    if (!packages.length) {
      tbody.append('<tr><td colspan="8" style="text-align:center;color:#aaa;">No packages found</td></tr>');
      return;
    }
    packages.forEach(pkg => {
      tbody.append(`
        <tr>
          <td><a href="#" class="package-path-link" data-id="${pkg._id}">${pkg._id}</a></td>
          <td>${pkg.prod_id}</td>
          <td>${pkg.name}</td>
          <td>
            <a href="#" class="customer-link" data-id="${pkg.customer && pkg.customer._id}">
              ${pkg.customer && pkg.customer.name || ''}
            </a>
          </td>
          <td>${new Date(pkg.start_date).toLocaleDateString()}</td>
          <td>${new Date(pkg.eta).toLocaleDateString()}</td>
          <td>${pkg.status}</td>
          <td>
            <button class="btn primary add-location-btn" data-id="${pkg._id}">Add Location</button>
            <button class="btn primary view-path-btn" data-id="${pkg._id}">View Path</button>
          </td>
        </tr>
      `);
    });
  }
  // --- 1. Load & display packages ---
function loadPackages() { 
  $.ajax({
    url: `/packages/${buisnessId}`,
    method: 'GET',
    dataType: 'json',
    success: function (data) { 
packages = data;
renderPackagesTable();
    },
    error: () => showToast('Failed to load packages', true)
  });
}
function getCustomerById(id) {
  return customers.find(c => c._id === id) || {};
}
function insertPackageSorted(newPackage) {
  let inserted = false;
  for (let i = 0; i < packages.length; i++) {
    if (new Date(newPackage.start_date) >= new Date(packages[i].start_date)) {
      packages.splice(i, 0, newPackage);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    packages.push(newPackage);
  }
}
  // --- 2. Load customers for dropdown ---
  function loadCustomerDropdown() {
    $.ajax({
      url: '/customers',
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        customers = data;
        const $dropdown = $('#customer');
        $dropdown.empty();
        $dropdown.append('<option value="">Select customer...</option>');
        customers.forEach(cust => {
          $dropdown.append(
            `<option value="${cust._id}">
              ${cust.name} (${cust.email}) - ${cust.address.street} ${cust.address.number}, ${cust.address.city}
            </option>`
          );
        });
      },
      error: function() {
        showToast('Failed to load customers', true);
      }
    });
  }

  // --- 3. Show Add Package Modal ---
  $('#add-package-top, #add-package-bottom').on('click', function () {
    loadCustomerDropdown();
    $('#add-package-modal').removeClass('hidden');
  });
  $('#close-add-modal').on('click', function () {
    $('#add-package-modal').addClass('hidden');
    $('#package-form')[0].reset();
    $('#package-form').validate().resetForm();
  });

  $('#package-form').validate({
    submitHandler: function () {
      const pkg = {
        prod_id: $('#prod_id').val(),
        name: $('#name').val(),
        customer_id: $('#customer').val(),
        start_date: new Date($('#start_date').val()).getTime(),
        eta: new Date($('#eta').val()).getTime(),
        status: $('#status').val(),
        buisness_id: buisnessId
      };
      $.ajax({
        url: `/packages`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(pkg),
        success: function (resp) {
          $('#add-package-modal').addClass('hidden');
          showToast('Package added!');
          const customer = getCustomerById($('#customer').val());
          const newPackage = {
            _id: resp._id,
            prod_id: $('#prod_id').val(),
            name: $('#name').val(),
            customer: customer,
            start_date: new Date($('#start_date').val()).toISOString(),
            eta: new Date($('#eta').val()).toISOString(),
            status: $('#status').val(),
            path: [],
            buisness: buisnessId
          };
          insertPackageSorted(newPackage);
          renderPackagesTable();
        },
        error: function (xhr) {
          let msg = xhr.responseJSON?.error || 'Failed to add package';
          showToast(msg, true);
        }
      });
      return false;
    }
  });

  // --- 5. Show Customer Info Modal ---
  $('#package-table').on('click', '.customer-link', function (e) {
    e.preventDefault();
    const custId = $(this).data('id');
    $.ajax({
      url: `/customers`,
      method: 'GET',
      dataType: 'json',
      success: function (customers) {
        const cust = customers.find(c => c._id === custId);
        if (!cust) return showToast('Customer not found', true);
        $('#cust-name').text(cust.name);
        $('#cust-email').text(cust.email);
        $('#cust-address').html(`
          <li>${cust.address.street} ${cust.address.number}, ${cust.address.city}</li>
          ${cust.address.lat && cust.address.lon ? `<li>Lat: ${cust.address.lat}, Lon: ${cust.address.lon}</li>` : ''}
        `);
        $('#customer-modal').removeClass('hidden');
      }
    });
  });
  $('#close-customer-modal').on('click', function () {
    $('#customer-modal').addClass('hidden');
  });

$('#package-table').on('click', '.add-location-btn', function () {
  const packageId = $(this).data('id');
  $('#location-modal').data('packageid', packageId).removeClass('hidden');
  $('#location-form')[0].reset();
  $('#location-suggestion').addClass('hidden');
});

$('#close-location-modal').on('click', function () {
  $('#location-modal').addClass('hidden');
});

// Search for location on submit
$('#location-form').on('submit', function (e) {
  e.preventDefault();
  const location = $('#location-input').val();
  $('#location-suggestion').removeClass('hidden').html('Searching...');
  $.ajax({
    url: '/location/search',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ location }),
    success: function (data) {
      $('#location-suggestion')
        .data('lat', data.lat)
        .data('lon', data.lon)
        .html(`
          <strong>Found Address:</strong> ${data.address}<br>
          <strong>Latitude:</strong> ${data.lat}<br>
          <strong>Longitude:</strong> ${data.lon}<br>
          <button id="add-location-final" class="btn primary" style="margin-top:10px;">Add This Location</button>
        `);
    },
    error: function (xhr) {
      $('#location-suggestion').html(xhr.responseJSON?.error || 'Location not found');
    }
  });
});


// Actually add location to package
$('#location-suggestion').on('click', '#add-location-final', function () {
  const packageId = $('#location-modal').data('packageid');
  const lat = $('#location-suggestion').data('lat');
  const lon = $('#location-suggestion').data('lon');
  if (typeof lat !== "number" || typeof lon !== "number") {
    showToast('Invalid location data', true);
    return;
  }
  $.ajax({
    url: `/packages/${packageId}/path`,
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ lat, lon }),
    success: function () {
      console.log(packages);
      $('#location-modal').addClass('hidden');
      showToast('Location added!');
      // Update the package path locally (since API doesn't return anything)
      const pkg = packages.find(p => p._id === packageId);
      if (pkg) {
        if (!pkg.path) pkg.path = [];
        pkg.path.push({
          lat: lat,
          lon: lon,
        });
      }
    },
    error: function (xhr) {
      showToast(xhr.responseJSON?.error || 'Error', true);
    }
  });
});

  // --- 7. View Path Modal ---
$('#package-table').on('click', '.package-path-link', function (e) {
  e.preventDefault();
  const packageId = $(this).data('id');
  const pkg = packages.find(p => p._id === packageId);
  if (!pkg || !pkg.path.length) {
    $('#path-details').html('<em>No path for this package</em>');
  } else {
    $('#path-details').html(pkg.path.map((loc, idx) =>
      `<div>${idx + 1}. Lat: ${loc.lat}, Lon: ${loc.lon}</div>`
    ).join(''));
  }
  $('#path-modal').removeClass('hidden');
});


$('#package-table').on('click', '.view-path-btn', function (e) {
  e.preventDefault();
  const packageId = $(this).data('id');
  $('#map-loader').show();
  $('#map-image').hide();
  $('#map-modal').removeClass('hidden');
  fetch(`/packages/${packageId}/staticmap`)
    .then((resp) => {
      if (resp.headers.get('Content-Type').includes('application/json')) {
        return resp.json().then(json => {
          $('#map-loader').hide();
          $('#map-modal').addClass('hidden');
          showToast(json.message || 'No path data available', 'info');
        });
      }
      return resp.blob().then(blob => {
        const url = URL.createObjectURL(blob);
        $('#map-image').attr('src', url).show();
        $('#map-loader').hide();
      });
    })
    .catch(() => {
      $('#map-loader').hide();
      $('#map-modal').addClass('hidden');
      showToast('Failed to fetch map', true);
    });
});

  // --- 8. Toast helper ---
  function showToast(message, isError = false) {
    $('#toast').text(message)
      .removeClass('hidden')
      .toggleClass('error', isError);
    setTimeout(() => $('#toast').addClass('hidden'), 2200);
  }
$('#close-map-modal').on('click', function () {
  $('#map-modal').addClass('hidden');
});
  $('.modal').on('mousedown', function(e) {
  if (e.target === this) {
    $(this).addClass('hidden');
    $(this).find('form').each(function() {
      this.reset && this.reset();
      $(this).validate && $(this).validate().resetForm();
    });
    $(this).find('.suggestion').addClass('hidden');
  }

});
    loadPackages();
  setupFormValidation();
});
