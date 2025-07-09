export function setupFormValidation() {
  // ETA must be after or on the same day as start date
  $.validator.addMethod('etaAfterStart', function (value, element, paramSelector) {
    const startValue = $(paramSelector).val();
    const startDate = new Date(startValue);
    const etaDate = new Date(value);
    return !isNaN(startDate) && !isNaN(etaDate) && etaDate >= startDate;
  }, 'ETA must be the same day or after the start date');

  // Allow only English letters, numbers, and basic punctuation
  $.validator.addMethod('englishOnly', function (value, element) {
    return this.optional(element) || /^[A-Za-z0-9 ,.'\-]*$/.test(value);
  }, 'Please use English letters, numbers and common punctuation only.');

  // Add form validation for the add package form
  if ($('#package-form').length) {
    $('#package-form').validate({
      rules: {
        prod_id: { required: true, minlength: 3, englishOnly: true },
        name: { required: true, minlength: 2, englishOnly: true },
        customer: { required: true },
        start_date: { required: true, date: true },
        eta: { required: true, date: true, etaAfterStart: '#start_date' },
        status: { required: true }
      },
      messages: {
        prod_id: { required: 'SKU is required', minlength: 'SKU must be at least 3 characters' },
        name: { required: 'Name is required', minlength: 'Name must be at least 2 characters' },
        customer: 'Customer is required',
        start_date: { required: 'Start date is required', date: 'Enter a valid start date' },
        eta: {
          required: 'ETA is required',
          date: 'Enter a valid ETA date',
          etaAfterStart: 'ETA must be the same day or after the start date'
        },
        status: 'Status is required'
      },
      submitHandler: window.handleAddSubmit
    });
  }

  // Add form validation for the add company form
  if ($('#company-form').length) {
    $('#company-form').validate({
      rules: {
        name: { required: true, minlength: 2, englishOnly: true },
        website: { required: true, url: true }
      },
      messages: {
        name: { required: 'Company name is required', minlength: 'Name must be at least 2 characters' },
        website: { required: 'Website is required', url: 'Enter a valid URL' }
      },
      submitHandler: function(form) {
        // call your handler or submit here
        if (window.handleCompanySubmit) return window.handleCompanySubmit(form);
        form.submit();
      }
    });
  }

  // Add form validation for the add customer form
  if ($('#customer-form').length) {
    $('#customer-form').validate({
      rules: {
        name: { required: true, minlength: 2, englishOnly: true },
        email: { required: true, email: true },
        street: { required: true, minlength: 2, englishOnly: true },
        number: { required: true, digits: true, min: 1 },
        city: { required: true, minlength: 2, englishOnly: true }
      },
      messages: {
        name: { required: 'Customer name is required', minlength: 'Name must be at least 2 characters' },
        email: { required: 'Email is required', email: 'Please enter a valid email address' },
        street: 'Street is required',
        number: {
          required: 'Street number is required',
          digits: 'Street number must be numeric',
          min: 'Street number must be at least 1'
        },
        city: 'City is required'
      },
      submitHandler: function(form) {
        if (window.handleCustomerSubmit) return window.handleCustomerSubmit(form);
        form.submit();
      }
    });
  }

  // Add form validation for the edit package form (if exists)
  if ($('#edit-form').length) {
    // Example for your atLeastOneChange rule, adjust if you use it
    $.validator.addMethod('atLeastOneChange', function () {
      const eta = $('#edit-eta');
      const status = $('#edit-status');
      return eta.val()?.trim() !== eta.data('original')?.trim() ||
             status.val()?.trim() !== status.data('original')?.trim();
    }, 'Please modify ETA or status');

    $('#edit-form').validate({
      ignore: [],
      rules: {
        eta: { required: true, date: true },
        status: { required: false },
        dummy: { atLeastOneChange: true }
      },
      messages: {
        eta: {
          required: 'ETA is required',
          date: 'Enter a valid ETA date'
        }
      },
      submitHandler: window.handleEditSubmit
    });
  }

  // Add form validation for the location search form
  if ($('#location-form').length) {
    $('#location-form').validate({
      rules: {
        location: { required: true, minlength: 3 }
      },
      messages: {
        location: {
          required: 'Please enter a location',
          minlength: 'Location must be at least 3 characters long'
        }
      },
      submitHandler: window.handleLocationSearch
    });
  }
}
