document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('form');
    const userInput = document.querySelector('input[name="usuario"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const roleSelect = document.querySelector('select[name="rol"]');

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const user = userInput.value.trim();
            const password = passwordInput.value.trim();
            const role = roleSelect.value;

            let isValid = true;
            let errorMessage = "";

            if (!user) {
                isValid = false;
                errorMessage = "Por favor ingresa tu usuario.";
                userInput.style.borderColor = "#F44336";
            } else {
                userInput.style.borderColor = "#ddd";
            }

            if (!password) {
                isValid = false;
                errorMessage = "Por favor ingresa tu contraseña.";
                passwordInput.style.borderColor = "#F44336";
            } else {
                passwordInput.style.borderColor = "#ddd";
            }

            if (!role) {
                isValid = false;
                errorMessage = "Por favor selecciona un rol.";
                roleSelect.style.borderColor = "#F44336";
            } else {
                roleSelect.style.borderColor = "#ddd";
            }


            if (isValid) {
                // Simulate Login Success
                const btn = loginForm.querySelector('button');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

                setTimeout(() => {
                    alert(`Bienvenido, ${user}! Iniciando sesión como ${role}.`);
                    window.location.href = "../dashboard/index.html";
                }, 1000);
            } else {
                alert("Error de validación: " + errorMessage);
            }
        });
    }
});
