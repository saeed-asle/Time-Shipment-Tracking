export function setupFormValidation() {
  // --- Custom Rule: ETA must be same or after start date ---
  $.validator.addMethod('etaAfterStart', function (value, element, paramSelector) {
    const startDate = new Date($(paramSelector).val()); // get start date
    const etaDate = new Date(value);                    // get ETA
    return !isNaN(startDate) && !isNaN(etaDate) && etaDate >= startDate;
  }, 'ETA must be the same day or after the start date');

  // --- Custom Rule: Only English letters, numbers, and symbols ---
  $.validator.addMethod('englishOnly', function (value, element) {
    return this.optional(element) || /^[A-Za-z0-9 ,.'\-]+$/.test(value);
  }, 'Use only English letters, numbers, spaces, and punctuation.');

  // --- Custom Rule: URL must start with http:// or https:// ---
  $.validator.addMethod('requireHttp', function (value) {
    return /^https?:\/\/.+/.test(value);
  }, 'URL must start with http:// or https://');

  // === PACKAGE FORM VALIDATION ===
  if ($('#package-form').length) {
    $('#package-form').validate({
      rules: {
        prod_id: { required: true, minlength: 3, englishOnly: true },
        name: { required: true, minlength: 2, englishOnly: true },
        customer_id: { required: true },
        start_date: { required: true, date: true },
        eta: { required: true, date: true, etaAfterStart: '#start_date' },
        status: { required: true }
      },
      messages: {
        prod_id: {
          required: 'SKU is required',
          minlength: 'SKU must be at least 3 characters'
        },
        name: {
          required: 'Product name is required',
          minlength: 'Name must be at least 2 characters'
        },
        customer_id: 'Customer is required',
        start_date: {
          required: 'Start date is required',
          date: 'Enter a valid date'
        },
        eta: {
          required: 'ETA is required',
          date: 'Enter a valid date',
          etaAfterStart: 'ETA must be same or after start date'
        },
        status: 'Status is required'
      },
      submitHandler: window.handleAddSubmit || function (form) {
        form.submit(); // if form is valid, submit
      }
    });
  }

  // === COMPANY FORM VALIDATION ===
  if ($('#company-form').length) {
    $('#company-form').validate({
      rules: {
        name: { required: true, minlength: 2, englishOnly: true },
        site_url: { required: true, url: true, requireHttp: true }
      },
      messages: {
        name: {
          required: 'Company name is required',
          minlength: 'Name must be at least 2 characters'
        },
        site_url: {
          required: 'Website is required',
          url: 'Enter a valid URL',
          requireHttp: 'URL must start with http:// or https://'
        }
      },
      submitHandler: window.handleCompanySubmit || function (form) {
        form.submit();
      }
    });
  }

  // === CUSTOMER FORM VALIDATION ===
  if ($('#customer-form').length) {
    $('#customer-form').validate({
      rules: {
        name: { required: true, minlength: 2 },
        email: { required: true, email: true },
        street: { required: true, minlength: 2 },
        number: { required: true, digits: true, min: 1 },
        city: { required: true, minlength: 2 }
      },
      messages: {
        name: {
          required: 'Customer name is required',
          minlength: 'At least 2 characters'
        },
        email: {
          required: 'Email is required',
          email: 'Invalid email format'
        },
        street: {
          required: 'Street is required',
          minlength: 'At least 2 characters'
        },
        number: {
          required: 'Street number is required',
          digits: 'Must be a number',
          min: 'Must be at least 1'
        },
        city: {
          required: 'City is required',
          minlength: 'At least 2 characters'
        }
      },
      submitHandler: window.handleCustomerSubmit || function (form) {
        form.submit();
      }
    });
  }

  // === EDIT FORM VALIDATION (ETA or Status) ===
  if ($('#edit-form').length) {
    // Custom Rule: must change at least ETA or Status
    $.validator.addMethod('atLeastOneChange', function () {
      const eta = $('#edit-eta');
      const status = $('#edit-status');
      return eta.val()?.trim() !== eta.data('original')?.trim() ||
             status.val()?.trim() !== status.data('original')?.trim();
    }, 'You must change at least ETA or Status');

    $('#edit-form').validate({
      ignore: [], // include hidden fields too
      rules: {
        eta: { required: true, date: true },
        dummy: { atLeastOneChange: true } // trigger custom rule
      },
      messages: {
        eta: {
          required: 'ETA is required',
          date: 'Enter a valid date'
        }
      },
      submitHandler: window.handleEditSubmit || function (form) {
        form.submit();
      }
    });
  }

  // === LOCATION FORM VALIDATION ===
  if ($('#location-form').length) {
    $('#location-form').validate({
      rules: {
        location: { required: true, minlength: 3 }
      },
      messages: {
        location: {
          required: 'Please enter a location',
          minlength: 'Location must be at least 3 characters'
        }
      },
      submitHandler: window.handleLocationSearch || function (form) {
        form.submit();
      }
    });
  }
}
