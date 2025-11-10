const form = document.getElementById("registerForm");
const successSection = document.getElementById("success");
const submitButton = form.querySelector('button[type="submit"]');
const successTitle = successSection.querySelector("h2");
const successMessage = successSection.querySelector("p");
const defaultSuccessTitle = successTitle.textContent;
const defaultSuccessMessage = successMessage.textContent;

const patterns = {
  name: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,60}$/,
  email:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,}$/,
};

const messages = {
  name: {
    empty: "El nombre completo es obligatorio.",
    invalid:
      "Introduce un nombre válido (solo letras y espacios, mínimo 3 caracteres).",
  },
  email: {
    empty: "El correo electrónico es obligatorio.",
    invalid: "Introduce un correo electrónico válido (ej. nombre@dominio.com).",
  },
  password: {
    empty: "La contraseña es obligatoria.",
    invalid:
      "Debe tener al menos 8 caracteres, incluir minúsculas, mayúsculas, un número y un símbolo.",
  },
  confirmPassword: {
    empty: "Confirma tu contraseña.",
    mismatch: "Las contraseñas no coinciden.",
  },
  terms: {
    unchecked: "Debes aceptar los términos y condiciones.",
  },
};

const fieldRefs = {
  name: document.getElementById("name"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  confirmPassword: document.getElementById("confirmPassword"),
  terms: document.getElementById("terms"),
};

const messageRefs = {};
document.querySelectorAll(".message").forEach((node) => {
  const key = node.dataset.for;
  messageRefs[key] = node;
});

function handleValidationResult(field, state, text, isSuccess = false) {
  const messageNode = messageRefs[field];
  if (!messageNode) return;

  messageNode.textContent = text;
  messageNode.classList.toggle("message--success", isSuccess);

  if (state === "error") {
    fieldRefs[field].setAttribute("aria-invalid", "true");
    fieldRefs[field].classList.add("invalid");
  } else {
    fieldRefs[field].removeAttribute("aria-invalid");
    fieldRefs[field].classList.remove("invalid");
  }
}

function validateName() {
  const value = fieldRefs.name.value.trim();
  if (!value) {
    handleValidationResult("name", "error", messages.name.empty);
    return false;
  }

  if (!patterns.name.test(value)) {
    handleValidationResult("name", "error", messages.name.invalid);
    return false;
  }

  handleValidationResult("name", "success", "¡Perfecto!", true);
  return true;
}

function validateEmail() {
  const value = fieldRefs.email.value.trim();
  if (!value) {
    handleValidationResult("email", "error", messages.email.empty);
    return false;
  }

  if (!patterns.email.test(value)) {
    handleValidationResult("email", "error", messages.email.invalid);
    return false;
  }

  handleValidationResult("email", "success", "Correo válido.", true);
  return true;
}

function validatePassword() {
  const value = fieldRefs.password.value;
  if (!value) {
    handleValidationResult("password", "error", messages.password.empty);
    return false;
  }

  if (!patterns.password.test(value)) {
    handleValidationResult("password", "error", messages.password.invalid);
    return false;
  }

  handleValidationResult(
    "password",
    "success",
    "Contraseña segura.",
    true,
  );
  return true;
}

function validateConfirmPassword() {
  const value = fieldRefs.confirmPassword.value;
  if (!value) {
    handleValidationResult(
      "confirmPassword",
      "error",
      messages.confirmPassword.empty,
    );
    return false;
  }

  if (value !== fieldRefs.password.value) {
    handleValidationResult(
      "confirmPassword",
      "error",
      messages.confirmPassword.mismatch,
    );
    return false;
  }

  handleValidationResult("confirmPassword", "success", "Coincide.", true);
  return true;
}

function validateTerms() {
  if (!fieldRefs.terms.checked) {
    handleValidationResult("terms", "error", messages.terms.unchecked);
    return false;
  }

  handleValidationResult("terms", "success", "Gracias por aceptar.", true);
  return true;
}

const validators = {
  name: validateName,
  email: validateEmail,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
  terms: validateTerms,
};

Object.entries(fieldRefs).forEach(([key, input]) => {
  const eventType = input.type === "checkbox" ? "change" : "input";
  input.addEventListener(eventType, () => {
    validators[key]();
    if (key === "password") {
      validateConfirmPassword();
    }
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isValid = Object.values(validators)
    .map((fn) => fn())
    .every(Boolean);

  if (!isValid) {
    successSection.hidden = true;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  successSection.classList.remove("success--error");
  successSection.hidden = true;

  const payload = {
    name: fieldRefs.name.value.trim(),
    email: fieldRefs.email.value.trim(),
    password: fieldRefs.password.value,
  };

  try {
    const response = await fetch("http://localhost:4000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudo guardar el registro.");
    }

    successTitle.textContent = defaultSuccessTitle;
    successMessage.textContent = defaultSuccessMessage;
    successSection.hidden = false;
    form.reset();

    Object.keys(messageRefs).forEach((key) => {
      handleValidationResult(key, "success", "", false);
    });
  } catch (error) {
    successSection.hidden = false;
    successSection.classList.add("success--error");
    successTitle.textContent = "Ups...";
    successMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Crear cuenta";
  }
});

