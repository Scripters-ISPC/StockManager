document.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar Toggle para móviles
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }

    // 2. Persistencia y Control de Roles
    // Obtener rol de la URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam) {
        sessionStorage.setItem('stock_manager_role', roleParam);
    }
    
    // Obtener el rol guardado (por defecto 'admin' si no está definido)
    const currentRole = sessionStorage.getItem('stock_manager_role') || 'admin';
    
    // Aplicar lógica según el rol
    const adminElements = document.querySelectorAll('.admin-only');
    if (currentRole === 'user') {
        adminElements.forEach(el => {
            el.style.setProperty('display', 'none', 'important');
        });
    } else {
        adminElements.forEach(el => {
            el.style.setProperty('display', 'block', 'important');
        });
    }

    // 3. Activar el enlace del menú correspondiente a la vista actual
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;
        
        // Quitar el ./ inicial para comparar
        const cleanHref = linkHref.replace('./', '');
        
        // Comprobar si la ruta termina con el nombre del archivo HTML
        if (currentPath.endsWith(cleanHref) && cleanHref !== '../index.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});