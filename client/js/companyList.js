$(document).ready(function () {
  let companies = [];

  function showToast(message, isError = false) {
    $('#toast').text(message).removeClass('hidden').toggleClass('error', isError);
    setTimeout(() => $('#toast').addClass('hidden'), 2000);
  }

  function renderCompaniesTable() {
    const tbody = $('#company-table tbody');
    tbody.empty();
    if (!companies.length) {
      tbody.append('<tr><td colspan="3" style="text-align:center; color:#aaa;">No companies found</td></tr>');
    } else {
      companies.forEach(company => {
        tbody.append(`
          <tr>
            <td>${company._id}</td>
            <td>
              <a href="/list/${company._id}" class="company-link">${company.name}</a>
            </td>
            <td>
              <a href="${company.website}" target="_blank" rel="noopener noreferrer">${company.website}</a>
            </td>
          </tr>
        `);
      });
    }
  }

  function loadCompanies() {
    $.ajax({
      url: '/companies',
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        companies = data;
        renderCompaniesTable();
      },
      error: function () {
        showToast('Failed to load companies', true);
      }
    });
  }

  // --- COMPANY MODAL ---
  $('#add-company-top, #add-company-bottom').on('click', function () {
    $('#add-company-modal').removeClass('hidden');
  });

  $('#close-add-modal').on('click', function () {
    $('#add-company-modal').addClass('hidden');
    $('#company-form')[0].reset();
    $('#company-form').validate().resetForm();
  });

  $('#company-form').validate({
    submitHandler: function (form) {
      const formData = {
        name: $('#company-name').val(),
        website: $('#company-website').val()
      };
      $.ajax({
        url: '/companies',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (resp) {
          $('#add-company-modal').addClass('hidden');
          showToast('Company added!');
          // Add manually to array
          companies.push({
            _id: resp.id,
            name: $('#company-name').val(),
            website: $('#company-website').val(),
            __v: 0
          });
          renderCompaniesTable();
          $('#company-form')[0].reset();
          $('#company-form').validate().resetForm();
        },
        error: function (xhr) {
          let err = xhr.responseJSON && xhr.responseJSON.error
            ? (typeof xhr.responseJSON.error === 'string'
                ? xhr.responseJSON.error
                : Object.values(xhr.responseJSON.error).map(e=>e.message).join(', '))
            : 'Unknown error';
          showToast('Failed to add company: ' + err, true);
        }
      });
      return false; 
    }
  });

  // --- CUSTOMER MODAL ---
  $('#add-customer-top, #add-customer-bottom').on('click', function () {
    $('#add-customer-modal').removeClass('hidden');
  });

  $('#close-customer-modal').on('click', function () {
    $('#add-customer-modal').addClass('hidden');
    $('#customer-form')[0].reset();
    $('#customer-form').validate().resetForm();
  });

  $('#customer-form').validate({
    submitHandler: function () {
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
          let err = xhr.responseJSON && xhr.responseJSON.error
            ? (typeof xhr.responseJSON.error === 'string'
                ? xhr.responseJSON.error
                : Object.values(xhr.responseJSON.error).map(e=>e.message).join(', '))
            : 'Unknown error';
          showToast('Failed to add customer: ' + err, true);
        }
      });
      return false;
    }
  });

  $('.container').show();
  loadCompanies();
});
