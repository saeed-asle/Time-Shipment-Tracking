// Modal control and state management module

let currentEditPkgId = null;
let currentLocationPkgId = null;

// Open edit modal and populate with package's ETA and status
export function openEditModal(pkgId, eta, status) {
  currentEditPkgId = pkgId;
  const etaDateStr = new Date(eta * 1000).toISOString().split('T')[0]; // Convert Unix to YYYY-MM-DD
  $('#edit-eta').val(etaDateStr).data('original', etaDateStr);
  $('#edit-status').val(status).data('original', status);
  $('#edit-modal')
    .data('id', pkgId)
    .data('eta', eta)
    .data('status', status)
    .removeClass('hidden');
}

// Close the edit modal and reset form
export function closeEditModal() {
  $('#edit-modal').addClass('hidden');
  currentEditPkgId = null;
  $('#edit-form')[0].reset();
}

// Open location modal for given package
export function openLocationModal(pkgId) {
  currentLocationPkgId = pkgId;
  $('#location-input').val('');
  $('#location-modal').removeClass('hidden');
}

// Close location modal and clear suggestions
export function closeLocationModal() {
  $('#location-modal').addClass('hidden');
  $('#location-suggestion').html('').addClass('hidden');
  currentLocationPkgId = null;
  $('#location-form')[0].reset();
}

// Get package ID currently associated with location modal
export function getCurrentLocationPkgId() {
  return currentLocationPkgId;
}

// General-purpose modal toggler
export function toggleModal(modalId, show) {
  if (show) {
    $('#' + modalId).removeClass('hidden');
  } else {
    $('#' + modalId).addClass('hidden');
  }
}

// Open map modal (with loader)
export function openMapModal() {
  $('#map-modal').removeClass('hidden');
  $('#map-loader').show();
  $('#map-image').hide();
}

// Close map modal and hide loader
export function closeMapModal() {
  $('#map-modal').addClass('hidden');
  $('#map-loader').hide();
}

// Close modal on 'x' button click
$(document).on('click', '.close-btn', function () {
  $(this).closest('.modal').addClass('hidden');
});

// Close modal when clicking outside modal content
$(document).on('click', '.modal', function (event) {
  if (event.target === this) {
    $(this).addClass('hidden');
  }
});

// Close "Add Package" modal and reset form
export function closeAddPackageModal() {
  $('#add-package-modal').addClass('hidden');
  $('#package-form')[0].reset();
}

// Expose functions globally (for direct access from HTML if needed)
window.closeAddPackageModal = closeAddPackageModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.openLocationModal = openLocationModal;
window.closeLocationModal = closeLocationModal;
window.openMapModal = openMapModal;
window.closeMapModal = closeMapModal;
window.toggleModal = toggleModal;
