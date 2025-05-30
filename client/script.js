$(document).ready(function () {
    const pathParts = window.location.pathname.split('/');
    const companyId = parseInt(pathParts[pathParts.length - 1], 10);

    if (!companyId || companyId < 1 || companyId > 10) {
        alert('Invalid company ID in URL. It should be from 1 to 10.');
        return;
    }

    const apiBase = `http://localhost:3001/buisness/${companyId}/packages`;
    let currentEditPkgId = null;
    let currentLocationPkgId = null;

    function loadPackages() {
        $.ajax({
            url: apiBase,
            method: 'GET',
            success: function (data) {
                const packages = data.companyPackages.map(p => Object.values(p)[0]);
                packages.sort((a, b) => new Date(b.openDate) - new Date(a.openDate));
                const container = $('#package-list tbody').empty();

                packages.forEach(pkg => {
                    const eta = new Date(pkg.eta).toLocaleDateString();
                    const startDate = new Date(pkg.start_date).toLocaleString();
                    const customer = encodeURIComponent(JSON.stringify(pkg.customer));
                    const path = encodeURIComponent(JSON.stringify(pkg.path || []));

                    const row = $(`
                        <tr>
                            <td><a href="#" class="show-path" data-path="${path}">${pkg.id}</a></td>
                            <td>${pkg.prod_id}</td>
                            <td>${pkg.name}</td>
                            <td><a href="#" class="show-customer" data-info="${customer}">${pkg.customer.id}</a></td>
                            <td>${startDate}</td>
                            <td>${eta}</td>
                            <td>${pkg.status}</td>
                            <td>
                                <button class="btn edit-btn" data-id="${pkg.id}" data-eta="${pkg.eta}" data-status="${pkg.status}">✏️</button>
                                <button class="btn add-loc-btn" data-id="${pkg.id}">📍</button>
                                <button class="btn view-map-btn" data-id="${pkg.id}">🗺️</button>
                            </td>
                        </tr>
                    `);

                    container.append(row);
                });
            },
            error: function () {
                alert('Failed to load packages');
            }
        });
    }

    function showCustomerInfo(event) {
        event.preventDefault();
        const customer = JSON.parse(decodeURIComponent($(this).data('info')));
        $('#cust-name').text(customer.name);
        $('#cust-email').text(customer.email);
        $('#cust-address').text(`${customer.address.street} ${customer.address.number}, ${customer.address.city}`);
        $('#customer-modal').removeClass('hidden');
    }

    function showPathInfo(event) {
        event.preventDefault();
        const pathArray = JSON.parse(decodeURIComponent($(this).data('path')));
        const container = $('#path-details');
        if (!pathArray.length) {
            container.html('<p>No path data available.</p>');
        } else {
            container.html(pathArray.map((p, i) =>
                `<p><strong>Step ${i + 1}:</strong> Lat: ${p.lat}, Lon: ${p.lon}</p>`
            ).join(''));
        }
        $('#path-modal').removeClass('hidden');
    }

    function viewMap(event) {
        event.preventDefault();
        const pkgId = $(this).data('id');
        window.open(`${apiBase}/${pkgId}/staticmap`, '_blank');
    }

    function openEditModal(pkgId, eta, status) {
        currentEditPkgId = pkgId;
        $('#edit-eta').val(new Date(eta).toISOString().split('T')[0]);
        $('#edit-status').val(status);
        $('#edit-modal').removeClass('hidden');
    }

    function closeEditModal() {
        $('#edit-modal').addClass('hidden');
        currentEditPkgId = null;
        $('#edit-form')[0].reset();
    }

    function openLocationModal(pkgId) {
        currentLocationPkgId = pkgId;
        $('#location-input').val('');
        $('#location-modal').removeClass('hidden');
    }

function closeLocationModal() {
    $('#location-modal').addClass('hidden');
    $('#location-suggestion').html('').addClass('hidden');
    currentLocationPkgId = null;
    $('#location-form')[0].reset();
}


    function addLocation() {
        const pkgId = $(this).data('id');
        openLocationModal(pkgId);
    }

    $('#edit-form').on('submit', function (e) {
        e.preventDefault();
        if (!currentEditPkgId) return;

        const eta = $('#edit-eta').val();
        const status = $('#edit-status').val();

        const update = {};
        if (eta) update.eta = eta;
        if (status) update.status = status;

        $.ajax({
            url: `${apiBase}/${currentEditPkgId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(update),
            success: () => {
                closeEditModal();
                loadPackages();
            },
            error: () => alert('Update failed')
        });
    });

$('#location-form').on('submit', function (e) {
    e.preventDefault();
    const location = $('#location-input').val().trim();
    if (!location || !currentLocationPkgId) return;

    $('#location-form button').prop('disabled', true).text('Searching...');

    $.ajax({
        url: `${apiBase}/${currentLocationPkgId}/path/search`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ location }),
  success: (data) => {
    const $suggestion = $('#location-suggestion');
    $suggestion
        .html(`
            <strong>Found:</strong> ${data.address}<br>
            <strong>Lat:</strong> ${data.lat}, <strong>Lon:</strong> ${data.lon}<br>
            <button type="button" id="confirm-location" class="btn small">Confirm</button>
        `)
        .removeClass('hidden')
        .addClass('visible');

    $('#confirm-location').on('click', () => {
        $.ajax({
            url: `${apiBase}/${currentLocationPkgId}/path`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ lat: data.lat, lon: data.lon }),
            success: () => {
                closeLocationModal();
                loadPackages();
            },
            error: () => alert('Failed to add location.')
        });
    });
},

        error: (xhr) => {
            const errMsg = xhr.responseJSON?.error || 'Search failed.';
            alert(errMsg);
        },
        complete: () => {
            $('#location-form button').prop('disabled', false).text('Add');
        }
    });
});
$('#package-form').validate({
    submitHandler: function (form) {
        const todayStr = new Date().toISOString().split('T')[0];
        const startDateStr = form.start_date.value.trim();
        const etaStr = form.eta.value.trim();

        const startDate = startDateStr ? new Date(startDateStr) : new Date();
        const etaDate = new Date(etaStr);

        if (startDateStr && startDateStr !== todayStr) {
            alert("Start Date must be today's date.");
            return;
        }

        if (etaDate < startDate) {
            alert("ETA must be today or after the Start Date.");
            return;
        }

        const formData = {
            prod_id: form.prod_id.value,
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
            start_date: startDateStr || todayStr,
            eta: etaStr,
            status: form.status.value
        };

        $.ajax({
            url: apiBase,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: () => {
                alert('Package added!');
                closeAddModal();
                loadPackages();
            },
            error: (xhr) => {
                alert(`Failed to add package.\n${xhr.responseJSON?.error || 'Unknown error'}`);
            }
        });
    }
});


function openAddModal() {
    $('#add-package-modal').removeClass('hidden');
}

function closeAddModal() {
    $('#add-package-modal').addClass('hidden');
    $('#package-form')[0].reset();
}

$('#add-package-top, #add-package-bottom').on('click', openAddModal);
$('#close-add-modal').on('click', closeAddModal);
$('#add-package-modal').on('click', function (e) {
    if (e.target === this) closeAddModal();
});


    $(document).on('click', '.show-customer', showCustomerInfo);
    $(document).on('click', '.show-path', showPathInfo);
    $(document).on('click', '.view-map-btn', viewMap);
    $(document).on('click', '.add-loc-btn', addLocation);
    $(document).on('click', '.edit-btn', function () {
        const pkgId = $(this).data('id');
        const eta = $(this).data('eta');
        const status = $(this).data('status');
        openEditModal(pkgId, eta, status);
    });

    $('#close-edit-modal').on('click', closeEditModal);
    $('#edit-modal').on('click', function (e) {
        if (e.target === this) closeEditModal();
    });

    $('#close-location-modal').on('click', closeLocationModal);
    $('#location-modal').on('click', function (e) {
        if (e.target === this) closeLocationModal();
    });

    $('#close-path-modal').on('click', () => $('#path-modal').addClass('hidden'));
    $('#path-modal').on('click', function (e) {
        if (e.target === this) $(this).addClass('hidden');
    });

    $(document).on('click', '.close-btn', function () {
        $('#customer-modal').addClass('hidden');
    });

    $(document).on('click', '#customer-modal', function (e) {
        if (e.target === this) {
            $(this).addClass('hidden');
        }
    });

    loadPackages();
});
