//api.js
import { showToast, updatePackageRow, appendPackageRow } from './ui.js';

export function loadPackages() { 
    $.ajax({
        url: apiBase,
        method: 'GET',
        success: (data) => {
            const packages = data.companyPackages.map(p => Object.values(p)[0]);
            packages.sort((a, b) => new Date(b.openDate) - new Date(a.openDate));

            const container = $('#package-list tbody').empty();

            if (packages.length === 0) {
                const row = $(`
                    <tr>
                        <td colspan="8" style="text-align: center; color: #888;">
                            No packages available
                        </td>
                    </tr>
                `);
                container.append(row);
            } else {
                packages.forEach(pkg => appendPackageRow(pkg, container));
            }
        },
        error: (xhr) => {
            const msg = xhr.responseJSON?.error || 'Failed to load packages';
            showToast(msg, 'error');
        }
    });
}


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


export function fetchStaticMap(packageId) {
  return $.ajax({
    url: `${apiBase}/${packageId}/staticmap`,
    method: 'GET',
    error: (xhr) => {
      showToast(xhr.responseJSON?.error || 'Failed to load map', 'error');
    }
  });
}

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
