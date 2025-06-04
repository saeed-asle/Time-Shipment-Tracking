// main.js
import { closeAddPackageModal, openEditModal, closeEditModal, openLocationModal, closeLocationModal ,openMapModal,closeMapModal,toggleModal } from './modal.js';
import { loadPackages } from './api.js';
import { bindGlobalEvents } from './events.js';

$(document).ready(() => {
  const pathParts = window.location.pathname.split('/');
  const companyId = parseInt(pathParts[pathParts.length - 1], 10);



  window.apiBase = `http://localhost:3001/buisness/${companyId}/packages`;
  window.closeAddPackageModal = closeAddPackageModal;
  
    window.openEditModal = openEditModal;
    window.closeEditModal = closeEditModal;
    window.openLocationModal = openLocationModal;
    window.closeLocationModal = closeLocationModal;
    window.openMapModal = openMapModal;
    window.closeMapModal = closeMapModal;
    window.toggleModal = toggleModal;

  bindGlobalEvents();
  loadPackages();
});
