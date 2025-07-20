// Import validation rules for the package form
import { setupFormValidation } from './packageValidator.js';

$(document).ready(function () {
  let packages = [];   // store all packages
  let customers = [];  // store all customers

  // Get the business ID from the URL
  const pathParts = window.location.pathname.split('/');
  const buisnessId = pathParts[pathParts.length - 1];

  // Check if ID looks like a MongoDB ObjectId
  const isValidId = /^[a-fA-F0-9]{24}$/.test(buisnessId);

  // If ID is bad, show error and stop
  if (!isValidId) {
    $('.container').html(`
      <div style="text-align:center; margin-top:80px; font-size:1.5rem; color: red;">
        Invalid Business ID
      </div>
    `).show();
    return;
  }

  // If ID OK, show content
  $('.container').show();

  // When user submits package form (after validation)
  window.handleAddSubmit = function () {
    const pkg = {
      prod_id: $('#prod_id').val(),
      name: $('#name').val(),
      customer_id: $('#customer').val(),
      start_date: new Date($('#start_date').val()).getTime(),
      eta: new Date($('#eta').val()).getTime(),
      status: $('#status').val(),
      buisness_id: buisnessId
    };

    // Send the new package to server
    $.ajax({
      url: `/packages`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(pkg),
      success: function (resp) {
        $('#add-package-modal').addClass('hidden');
        showToast('Package added!');
        
        // Find full customer data
        const customer = getCustomerById(pkg.customer_id);
        
        // Make a full new package object
        const newPackage = {
          ...pkg,
          _id: resp._id,
          customer,
          start_date: new Date(pkg.start_date).toISOString(),
          eta: new Date(pkg.eta).toISOString(),
          path: []
        };

        insertPackageSorted(newPackage); // insert into list
        renderPackagesTable();           // show updated table
      },
      error: xhr => showToast(xhr.responseJSON?.error || 'Failed to add package', true)
    });

    return false; // stop page reload
  };

  // When user searches a location
  window.handleLocationSearch = function () {
    const location = $('#location-input').val();
    $('#location-suggestion').removeClass('hidden').html('Searching...');

    // Ask server to search this place
    $.ajax({
      url: '/location/search',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ location }),
      success: function (data) {
        // Show found result
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
      error: xhr => {
        console.error('Location search failed:', xhr);
        $('#location-suggestion').html(xhr.responseJSON?.error || 'Location not found');
      }
    });

    return false;
  };

  // Ask server to get all packages for this business
  function loadPackages() {
    $.ajax({
      url: `/packages/${buisnessId}`,
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        packages = data;
        renderPackagesTable(); // show them in table
      },
      error: () => showToast('Failed to load packages', true)
    });
  }

  // Get a customer by ID from list
  function getCustomerById(id) {
    return customers.find(c => c._id === id) || {};
  }

  // Put a new package in correct order by date
  function insertPackageSorted(newPackage) {
    let inserted = false;
    for (let i = 0; i < packages.length; i++) {
      if (new Date(newPackage.start_date) >= new Date(packages[i].start_date)) {
        packages.splice(i, 0, newPackage);
        inserted = true;
        break;
      }
    }
    if (!inserted) packages.push(newPackage);
  }

  // Show all packages in the table
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
            <a href="#" class="customer-link" data-id="${pkg.customer?._id || ''}">
              ${pkg.customer?.name || ''}
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

  // Fill customer dropdown list in form
  function loadCustomerDropdown() {
    $.ajax({
      url: '/customers',
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        customers = data;
        const $dropdown = $('#customer');
        $dropdown.empty().append('<option value="">Select customer...</option>');
        customers.forEach(cust => {
          $dropdown.append(`
            <option value="${cust._id}">
              ${cust.name} (${cust.email}) - ${cust.address.street} ${cust.address.number}, ${cust.address.city}
            </option>
          `);
        });
      },
      error: () => showToast('Failed to load customers', true)
    });
  }

  // --- EVENT HANDLERS ---

  // Show add form
  $('#add-package-top, #add-package-bottom').on('click', () => {
    loadCustomerDropdown();
    $('#add-package-modal').removeClass('hidden');
  });

  // Close add form
  $('#close-add-modal').on('click', () => {
    $('#add-package-modal').addClass('hidden');
    $('#package-form')[0].reset();
    $('#package-form').validate().resetForm();
  });

  // Show customer details modal
  $('#package-table').on('click', '.customer-link', function (e) {
    e.preventDefault();
    const custId = $(this).data('id');
    $.get('/customers', customers => {
      const cust = customers.find(c => c._id === custId);
      if (!cust) return showToast('Customer not found', true);
      $('#cust-name').text(cust.name);
      $('#cust-email').text(cust.email);
      $('#cust-address').html(`
        <li>${cust.address.street} ${cust.address.number}, ${cust.address.city}</li>
        ${cust.address.lat && cust.address.lon ? `<li>Lat: ${cust.address.lat}, Lon: ${cust.address.lon}</li>` : ''}
      `);
      $('#customer-modal').removeClass('hidden');
    });
  });

  $('#close-customer-modal').on('click', () => $('#customer-modal').addClass('hidden'));

  // Open modal to add location
  $('#package-table').on('click', '.add-location-btn', function () {
    const packageId = $(this).data('id');
    $('#location-modal').data('packageid', packageId).removeClass('hidden');
    $('#location-form')[0].reset();
    $('#location-suggestion').addClass('hidden');
  });

  $('#close-location-modal').on('click', () => $('#location-modal').addClass('hidden'));

  // Add location to package
  $('#location-suggestion').on('click', '#add-location-final', function () {
    const packageId = $('#location-modal').data('packageid');
    const lat = $('#location-suggestion').data('lat');
    const lon = $('#location-suggestion').data('lon');

    $.ajax({
      url: `/packages/${packageId}/path`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ lat, lon }),
      success: function () {
        $('#location-modal').addClass('hidden');
        showToast('Location added!');
        const pkg = packages.find(p => p._id === packageId);
        if (pkg) {
          pkg.path = pkg.path || [];
          pkg.path.push({ lat, lon });
        }
      },
      error: xhr => showToast(xhr.responseJSON?.error || 'Error', true)
    });
  });

  // Show path (all locations) for a package
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

  // Show map image of path
  $('#package-table').on('click', '.view-path-btn', function (e) {
    e.preventDefault();
    const packageId = $(this).data('id');
    $('#map-loader').show();
    $('#map-image').hide();
    $('#map-modal').removeClass('hidden');

    fetch(`/packages/${packageId}/staticmap`)
      .then(resp => {
        if (resp.headers.get('Content-Type').includes('application/json')) {
          return resp.json().then(json => {
            $('#map-loader').hide();
            $('#map-modal').addClass('hidden');
            showToast(json.message || 'No path data available', true);
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

  $('#close-map-modal').on('click', () => $('#map-modal').addClass('hidden'));

  // Close modals if click outside content
  $('.modal').on('mousedown', function (e) {
    if (e.target === this) {
      $(this).addClass('hidden');
      $(this).find('form').each(function () {
        this.reset && this.reset();
        $(this).validate && $(this).validate().resetForm();
      });
      $(this).find('.suggestion').addClass('hidden');
    }
  });

  // Show a small message popup
  function showToast(message, isError = false) {
    $('#toast').text(message).removeClass('hidden').toggleClass('error', isError);
    setTimeout(() => $('#toast').addClass('hidden'), 2200);
  }

  // Start everything
  loadPackages();          // get packages from server
  setupFormValidation();   // setup form validation rules
});
