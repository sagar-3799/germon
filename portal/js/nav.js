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

    function escapeNavHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    navContainer.innerHTML = `
      <nav class="portal-navbar navbar navbar-expand-lg navbar-dark py-2 sticky-top shadow-sm">
        <div class="container-fluid px-2 px-md-3 px-lg-4">
          
          <!-- Left Section: Logged-In User Profile Info (No Logo) -->
          <div class="d-flex align-items-center gap-2 gap-md-3">
            <div class="user-profile-left d-flex align-items-center gap-2">
              ${currentUser.photoUrl ? `
                <img src="${currentUser.photoUrl}" alt="${escapeNavHtml(currentUser.name)}" class="user-pp-photo shadow-sm">
              ` : `
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff&bold=true&size=128" alt="${escapeNavHtml(currentUser.name)}" class="user-pp-photo shadow-sm">
              `}
              <div class="lh-sm">
                <div class="fw-bold text-white fs-6 font-heading">
                  <span class="text-truncate d-block" style="max-width: 140px;">${escapeNavHtml(currentUser.name)}</span>
                </div>
                <div class="mt-0.5">
                  <span class="user-role-badge role-${currentUser.role}">${currentUser.role.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button class="navbar-toggler border-0 p-1 ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#portalNavbarContent" aria-controls="portalNavbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="bi bi-list fs-1 text-white"></span>
          </button>

          <!-- Collapsible Equal-Size Navigation Items (Mathi Icon, Tala Text) -->
          <div class="collapse navbar-collapse mt-3 mt-lg-0" id="portalNavbarContent">
            <div class="portal-nav-items-wrapper mx-lg-auto my-2 my-lg-0">
              ${isAdminOrStaff ? `
                <a class="portal-nav-btn ${page === 'dashboard.html' ? 'active' : ''}" href="dashboard.html">
                  <i class="bi bi-grid-fill nav-icon"></i>
                  <span class="nav-label">Dashboard</span>
                </a>

                <a class="portal-nav-btn ${page === 'works.html' ? 'active' : ''}" href="works.html">
                  <i class="bi bi-tools nav-icon"></i>
                  <span class="nav-label">Work Orders</span>
                </a>

                <a class="portal-nav-btn ${page === 'clients.html' ? 'active' : ''}" href="clients.html">
                  <i class="bi bi-building nav-icon"></i>
                  <span class="nav-label">Clients</span>
                </a>

                <a class="portal-nav-btn ${page === 'credentials.html' ? 'active' : ''}" href="credentials.html">
                  <i class="bi bi-shield-lock-fill nav-icon"></i>
                  <span class="nav-label">Passwords</span>
                </a>

                <a class="portal-nav-btn ${page === 'payments.html' ? 'active' : ''}" href="payments.html">
                  <i class="bi bi-cash-stack nav-icon"></i>
                  <span class="nav-label">Billing</span>
                </a>

                ${currentUser.role === 'admin' ? `
                  <a class="portal-nav-btn ${page === 'users.html' ? 'active' : ''}" href="users.html">
                    <i class="bi bi-people-fill nav-icon"></i>
                    <span class="nav-label">Users (${activeCount}/15)</span>
                  </a>

                  <a class="portal-nav-btn ${page === 'backup.html' ? 'active' : ''}" href="backup.html">
                    <i class="bi bi-cloud-arrow-down-fill nav-icon"></i>
                    <span class="nav-label">Backup</span>
                  </a>
                ` : ''}
              ` : `
                <a class="portal-nav-btn ${page === 'technician.html' ? 'active' : ''}" href="technician.html">
                  <i class="bi bi-wrench-adjustable-circle-fill nav-icon"></i>
                  <span class="nav-label">My Works</span>
                </a>
              `}
            </div>

            <!-- Website Link & Logout Action Buttons -->
            <div class="d-flex align-items-center gap-2 ms-lg-auto mt-2 mt-lg-0">
              <a href="../index.html" class="portal-nav-btn text-white text-decoration-none px-3" style="flex: 0 0 auto; min-width: auto; height: 58px;" title="Visit Public Website">
                <i class="bi bi-globe nav-icon"></i>
                <span class="nav-label">Website</span>
              </a>

              <button onclick="GermonStore.logout()" class="portal-nav-btn btn-logout border-0 text-white px-3" style="flex: 0 0 auto; min-width: auto; height: 58px;" title="Logout Portal">
                <i class="bi bi-box-arrow-right nav-icon"></i>
                <span class="nav-label">Logout</span>
              </button>
            </div>
          </div>

        </div>
      </nav>
    `;
  }
})();
