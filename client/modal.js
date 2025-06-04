//./modal.js
let currentEditPkgId = null;
let currentLocationPkgId = null;

export function openEditModal(pkgId, eta, status) {
  currentEditPkgId = pkgId;
  $('#edit-eta').val(new Date(eta).toISOString().split('T')[0]);
  $('#edit-status').val(status);
  $('#edit-modal').removeClass('hidden');
}

export function closeEditModal() {
  $('#edit-modal').addClass('hidden');
  currentEditPkgId = null;
  $('#edit-form')[0].reset();
}

export function openLocationModal(pkgId) {
  currentLocationPkgId = pkgId;
  $('#location-input').val('');
  $('#location-modal').removeClass('hidden');
}

export function closeLocationModal() {
  $('#location-modal').addClass('hidden');
  $('#location-suggestion').html('').addClass('hidden');
  currentLocationPkgId = null;
  $('#location-form')[0].reset();
}
export function getCurrentLocationPkgId() {
  return currentLocationPkgId;
}
export function toggleModal(modalId, show) {
  if (show) {
    $('#' + modalId).removeClass('hidden');
  } else {
    $('#' + modalId).addClass('hidden');
  }
}

export function openMapModal() {
  $('#map-modal').removeClass('hidden');
  $('#map-loader').show();
  $('#map-image').hide();
}

export function closeMapModal() {
  $('#map-modal').addClass('hidden');
  $('#map-loader').hide();
}


$(document).on('click', '.close-btn', function () {
  $(this).closest('.modal').addClass('hidden');
});

$(document).on('click', '.modal', function (event) {
  if (event.target === this) {
    $(this).addClass('hidden');
  }
});
export function closeAddPackageModal() {
  $('#add-package-modal').addClass('hidden');
  $('#package-form')[0].reset();  
}

window.closeAddPackageModal = closeAddPackageModal;

window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.openLocationModal = openLocationModal;
window.closeLocationModal = closeLocationModal;
window.openMapModal = openMapModal;
window.closeMapModal = closeMapModal;
window.toggleModal = toggleModal;
