// Entry point script: runs after DOM is fully loaded
import { loadPackages } from './api.js';
import { bindGlobalEvents } from './events.js';
import { setupFormValidation } from './validator.js';

$(document).ready(() => {
  const pathParts = window.location.pathname.split('/');
  const companyId = parseInt(pathParts[pathParts.length - 1], 10); // Extract last path segment as companyId

  // Validate company ID is within expected range
  if (isNaN(companyId) || companyId < 1 || companyId > 10) {
    $('.container')
      .html(`
        <div style="text-align:center; margin-top:80px; font-size:1.5rem; color: red;">
          Invalid Company Id
        </div>
      `)
      .show();
    return;
  }

  $('.container').show(); // Display main container if ID is valid

  // Set global API base for AJAX calls
  window.apiBase = `http://localhost:3001/buisness/${companyId}/packages`;

  bindGlobalEvents();       // Attach event listeners (clicks, form submissions, etc.)
  setupFormValidation();    // Set up jQuery validation rules
  loadPackages();           // Fetch and render package data
});
