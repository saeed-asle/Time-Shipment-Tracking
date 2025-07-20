import { setupBuisnesValidation, setupCustomerValidation } from './buisnesValidation.js';

// Wait for the page to fully load
$(document).ready(function () {
  setupBuisnesValidation(); // setup rules for business form
  setupCustomerValidation(); // setup rules for customer form

  let buisnesList = []; // store all businesses

  // Show a small message (toast) on screen
  function showToast(message, isError = false) {
    $('#toast').text(message).removeClass('hidden').toggleClass('error', isError);
    setTimeout(() => $('#toast').addClass('hidden'), 2000); // hide after 2 seconds
  }

  // Draw the table with business info
  function renderBuisnesTable() {
    const tbody = $('#buisnes-table tbody');
    tbody.empty();

    if (!buisnesList.length) {
      // If list is empty
      tbody.append('<tr><td colspan="3" style="text-align:center; color:#aaa;">No businesses found</td></tr>');
    } else {
      // For each business, add a row
      buisnesList.forEach(buisnes => {
        tbody.append(`
          <tr>
            <td>${buisnes._id}</td>
            <td>
              <a href="/list/${buisnes._id}" class="buisnes-link">${buisnes.name}</a>
            </td>
            <td>
              <a href="${buisnes.site_url}" target="_blank" rel="noopener noreferrer">${buisnes.site_url}</a>
            </td>
          </tr>
        `);
      });
    }
  }

  // Load all businesses from the server
  function loadBuisnesList() {
    $.ajax({
      url: '/buisness',
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        buisnesList = data;
        renderBuisnesTable(); // draw the table
      },
      error: function () {
        showToast('Failed to load businesses', true); // show error
      }
    });
  }

  // --- BUISNESS FORM LOGIC ---

  // When top or bottom "Add Business" button is clicked
  $('#add-buisnes-top, #add-buisnes-bottom').on('click', function () {
    $('#add-buisnes-modal').removeClass('hidden');
  });

  // Close the business modal
  $('#close-add-modal').on('click', function () {
    $('#add-buisnes-modal').addClass('hidden');
    $('#buisnes-form')[0].reset(); // clear fields
    $('#buisnes-form').validate().resetForm(); // clear errors
  });

  // Handle business form submission
  window.handleBuisnesSubmit = function () {
    const formData = {
      name: $('#buisnes-name').val(),
      site_url: $('#buisnes-website').val()
    };

    $.ajax({
      url: '/buisness',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(formData),
      success: function (resp) {
        $('#add-buisnes-modal').addClass('hidden');
        showToast('Buisnes added!');
        buisnesList.push({
          _id: resp._id,
          name: formData.name,
          site_url: formData.site_url
        });
        renderBuisnesTable(); // update table
        $('#buisnes-form')[0].reset();
        $('#buisnes-form').validate().resetForm();
      },
      error: function (xhr) {
        const err = xhr.responseJSON?.error
          ? (typeof xhr.responseJSON.error === 'string'
              ? xhr.responseJSON.error
              : Object.values(xhr.responseJSON.error).map(e => e.message).join(', '))
          : 'Unknown error';
        showToast('Failed to add buisnes: ' + err, true);
      }
    });

    return false; // stop default form action
  };

  // --- CUSTOMER FORM LOGIC ---

  // Show customer modal
  $('#add-customer-top, #add-customer-bottom').on('click', function () {
    $('#add-customer-modal').removeClass('hidden');
  });

  // Close customer modal
  $('#close-customer-modal').on('click', function () {
    $('#add-customer-modal').addClass('hidden');
    $('#customer-form')[0].reset();
    $('#customer-form').validate().resetForm();
  });

  // Handle customer form submission
  window.handleCustomerSubmit = function () {
    const customerData = {
      name: $('#customer-name').val(),
      email: $('#customer-email').val(),
      address: {
        street: $('#customer-street').val(),
        number: parseInt($('#customer-number').val(), 10),
        city: $('#customer-city').val()
      }
    };

    $.ajax({
      url: '/customers',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(customerData),
      success: function () {
        $('#add-customer-modal').addClass('hidden');
        showToast('Customer added!');
        $('#customer-form')[0].reset();
        $('#customer-form').validate().resetForm();
      },
      error: function (xhr) {
        const err = xhr.responseJSON?.error
          ? (typeof xhr.responseJSON.error === 'string'
              ? xhr.responseJSON.error
              : Object.values(xhr.responseJSON.error).map(e => e.message).join(', '))
          : 'Unknown error';
        showToast('Failed to add customer: ' + err, true);
      }
    });

    return false;
  };

  // Show the main page content and load businesses
  $('.container').show();
  loadBuisnesList();
});
