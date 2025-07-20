// Function to validate "Add Buisnes" form
export function setupBuisnesValidation() {
  // Add custom rule: site URL must start with http:// or https://
  $.validator.addMethod("requireHttp", function (value) {
    return /^https?:\/\/.+/.test(value); // check the beginning of the URL
  }, "URL must start with http:// or https://");

  // Apply validation to the business form
  $('#buisnes-form').validate({
    rules: {
      name: {
        required: true,              // must write something
        minlength: 2,                // at least 2 letters
        maxlength: 100,              // not more than 100 letters
        pattern: /^[\u0590-\u05FF\w\s.,'-]+$/ // allow letters, spaces, some symbols
      },
      site_url: {
        required: true,              // must give site
        url: true,                   // must be a real URL
        requireHttp: true            // must start with http:// or https://
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
    // When form is valid, call the global handler or just submit
    submitHandler: window.handleBuisnesSubmit || function (form) {
      form.submit();
    }
  });
}


// Function to validate "Add Customer" form
export function setupCustomerValidation() {
  $('#customer-form').validate({
    rules: {
      name: { required: true, minlength: 2, maxlength: 100 }, // name must be given, 2–100 chars
      email: { required: true, email: true },                 // must be valid email
      street: { required: true, minlength: 2, maxlength: 100 },
      number: { required: true, digits: true, min: 1 },       // must be a number, at least 1
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
    // When form is valid, call the global handler or just submit
    submitHandler: window.handleCustomerSubmit || function (form) {
      form.submit();
    }
  });
}
