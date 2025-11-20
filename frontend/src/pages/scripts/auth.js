const LANG_TEXTS = {
  es: {
    requiredFields: "Se deben rellenar los campos obligatorios.",
    minUsername: "El nombre de usuario debe tener mínimo 3 caracteres.",
    invalidEmail: "Formato de email inválido.",
    phoneNumbersOnly: "El campo teléfono solo puede contener números.",
    shortPassword: "La contraseña debe tener más de 4 caracteres.",
    passwordsDontMatch: "Las contraseñas no coinciden.",
    registerSuccess: (email) => `Registro exitoso! Revisa tu email (${email}) para verificar tu cuenta.`,
    connectionError: "Error en la conexión. Inténtalo más tarde.",

    // LOGIN
    loginRequiredFields: "Se deben rellenar todos los campos.",
    loginShortPassword: "La contraseña debe tener mínimo 4 caracteres.",
    loginInvalidEmail: "Formato de email inválido.",
    loginEmailNotVerified: "Verifica tu email antes de iniciar sesión.",
    loginSuspended: "Usuario suspendido.",
    loginSuccess: "Inicio de sesión realizado con éxito!!",
  },

  en: {
    requiredFields: "All required fields must be filled.",
    minUsername: "Username must be at least 4 characters long.",
    invalidEmail: "Invalid email format.",
    phoneNumbersOnly: "Phone field can only contain numbers.",
    shortPassword: "Password must be longer than 4 characters.",
    passwordsDontMatch: "Passwords do not match.",
    registerSuccess: (email) => `Registration successful! Check your email (${email}) to verify your account.`,
    connectionError: "Connection error. Please try again later.",

    // LOGIN
    loginRequiredFields: "All fields must be filled.",
    loginShortPassword: "Password must be at least 4 characters.",
    loginInvalidEmail: "Invalid email format.",
    loginEmailNotVerified: "Verify your email before signing in.",
    loginSuspended: "User suspended.",
    loginSuccess: "Login successful!!",
  }
};

const lang = localStorage.getItem("language") || "es";

const registerForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const pictureProfileInput = registerForm?.querySelector("#profile-picture");
const pictureProfileImg = registerForm?.querySelector("#profile-picture-img");
let dataImg = "";

const compressImage = (file, maxWidth = 200, maxHeight = 200, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleProfileImage = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert("Formato de imagen no válido.");
    pictureProfileInput.value = '';
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("La imagen es demasiado grande. Usa una imagen más pequeña.");
    pictureProfileInput.value = '';
    return;
  }

  try {
    const compressedImage = await compressImage(file);
    
    pictureProfileImg.src = compressedImage;
    dataImg = compressedImage;
  } catch (error) {
    alert("Error al procesar la imagen");
    pictureProfileInput.value = '';
  }
}

const handleRegister = async (e) => {
  e.preventDefault();

  const usernameInput = registerForm.querySelector("#username");
  const emailInput = registerForm.querySelector("#email-signup");
  const telephoneInput = registerForm.querySelector("#telephone-signup");
  const passwordInput = registerForm.querySelector("#password-signup");
  const repeatPasswordInput = registerForm.querySelector("#repeat-password-signup");
  const msgError = registerForm.querySelector("#message-error");
  const submitBtn = registerForm.querySelector("input[type='submit']")

  const userName = usernameInput.value.trim();
  const userEmail = emailInput.value.trim();
  const userPhoneNumber = telephoneInput.value.trim();
  const userPassword = passwordInput.value;
  const repeatPassword = repeatPasswordInput.value;

  const displayError = (message, inputsError = []) => {
    msgError.classList.add("register-error");
    msgError.textContent = message;
    msgError.classList.remove("hidden")
    submitBtn.setAttribute("disabled", true);
    
    inputsError.forEach(input => input.classList.add("field-modal-error"));

    setTimeout(() => {
      msgError.classList.add("hidden")
      submitBtn.removeAttribute("disabled");
      msgError.textContent = "";
      msgError.classList.remove("register-error");
      
      inputsError.forEach(input => input.classList.remove("field-modal-error"));
    }, 3000);
  };

  if (!userName || !userEmail || !userPassword) {
    return displayError(LANG_TEXTS[lang].requiredFields, [usernameInput, emailInput, passwordInput]);
  }

  if (userName.length < 3) {
    return displayError(LANG_TEXTS[lang].minUsername, [usernameInput]);
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return displayError(LANG_TEXTS[lang].invalidEmail, [emailInput])
  }

  if (userPhoneNumber && !/^\d+$/.test(userPhoneNumber)) {
    return displayError(LANG_TEXTS[lang].phoneNumbersOnly, [telephoneInput]);
  }

  if (userPassword.length <= 4) {
    return displayError(LANG_TEXTS[lang].shortPassword, [passwordInput])
  }

  if (userPassword !== repeatPassword) {
    return displayError(LANG_TEXTS[lang].passwordsDontMatch, [passwordInput, repeatPasswordInput]);
  }

  const userData = {
    userName,
    userEmail,
    userPassword,
    userPhoneNumber: userPhoneNumber || null,
    userAvatarUrl: dataImg || null,
  }

  try {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    });

    const response = await res.json();  
    if (!res.ok) return displayError(response.error);

    registerForm.reset();
    pictureProfileImg.src = "/src/assets/profile-default.webp";
    dataImg = "";
    
    submitBtn.setAttribute("disabled", true);
    msgError.classList.remove("hidden");
    msgError.classList.add("register-successfully")
    msgError.textContent = LANG_TEXTS[lang].registerSuccess(userEmail);

    setTimeout(() => {
      const loginModal = document.getElementById("login-modal");
      const signupModal = document.getElementById("signup-modal");
      signupModal.close();
      loginModal.showModal();
    }, 2000);
  } catch (err) {
    displayError(LANG_TEXTS[lang].connectionError);
  }
}

const handleLogin = async (e) => {
  e.preventDefault();

  const emailInput = loginForm.querySelector("#email-login");
  const passwordInput = loginForm.querySelector("#password-login");
  const msgError = loginForm.querySelector("#message-error");
  const submitBtn = loginForm.querySelector("input[type='submit']")

  const userEmail = emailInput.value.trim();
  const userPassword = passwordInput.value;

  const displayError = (message) => {
    msgError.classList.add("login-error");
    msgError.textContent = message;
    msgError.classList.remove("hidden")
    submitBtn.setAttribute("disabled", true);

    setTimeout(() => {
      msgError.classList.add("hidden")
      msgError.classList.remove("login-error");
      submitBtn.removeAttribute("disabled");
      msgError.textContent = "";
    }, 3000);
  };

  if (!userEmail || !userPassword) {
    return displayError(LANG_TEXTS[lang].loginRequiredFields);
  }

  if (userPassword.length <= 4) {
    return displayError(LANG_TEXTS[lang].loginShortPassword);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return displayError(LANG_TEXTS[lang].loginInvalidEmail);
  }

  const userData = {
    userEmail,
    userPassword,
  }

  try {    
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    })

    const response = await res.json();
    
    if (!res.ok) {
      if (response.error === "EMAIL NOT VERIFIED") {
        return displayError(LANG_TEXTS[lang].loginEmailNotVerified);
      }
      
      return displayError(response.error);
    }

    const token = response.token;
    const user = response.publicUserData;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (user.userStatus.userStatusName !== "activo") {
      return displayError(LANG_TEXTS[lang].loginSuspended);
    }

    if (window.updateUserInterface) {
      window.updateUserInterface(user);
    }

    const route = user.userRole.userRoleName === "admin"
      ? "/src/pages/admin/admin.html"
      : "/index";

    msgError.classList.remove("hidden");
    msgError.classList.add("login-successfully")
    msgError.textContent = LANG_TEXTS[lang].loginSuccess;

    loginForm.reset();
    submitBtn.setAttribute("disabled", true);

    setTimeout(() => {
      location.href = route;
    }, 2000);
  } catch (err) {
    displayError("Error en la conexion. Intentalo mas tarde.");
  }
}

if (registerForm) {
  pictureProfileInput.addEventListener("change", handleProfileImage);
  registerForm.addEventListener("submit", handleRegister);
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'close-signup' || e.target.closest('#close-signup')) {
    dataImg = "";
    if (pictureProfileImg) {
      pictureProfileImg.src = "/src/assets/profile-default.webp";
    }
  }
});