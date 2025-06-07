// Displays a toast notification with customizable message, type, and duration
export function showToast(message, type = 'default', duration = 3000) {
    const $toast = $('#toast');
    $toast
        .removeClass('hidden success error')
        .addClass(type === 'success' ? 'success' : type === 'error' ? 'error' : '')
        .text(message)
        .removeClass('hidden');

    setTimeout(() => {
        $toast.addClass('hidden').removeClass('success error');
    }, duration);
}

export function appendPackageRow(pkg, container) {
  const row = renderPackageRow(pkg);
  container.append(row);
}

// Appends a new package row to the given container  table body)
export function renderPackageRow(pkg) {
  const eta = new Date(pkg.eta * 1000).toLocaleDateString(); // Only date
  const startDate = new Date(pkg.start_date * 1000).toLocaleDateString(); // Only date, no time
  // Creates a jQuery DOM row element for a package with buttons and data
  const customer = encodeURIComponent(JSON.stringify(pkg.customer));
  const path = encodeURIComponent(JSON.stringify(pkg.path || []));

  return $(`
    <tr>
      <td><a href="#" class="show-path" data-path="${path}">${pkg.id}</a></td>
      <td>${pkg.prod_id}</td>
      <td>${pkg.name}</td>
      <td><a href="#" class="show-customer" data-info="${customer}">${pkg.customer.id}</a></td>
      <td data-start="${pkg.start_date}">${startDate}</td>
      <td>${eta}</td>
      <td>${pkg.status}</td>
      <td>
        <button class="btn edit-btn" data-id="${pkg.id}" data-eta="${pkg.eta}" data-status="${pkg.status}">Edit</button>
        <button class="btn add-loc-btn" data-id="${pkg.id}">Add Location</button>
        <button class="btn view-map-btn" data-id="${pkg.id}">Map</button>
      </td>
    </tr>
  `);
}


// Updates an existing row with new ETA or status values

export function updatePackageRow(id, update) {
    const row = $(`#package-list tbody tr`).filter(function () {
        return $(this).find('td:first a').text() == id;
    });

    if (!row.length) return;

    if (update.eta) { // Update ETA column 
        const etaFormatted = new Date(update.eta * 1000).toLocaleDateString();
        row.find('td').eq(5).text(etaFormatted);
        $(`.edit-btn[data-id="${id}"]`).data('eta', update.eta);
    }

    if (update.status) {  // Update status column
        row.find('td').eq(6).text(update.status);
        $(`.edit-btn[data-id="${id}"]`).data('status', update.status);
    }
}
// Loads and shows a map image, handles load and error feedback
export function showMapImage(url) {
  const $img = $('#map-image');

  $img
    .attr('src', url)
    .off('load error')
    .on('load', () => {
      $('#map-loader').hide();
      $img.fadeIn();
    })
    .on('error', () => {
      $('#map-loader').hide();
      $('#map-modal').addClass('hidden');
      showToast('Failed to load map image', 'error');
    });
}