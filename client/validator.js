export function setupFormValidation() {
  // Add Package Form
  $('#package-form').validate({
    rules: {
      prod_id: 'required',
      name: 'required',
      customerName: 'required',
      customerId: 'required',
      email: {
        required: true,
        email: true
      },
      street: 'required',
      number: {
        required: true,
        digits: true
      },
      city: 'required',
      start_date: 'required',
      eta: {
        required: true,
        date: true
      },
      status: 'required'
    },
    messages: {
      email: {
        email: 'Enter a valid email'
      },
      number: {
        digits: 'Enter only digits for street number'
      }
    },
    submitHandler: window.handleAddSubmit // Use global or import in setup
  });

  // Edit Form
  $('#edit-form').validate({
    rules: {
      eta: {
        date: true
      },
      status: {
        required: false
      }
    },
    submitHandler: window.handleEditSubmit
  });

  // Location Form
  $('#location-form').validate({
    rules: {
      location: 'required'
    },
    messages: {
      location: 'Please enter a location'
    },
    submitHandler: window.handleLocationSearch
  });
}
