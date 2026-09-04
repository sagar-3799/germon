/**
 * GERMON IT SOLUTION PVT. LTD. - Portal Navigation & Auth Guard
 */

(function () {
  'use strict';

  // Check current page
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html') return; // Don't check auth on login page

  const currentUser = GermonStore.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // Role restriction
  if (currentUser.role === 'technician' && (page === 'users.html' || page === 'backup.html')) {
    alert('Access restricted to Admin and Office Staff.');
    window.location.href = 'technician.html';
    return;
  }

  // Render Portal Navbar dynamically if #portalNavPlaceholder exists
  const navContainer = document.getElementById('portalNavPlaceholder');
  if (navContainer) {
    const isAdminOrStaff = currentUser.role === 'admin' || currentUser.role === 'staff';
    const activeCount = GermonStore.getActiveUserCount();

    navContainer.innerHTML = `
      <nav class="portal-navbar navbar navbar-expand-lg navbar-dark py-2 sticky-top">
        <div class="container-fluid px-3 px-lg-4">
          <a class="portal-brand" href="${isAdminOrStaff ? 'dashboard.html' : 'technician.html'}">
            <img src="../logo.jpeg" alt="Germon IT Logo" class="portal-logo-img">
            <div class="portal-brand-text">
              <span class="portal-brand-title">GERMON IT</span>
              <span class="portal-brand-subtitle">Work Management System</span>
            </div>
          </a>

          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#portalNavbarContent">
            <span class="bi bi-list fs-2 text-white"></span>
          </button>

          <div class="collapse navbar-collapse" id="portalNavbarContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
              ${isAdminOrStaff ? `
                <li class="nav-item">
                  <a class="portal-nav-link ${page === 'dashboard.html' ? 'active' : ''}" href="dashboard.html">
                    <i class="bi bi-speedometer2"></i> Dashboard
                  </a>
                </li>
                <li class="nav-item">
                  <a class="portal-nav-link ${page === 'works.html' ? 'active' : ''}" href="works.html">
                    <i class="bi bi-tools"></i> Work Orders
                  </a>
                </li>
                <li class="nav-item">
                  <a class="portal-nav-link ${page === 'clients.html' ? 'active' : ''}" href="clients.html">
                    <i class="bi bi-building"></i> Clients &amp; Warranty
                  </a>
                </li>
                <li class="nav-item">
                  <a class="portal-nav-link ${page === 'credentials.html' ? 'active' : ''}" href="credentials.html">
                    <i class="bi bi-shield-lock"></i> Passwords Vault
                  </a>
                </li>
                <li class="nav-item">
                  <a class="portal-nav-link ${page === 'payments.html' ? 'active' : ''}" href="payments.html">
                    <i class="bi bi-cash-stack"></i> Billing
                  </a>
                </li>
                ${currentUser.role === 'admin' ? `
                  <li class="nav-item">
                    <a class="portal-nav-link ${page === 'users.html' ? 'active' : ''}" href="users.html">
                      <i class="bi bi-people"></i> Users <span class="badge bg-danger ms-1">${activeCount}/10</span>
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="portal-nav-link ${page === 'backup.html' ? 'active' : ''}" href="backup.html">
                      <i class="bi bi-cloud-arrow-down"></i> Backup
                    </a>
                  </li>
                ` : ''}
              ` : `
                <li class="nav-item">
                  <a class="portal-nav-link ${page === 'technician.html' ? 'active' : ''}" href="technician.html">
                    <i class="bi bi-wrench-adjustable-circle"></i> My Assigned Works
                  </a>
                </li>
              `}
            </ul>

            <div class="d-flex align-items-center gap-3 mt-3 mt-lg-0 pt-2 pt-lg-0 border-top border-secondary border-opacity-25 border-lg-0">
              <a href="../index.html" class="btn btn-sm btn-outline-light d-none d-xl-inline-flex align-items-center gap-1">
                <i class="bi bi-globe"></i> Website
              </a>
              <div class="text-white text-end lh-1">
                <a href="${isAdminOrStaff ? 'users.html' : '#'}" class="text-white text-decoration-none fw-bold fs-6" title="Manage Profile & Password">
                  ${currentUser.name} <i class="bi bi-pencil-square small text-info ms-1"></i>
                </a>
                <div class="d-flex align-items-center justify-content-end gap-1 mt-1">
                  <span class="user-role-badge role-${currentUser.role}">${currentUser.role}</span>
                </div>
              </div>
              <button onclick="GermonStore.logout()" class="btn btn-sm btn-danger d-inline-flex align-items-center gap-1 shadow-sm">
                <i class="bi bi-box-arrow-right"></i> <span class="d-none d-md-inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    `;
  }
})();
