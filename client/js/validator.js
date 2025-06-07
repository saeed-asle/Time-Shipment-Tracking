// dds custom validation methods and sets up rules for all forms

export function setupFormValidation() {
    //  ETA must be after or on the same day as start date
  $.validator.addMethod('etaAfterStart', function (value, element, paramSelector) {
    const startValue = $(paramSelector).val();
    const startDate = new Date(startValue);
    const etaDate = new Date(value);

    return !isNaN(startDate) && !isNaN(etaDate) && etaDate >= startDate;
  }, 'ETA must be the same day or after the start date');
//at least ETA or status must be changed
  $.validator.addMethod('atLeastOneChange', function () {
    const eta = $('#edit-eta');
    const status = $('#edit-status');

    return eta.val()?.trim() !== eta.data('original')?.trim() ||
           status.val()?.trim() !== status.data('original')?.trim();
  }, 'Please modify ETA or status');
// allow only English letters, numbers, and basic punctuation
  $.validator.addMethod('englishOnly', function (value, element) {
    return this.optional(element) || /^[A-Za-z0-9 ,.'\-]*$/.test(value);
  }, 'Please use English letters, numbers and common punctuation only.');
  //  start date must be today
  $.validator.addMethod('isToday', function (value) {
    const inputDate = new Date(value);
    const today = new Date();
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return inputDate.getTime() === today.getTime();
  }, 'Start date must be today');

  // Add form validation for the add package form
  $('#package-form').validate({
    rules: {
      prod_id: { required: true, minlength: 3 },
      name: { required: true, minlength: 2 },
      customerName: { required: true, minlength: 2 },
      customerId: { required: true, minlength: 2 },
      email: { required: true, email: true },
      street: { required: true, minlength: 2 },
      number: { required: true, digits: true, min: 1 },
      city: { required: true, minlength: 2 },
      start_date: { required: true, date: true, isToday: true },
      eta: { required: true, date: true, etaAfterStart: 'input[name="start_date"]' },
      status: { required: true }
    },
    messages: {
      prod_id: { required: 'SKU is required', minlength: 'SKU must be at least 3 characters' },
      name: { required: 'Name is required', minlength: 'Name must be at least 2 characters' },
      customerName: 'Customer name is required',
      customerId: 'Customer ID is required',
      email: { required: 'Email is required', email: 'Please enter a valid email address' },
      street: 'Street is required',
      number: {
        required: 'Street number is required',
        digits: 'Street number must be numeric',
        min: 'Street number must be at least 1'
      },
      city: 'City is required',
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
  // Add form validation for the edit form
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

  // Add form validation for the location search form
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
// Apply englishOnly rule to all text inputs and textareas
  $("input[type='text'], textarea").each(function () {
    $(this).rules("add", { englishOnly: true });
  });
}
