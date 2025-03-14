document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginContainer = document.querySelector('.login_container');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    
    // Verificar si el usuario ya está logueado
    checkLoginStatus();
    
    // Cambiar entre formularios
    switchToRegister.addEventListener('click', function() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        clearMessages();
    });
    
    switchToLogin.addEventListener('click', function() {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        clearMessages();
    });
    
    // Registrar usuario
    registerBtn.addEventListener('click', function() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regPasswordConfirm').value;
        
        // Validaciones
        if (!username || !email || !password || !confirmPassword) {
            showMessage(registerMessage, 'Todos los campos son obligatorios', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage(registerMessage, 'Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage(registerMessage, 'La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        // Verificar si el usuario ya existe
        const users = JSON.parse(localStorage.getItem('wazQuizUsers') || '[]');
        if (users.some(user => user.username === username)) {
            showMessage(registerMessage, 'Este nombre de usuario ya está registrado', 'error');
            return;
        }
        
        if (users.some(user => user.email === email)) {
            showMessage(registerMessage, 'Este correo electrónico ya está registrado', 'error');
            return;
        }
        
        // Guardar nuevo usuario
        users.push({
            username,
            email,
            password, // En una aplicación real, nunca almacenes contraseñas en texto plano
            quizScores: []
        });
        
        localStorage.setItem('wazQuizUsers', JSON.stringify(users));
        showMessage(registerMessage, 'Registro exitoso. Ya puedes iniciar sesión', 'success');
        
        // Limpiar campos
        document.getElementById('regUsername').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regPasswordConfirm').value = '';
        
        // Volver al login después de un segundo
        setTimeout(function() {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        }, 1500);
    });
    
    // Iniciar sesión
    loginBtn.addEventListener('click', function() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            showMessage(loginMessage, 'Por favor ingresa usuario y contraseña', 'error');
            return;
        }
        
        // Verificar credenciales
        const users = JSON.parse(localStorage.getItem('wazQuizUsers') || '[]');
        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
        
        if (user) {
            // Login exitoso
            localStorage.setItem('wazQuizCurrentUser', JSON.stringify({
                username: user.username,
                email: user.email,
                loggedIn: true,
                timestamp: new Date().getTime()
            }));
            
            showMessage(loginMessage, 'Inicio de sesión exitoso', 'success');
            
            // Ocultar login después de un segundo
            setTimeout(function() {
                loginContainer.classList.add('hidden');
                addUserInfoToDOM(user.username);
            }, 1000);
        } else {
            showMessage(loginMessage, 'Usuario o contraseña incorrectos', 'error');
        }
    });
    
    // Funciones auxiliares
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message ' + type;
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(function() {
            element.textContent = '';
            element.className = 'message';
        }, 3000);
    }
    
    function clearMessages() {
        loginMessage.textContent = '';
        loginMessage.className = 'message';
        registerMessage.textContent = '';
        registerMessage.className = 'message';
    }
    
    function checkLoginStatus() {
        const currentUser = JSON.parse(localStorage.getItem('wazQuizCurrentUser'));
        if (currentUser && currentUser.loggedIn) {
            // Verificar si la sesión ha expirado (24 horas)
            const now = new Date().getTime();
            const loginTime = currentUser.timestamp;
            
            if (now - loginTime > 24 * 60 * 60 * 1000) {
                // Sesión expirada
                localStorage.removeItem('wazQuizCurrentUser');
                return;
            }
            
            // Usuario ya logueado
            loginContainer.classList.add('hidden');
            addUserInfoToDOM(currentUser.username);
        }
    }
    
    function addUserInfoToDOM(username) {
        // Verificar si ya existe un elemento de información de usuario
        let userInfo = document.querySelector('.user_info');
        
        if (!userInfo) {
            // Crear el elemento si no existe
            userInfo = document.createElement('div');
            userInfo.className = 'user_info';
            document.body.appendChild(userInfo);
        }
        
        // Actualizar contenido
        userInfo.innerHTML = `
            <span>Hola, ${username}</span>
            <button class="logout_btn">Cerrar sesión</button>
        `;
        userInfo.classList.add('active');
        
        // Agregar evento para cerrar sesión
        document.querySelector('.logout_btn').addEventListener('click', function() {
            localStorage.removeItem('wazQuizCurrentUser');
            userInfo.classList.remove('active');
            loginContainer.classList.remove('hidden');
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        });
    }
});