export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    message: password.length < 8 ? 'Password must be at least 8 characters long' : ''
  };
};

export const validateJobForm = (values) => {
  const errors = {};

  if (!values.title) {
    errors.title = 'Title is required';
  }

  if (!values.description) {
    errors.description = 'Description is required';
  }

  if (!values.location) {
    errors.location = 'Location is required';
  }

  if (!values.type) {
    errors.type = 'Job type is required';
  }

  if (!values.salary?.min || !values.salary?.max) {
    errors.salary = 'Salary range is required';
  } else if (parseInt(values.salary.min) > parseInt(values.salary.max)) {
    errors.salary = 'Minimum salary cannot be greater than maximum salary';
  }

  return errors;
};

