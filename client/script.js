 $(document).ready(function () {
    const pathParts = window.location.pathname.split('/');
    const companyId = parseInt(pathParts[pathParts.length - 1], 10);

    if (!companyId || companyId < 1 || companyId > 10) {
        alert('Invalid company ID in URL. It should be from 1 to 10.');
        return;
    }

    const apiBase = `http://localhost:3001/buisness/${companyId}/packages`;

    // Fetch packages
    function loadPackages() {
        $.ajax({
            url: apiBase,
            method: 'GET',
            success: function (data) {
                const packages = data.companyPackages;

                // Flatten the packages and sort by open date descending
                const flattened = packages.map(p => Object.values(p)[0]);
                flattened.sort((a, b) => new Date(b.openDate) - new Date(a.openDate));

                const tbody = $('#packages-table tbody');
                tbody.empty();

                flattened.forEach(pkg => {
                    const row = $(`
                        <tr>
                            <td><a href="#" class="show-path" data-id="${pkg.id}">${pkg.id}</a></td>
                            <td>${pkg.sku}</td>
                            <td>${pkg.name}</td>
                            <td><a href="#" class="show-customer" data-info='${JSON.stringify(pkg.customer)}'>${pkg.customer.id}</a></td>
                            <td>${new Date(pkg.openDate).toLocaleString()}</td>
                            <td>${pkg.eta}</td>
                            <td>${pkg.status}</td>
                            <td>
                                <button class="btn edit-btn" data-id="${pkg.id}">Edit</button>
                                <button class="btn add-loc-btn" data-id="${pkg.id}">Add Location</button>
                                <button class="btn view-map-btn" data-id="${pkg.id}">View Map</button>
                            </td>
                        </tr>
                    `);
                    tbody.append(row);
                });
            },
            error: function () {
                alert('Failed to load packages');
            }
        });
    }

    loadPackages();

    // Customer info click
    $(document).on('click', '.show-customer', function (e) {
        e.preventDefault();
        const customer = JSON.parse($(this).data('info'));
        alert(`Customer Info:\nName: ${customer.name}\nEmail: ${customer.email}\nAddress: ${customer.address.street} ${customer.address.number}, ${customer.address.city}`);
    });

    // Show map path
    $(document).on('click', '.show-path, .view-map-btn', function (e) {
        e.preventDefault();
        const pkgId = $(this).data('id');

        $.get(`${apiBase}/${pkgId}`, function (res) {
            const pkg = Object.values(res.companyPackage)[0];
            if (!pkg.path || pkg.path.length === 0) {
                alert('No path available for this package.');
                return;
            }

            const markers = pkg.path.map((loc, i) =>
                `lonlat:${loc.lon},${loc.lat};type:material;color:%231f63e6;size:x-large;text:${i + 1};icon:cloud;icontype:awesome;whitecircle:no`
            ).join('|');

            const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&zoom=12&marker=${markers}&apiKey=YOUR_GEOAPIFY_API_KEY`;
            window.open(mapUrl, '_blank');
        });
    });

    // Add location to path
    $(document).on('click', '.add-loc-btn', function () {
        const pkgId = $(this).data('id');
        const search = prompt('Enter location (e.g., Tel Aviv, Israel):');
        if (!search) return;

        $.get('https://us1.locationiq.com/v1/search.php', {
            key: 'pk.48c5c27b04afcdea04306cb5a825c7f9',
            q: search,
            format: 'json'
        }).done(data => {
            const { lat, lon } = data[0];
            $.ajax({
                url: `${apiBase}/${pkgId}/path`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ lat: parseFloat(lat), lon: parseFloat(lon) }),
                success: () => {
                    alert('Location added.');
                    loadPackages();
                },
                error: () => alert('Failed to add location.')
            });
        }).fail(() => {
            alert('Location not found. Try again.');
        });
    });

    // Edit package (ETA + status)
    $(document).on('click', '.edit-btn', function () {
        const pkgId = $(this).data('id');
        const newEta = prompt('Enter new ETA (YYYY-MM-DD):');
        const newStatus = prompt('Enter new status:');

        if (!newEta || !newStatus) return;

        $.ajax({
            url: `${apiBase}/${pkgId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ eta: newEta, status: newStatus }),
            success: () => {
                alert('Package updated');
                loadPackages();
            },
            error: () => alert('Update failed')
        });
    });

    // Add package buttons
    $('#add-package-top, #add-package-bottom').on('click', function () {
        window.location.href = `/add-package.html?companyId=${companyId}`;
    });
});
