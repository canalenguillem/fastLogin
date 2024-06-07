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
        $('#menu-header').show();
    }

    function showLogin() {
        $('#login-box').show();
        $('#menu-header').hide();
    }

    function logout() {
        localStorage.removeItem('access_token');
        showLogin();
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
                showMenu();
            },
            error: function(xhr, status, error) {
                console.error('Failed to fetch user info:', xhr.responseText);
                // Manejar el error (por ejemplo, redirigir al login si el token no es válido)
                logout();
            }
        });
    }
});
