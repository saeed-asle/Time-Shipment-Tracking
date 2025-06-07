// Handles all AJAX calls to backend and updates UI accordingly
import { showToast, updatePackageRow, appendPackageRow, renderPackageRow } from './ui.js';


/**
 * loadPackages
 * Load all packages from server and show in table
 * Parameters: none
 * Return: none
 */
export function loadPackages() {
  $.ajax({
    url: apiBase,
    method: 'GET',
    success: (data) => {
      const packages = data.map(p => Object.values(p)[0]); // Flatten objects to values
      packages.sort((a, b) => b.start_date - a.start_date); // Sort by start_date descending

      const container = $('#package-list tbody').empty();

      if (packages.length === 0) {
        // Show message when no packages exist
        container.append(`
          <tr>
            <td colspan="8" style="text-align: center; color: #888;">
              No packages available
            </td>
          </tr>
        `);
      } else {
        // Render each package
        packages.forEach(pkg => appendPackageRow(pkg, container));
      }
    },
    error: (xhr) => {
      const msg = xhr.responseJSON?.error || 'Failed to load packages';
      showToast(msg, 'error');
    }
  });
}

/**
 * getPackage
 * Load one package from server by ID and add it to the table in right position
 * @param {string|number} packageId - ID of the package
 * @returns {jqXHR} - AJAX object
 */
export function getPackage(packageId) {
  return $.ajax({
    url: `${apiBase}/${packageId}`,
    method: 'GET',
    success: (pkgData) => {
      const pkg = Object.values(pkgData)[0];
      const container = $('#package-list tbody');

      // Remove placeholder row if present
      container.find('td[colspan="8"]').closest('tr').remove();

      const newRow = renderPackageRow(pkg);
      const newStart = new Date(pkg.start_date * 1000);

      let inserted = false;

      // Insert in correct sorted position
      container.find('tr').each(function () {
        const cell = $(this).find('td').eq(4);
        const existingStartRaw = parseInt(cell.data('start'));
        const existingStart = new Date(existingStartRaw * 1000);

        if (newStart >= existingStart) {
          $(this).before(newRow);
          inserted = true;
          return false;
        }
      });

      if (!inserted) {
        container.append(newRow); // Append if it's the latest
      }
    },
    error: (xhr) => {
      showToast(xhr.responseJSON?.error || 'Failed to load package', 'error');
    }
  });
}

/**
 * addPackage
 * Send a new package to the server
 * @param {object} data - package info to add
 * @param {function} successCb - function to run if add success
 * @returns {void}
 */

export function addPackage(data, successCb) {
  $.ajax({
    url: apiBase,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: successCb,
    error: (xhr) => {
      showToast(`Failed to add package. ${xhr.responseJSON?.error || 'Unknown error'}`, 'error');
    }
  });
}

/**
 * updatePackage
 * Update a package's ETA or status
 * @param {string|number} id - package ID
 * @param {object} update - updated values (eta, status)
 * @param {function} successCb - function to run on success
 * @returns {void}
 */
export function updatePackage(id, update, successCb) {
  $.ajax({
    url: `${apiBase}/${id}`,
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(update),
    success: (res) => {
      showToast(res.message || 'Updated successfully', 'success');
      updatePackageRow(id, update);
      successCb();
    },
    error: (xhr) => {
      showToast(xhr.responseJSON?.error || 'Update failed', 'error');
    }
  });
}

/**
 * searchLocation
 * Find a location by name for a package (used before adding it to path)
 * @param {string|number} pkgId - package ID
 * @param {string} location - location name to search
 * @param {function} successCb - run when search success
 * @param {function} errorCb - run if search fails
 * @returns {void}
 */
export function searchLocation(pkgId, location, successCb, errorCb) {
  $.ajax({
    url: `${apiBase}/${pkgId}/path/search`,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ location }),
    success: successCb,
    error: (xhr) => {
      const msg = xhr.responseJSON?.error || 'Failed to find location';
      showToast(msg, 'error');
      if (errorCb) errorCb(msg);
    }
  });
}

/**
 * confirmLocation
 * Add latitude and longitude to a package's path
 * @param {string|number} pkgId - package ID
 * @param {number} lat - latitude
 * @param {number} lon - longitude
 * @param {function} successCb - run on success
 * @param {function} errorCb - run on error
 * @returns {void}
 */
export function confirmLocation(pkgId, lat, lon, successCb, errorCb) {
  $.ajax({
    url: `${apiBase}/${pkgId}/path`,
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ lat, lon }),
    success: successCb,
    error: (xhr) => {
      const msg = xhr.responseJSON?.error || 'Location already exists';
      showToast(msg, 'error');
      if (errorCb) errorCb(msg);
    }
  });
}
