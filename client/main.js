import { loadPackages } from './api.js';
import { bindGlobalEvents } from './events.js';
import { setupFormValidation } from './validator.js';

$(document).ready(() => {
  const pathParts = window.location.pathname.split('/');
  const companyId = parseInt(pathParts[pathParts.length - 1], 10);

  if (isNaN(companyId) || companyId < 1 || companyId > 10) {
    $('.container')
      .html(`
        <div style="text-align:center; margin-top:80px; font-size:1.5rem; color: red;">
          Invalid Company Id
        </div>
      `)
      .show();  // show container with error message

    return; // stop further execution
  }

  // valid companyId
  $('.container').show();

  window.apiBase = `http://localhost:3001/buisness/${companyId}/packages`;

  bindGlobalEvents();
  setupFormValidation();
  loadPackages();
});
