$(document).ready(function() {
    checkLogin();

    $('#login-form').submit(function(event) {
        event.preventDefault(); // Evitar que el formulario se envíe de la manera tradicional

        const username = $('#username').val();
        const password = $('#password').val();

        console.log('Attempting login with:', username, password); // Mensaje de depuración

        $.ajax({
            url: 'http://localhost:8000/token', // URL del endpoint de tu API
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                console.log('Login successful:', response);
                // Guardar el token en localStorage
                localStorage.setItem('access_token', response.access_token);
                // Obtener información del usuario y mostrar el menú
                getUserInfo();
            },
            error: function(xhr, status, error) {
                console.error('Login failed:', xhr.responseText);
                // Mostrar un mensaje de error al usuario
            }
        });
    });

    $('#logout').click(function(event) {
        event.preventDefault();
        logout();
    });

    $('#home').click(function(event) {
        event.preventDefault();
        showHome();
    });

    $('#create-user').click(function(event) {
        event.preventDefault();
        showCreateUserForm();
    });

    $('#register-link').click(function(event) {
        event.preventDefault();
        showRegisterForm();
    });

    function checkLogin() {
        const token = localStorage.getItem('access_token');
        if (token) {
            getUserInfo();
        } else {
            showLogin();
        }
    }

    function showMenu() {
        $('#login-box').hide();
        $('#register-box').hide();
        $('#menu-header').show();
        $('#main-content').show();
        $('#footer').show();
    }

    function showLogin() {
        $('#login-form')[0].reset(); // Limpiar el formulario de login
        $('#login-box').show();
        $('#register-box').hide();
        $('#menu-header').hide();
        $('#main-content').hide();
        $('#footer').hide();
        clearMainContent(); // Limpiar el contenido principal al mostrar el formulario de login
    }

    function showRegister() {
        $('#login-box').hide();
        $('#register-box').show();
        $('#menu-header').hide();
        $('#main-content').hide();
        $('#footer').hide();
        clearMainContent(); // Limpiar el contenido principal al mostrar el formulario de registro
    }

    function logout() {
        localStorage.removeItem('access_token');
        clearMainContent(); // Limpiar el contenido principal
        $('#admin-menu').hide(); // Asegurarse de ocultar el menú de administración
        showLogin();
    }

    function clearMainContent() {
        $('#main-content').empty(); // Limpiar el contenido del contenedor principal
    }

    function getUserInfo() {
        const token = localStorage.getItem('access_token');
        console.log('Token:', token);

        $.ajax({
            url: 'http://localhost:8000/users/me/', // URL del endpoint protegido
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                console.log('User info:', response);
                // Mostrar la información del usuario en la página
                $('#user-info').text(`Logged in as: ${response.username} (${response.email})`);
                if (response.role.name === 'admin') {
                    $('#admin-menu').show();
                } else {
                    $('#admin-menu').hide(); // Ocultar el menú si el usuario no es admin
                }
                showMenu();
            },
            error: function(xhr, status, error) {
                console.error('Failed to fetch user info:', xhr.responseText);
                // Manejar el error (por ejemplo, redirigir al login si el token no es válido)
                logout();
            }
        });
    }

    function showHome() {
        $('#main-content').html('<h2>Welcome Home!</h2>');
    }

    function showCreateUserForm() {
        const formHtml = `
            <div class="form-container">
                <h2>Create User</h2>
                <form id="create-user-form">
                    <label for="new-username">Username:</label>
                    <input type="text" id="new-username" name="username" required>
                    <br>
                    <label for="new-email">Email:</label>
                    <input type="email" id="new-email" name="email" required>
                    <br>
                    <label for="new-password">Password:</label>
                    <input type="password" id="new-password" name="password" required>
                    <br>
                    <label for="new-role">Role:</label>
                    <select id="new-role" name="role_id">
                        <option value="1">Admin</option>
                        <option value="2">User</option>
                    </select>
                    <br>
                    <button type="submit">Create User</button>
                </form>
            </div>
        `;
        $('#main-content').html(formHtml);

        $('#create-user-form').submit(function(event) {
            event.preventDefault();
            const newUser = {
                username: $('#new-username').val(),
                email: $('#new-email').val(),
                password: $('#new-password').val(),
                role_id: $('#new-role').val()
            };

            const token = localStorage.getItem('access_token');

            $.ajax({
                url: 'http://localhost:8000/create_user', // URL del endpoint para crear usuarios
                type: 'POST',
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                data: JSON.stringify(newUser),
                success: function(response) {
                    console.log('User created successfully:', response);
                    alert('User created successfully');
                },
                error: function(xhr, status, error) {
                    console.error('Failed to create user:', xhr.responseText);
                    alert('Failed to create user');
                }
            });
        });
    }

    function showRegisterForm() {
        const formHtml = `
            <div class="form-container">
                <h2>Register</h2>
                <form id="register-form">
                    <label for="register-username">Username:</label>
                    <input type="text" id="register-username" name="username" required>
                    <br>
                    <label for="register-email">Email:</label>
                    <input type="email" id="register-email" name="email" required>
                    <br>
                    <label for="register-password">Password:</label>
                    <input type="password" id="register-password" name="password" required>
                    <br>
                    <button type="submit">Register</button>
                </form>
            </div>
        `;
        $('#main-content').html(formHtml);

        $('#register-form').submit(function(event) {
            event.preventDefault();
            const newUser = {
                username: $('#register-username').val(),
                email: $('#register-email').val(),
                password: $('#register-password').val(),
                role_id: 2 // Rol de usuario por defecto
            };

            $.ajax({
                url: 'http://localhost:8000/register_user', // URL del endpoint para registrar usuarios
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newUser),
                success: function(response) {
                    console.log('User registered successfully:', response);
                    alert('User registered successfully');
                    showLogin();
                },
                error: function(xhr, status, error) {
                    console.error('Failed to register user:', xhr.responseText);
                    alert('Failed to register user');
                }
            });
        });
        showRegister();
    }
});
