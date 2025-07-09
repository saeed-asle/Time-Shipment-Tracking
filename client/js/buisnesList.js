$(document).ready(function () {
  let buisnesList = [];

  function showToast(message, isError = false) {
    $('#toast').text(message).removeClass('hidden').toggleClass('error', isError);
    setTimeout(() => $('#toast').addClass('hidden'), 2000);
  }

  function renderBuisnesTable() {
    const tbody = $('#buisnes-table tbody');
    tbody.empty();
    if (!buisnesList.length) {
      tbody.append('<tr><td colspan="3" style="text-align:center; color:#aaa;">No businesses found</td></tr>');
    } else {
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

  function loadBuisnesList() {
    $.ajax({
      url: '/buisness',
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        buisnesList = data;
        renderBuisnesTable();
      },
      error: function () {
        showToast('Failed to load businesses', true);
      }
    });
  }

  // --- BUISNES MODAL ---
  $('#add-buisnes-top, #add-buisnes-bottom').on('click', function () {
    $('#add-buisnes-modal').removeClass('hidden');
  });

  $('#close-add-modal').on('click', function () {
    $('#add-buisnes-modal').addClass('hidden');
    $('#buisnes-form')[0].reset();
    $('#buisnes-form').validate().resetForm();
  });

  $('#buisnes-form').validate({
    submitHandler: function () {
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
            name: $('#buisnes-name').val(),
            site_url: $('#buisnes-website').val(),
            __v: 0
          });
          renderBuisnesTable();
          $('#buisnes-form')[0].reset();
          $('#buisnes-form').validate().resetForm();
        },
        error: function (xhr) {
          let err = xhr.responseJSON && xhr.responseJSON.error
            ? (typeof xhr.responseJSON.error === 'string'
                ? xhr.responseJSON.error
                : Object.values(xhr.responseJSON.error).map(e=>e.message).join(', '))
            : 'Unknown error';
          showToast('Failed to add buisnes: ' + err, true);
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
  loadBuisnesList();
});
