export function setupBuisnesValidation() {
  $.validator.addMethod("requireHttp", function (value) {
    return /^https?:\/\/.+/.test(value);
  }, "URL must start with http:// or https://");

  $('#buisnes-form').validate({
    rules: {
      name: {
        required: true,
        minlength: 2,
        maxlength: 100,
        pattern: /^[\u0590-\u05FF\w\s.,'-]+$/
      },
      site_url: {
        required: true,
        url: true,
        requireHttp: true
      }
    },
    messages: {
      name: {
        required: 'Company name is required',
        minlength: 'Name must be at least 2 characters',
        maxlength: 'Name must be no longer than 100 characters',
        pattern: 'Invalid characters in name'
      },
      site_url: {
        required: 'Website is required',
        url: 'Enter a valid URL',
        requireHttp: 'URL must start with http:// or https://'
      }
    },
    submitHandler: window.handleBuisnesSubmit || function (form) {
      form.submit();
    }
  });
}


export function setupCustomerValidation() {
  $('#customer-form').validate({
    rules: {
      name: { required: true, minlength: 2, maxlength: 100 },
      email: { required: true, email: true },
      street: { required: true, minlength: 2, maxlength: 100 },
      number: { required: true, digits: true, min: 1 },
      city: { required: true, minlength: 2, maxlength: 100 }
    },
    messages: {
      name: {
        required: 'Customer name is required',
        minlength: 'Name must be at least 2 characters',
        maxlength: 'Name must be no longer than 100 characters'
      },
      email: {
        required: 'Email is required',
        email: 'Enter a valid email address'
      },
      street: {
        required: 'Street is required',
        minlength: 'Street must be at least 2 characters',
        maxlength: 'Street must be no longer than 100 characters'
      },
      number: {
        required: 'Street number is required',
        digits: 'Street number must be numeric',
        min: 'Street number must be at least 1'
      },
      city: {
        required: 'City is required',
        minlength: 'City must be at least 2 characters',
        maxlength: 'City must be no longer than 100 characters'
      }
    },
    submitHandler: window.handleCustomerSubmit || function (form) {
      form.submit();
    }
  });
}
