document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get("role");

    if (roleParam) {
        sessionStorage.setItem("stock_manager_role", roleParam);
    }

    const currentRole = sessionStorage.getItem("stock_manager_role") || "admin";
    const currentPath = window.location.pathname;

    document.querySelectorAll("[data-roles]").forEach((el) => {
        const allowedRoles = el.dataset.roles.split(",").map((r) => r.trim());
        el.hidden = !allowedRoles.includes(currentRole);
    });

    const pedidosGroup = document.getElementById("pedidosGroup");
    const pedidosToggle = document.getElementById("pedidosToggle");
    const isPedidosSection =
        currentPath.endsWith("pedidos.html") ||
        currentPath.endsWith("historial-pedidos.html");

    if (pedidosGroup && isPedidosSection) {
        pedidosGroup.classList.add("open");
        if (pedidosToggle) {
            pedidosToggle.setAttribute("aria-expanded", "true");
        }
    }

    if (pedidosToggle && pedidosGroup) {
        pedidosToggle.addEventListener("click", () => {
            if (!isPedidosSection) {
                window.location.href = "./pedidos.html";
                return;
            }

            const isOpen = pedidosGroup.classList.toggle("open");
            pedidosToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.querySelectorAll(".nav-links .nav-item, .nav-links .nav-subitem").forEach((link) => {
        const linkHref = link.getAttribute("href");
        if (!linkHref) return;

        const cleanHref = linkHref.replace("./", "");
        link.classList.toggle("active", currentPath.endsWith(cleanHref));
    });

    if (pedidosToggle) {
        pedidosToggle.classList.toggle("active", isPedidosSection);
    }
});
