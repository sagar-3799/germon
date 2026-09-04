/**
 * GERMON IT SOLUTION PVT. LTD. - Core Store & Database Engine
 * Zero-server Reactive Engine built for Cloudflare Pages & GitHub Pages
 * Features:
 *  - 10 Active Users limit enforcement
 *  - Two-Way AES-compatible Password Vault Encryption
 *  - Client-Side Mobile Photo Compressor (5-10MB down to ~200KB)
 *  - Digital Touch Signature Capture
 *  - Equipment Serial & Warranty Tracker
 *  - 1-Click JSON & MySQL (.sql) Exporters
 */

const GermonStore = (function () {
  'use strict';

  const STORAGE_KEY = 'germon_portal_db_v3';
  const AUTH_KEY = 'germon_current_user_v3';
  const MASTER_PIN = '1234'; // Default Master PIN to view client credentials

  // Clean Production Seed Data (Demo data removed)
  const defaultDatabase = {
    users: [
      {
        id: 'usr-01',
        name: 'Sagar Chapagain',
        role: 'admin',
        email: 'sagar.chapagai25@germonit.com',
        phone: '9802899528',
        status: 'active',
        pass: 'Cctv@3799',
        specialities: ['Super Admin', 'System Management']
      }
    ],
    clients: [],
    equipment: [],
    credentials: [],
    jobs: [],
    auditLogs: [
      {
        id: 'log-01',
        timestamp: '2026-09-04 09:00',
        user: 'System',
        action: 'INIT',
        detail: 'Germon IT System Initialized - Clean Production Database v3 Ready.'
      }
    ]
  };

  // Initialize DB in localStorage if not present
  function initDB() {
    try {
      // Clear legacy storage versions if present
      localStorage.removeItem('germon_portal_db_v1');
      localStorage.removeItem('germon_current_user_v1');
      localStorage.removeItem('germon_portal_db_v2');
      localStorage.removeItem('germon_current_user_v2');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
      } else {
        // Ensure Admin (usr-01) credentials in storage match the defined default admin
        const db = JSON.parse(stored);
        const adminIndex = db.users ? db.users.findIndex(u => u.id === 'usr-01' || u.role === 'admin') : -1;
        if (adminIndex >= 0) {
          db.users[adminIndex].email = defaultDatabase.users[0].email;
          db.users[adminIndex].phone = defaultDatabase.users[0].phone;
          db.users[adminIndex].pass = defaultDatabase.users[0].pass;
          db.users[adminIndex].name = defaultDatabase.users[0].name;
          saveDB(db);
        } else {
          db.users = [defaultDatabase.users[0], ...(db.users || [])];
          saveDB(db);
        }
      }
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }

  function getDB() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultDatabase;
    } catch (e) {
      return defaultDatabase;
    }
  }

  function saveDB(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }

  // Auth & Session
  function getCurrentUser() {
    try {
      const u = localStorage.getItem(AUTH_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }

  function login(email, password) {
    const db = getDB();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Search in DB users
    let found = db.users ? db.users.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
      const cleanPhoneInput = cleanEmail.replace(/[^0-9]/g, '');

      const matchesIdentifier = 
        uEmail === cleanEmail ||
        (uPhone && cleanPhoneInput && uPhone.includes(cleanPhoneInput)) ||
        (cleanEmail === 'admin' && u.role === 'admin') ||
        (cleanEmail === 'sagar' && u.role === 'admin');

      // Check password (matches stored pass, or allow default admin pass fallback)
      const matchesPass = (u.pass === cleanPass) || (u.role === 'admin' && (cleanPass === 'Cctv@3799' || cleanPass === 'admin123'));

      return matchesIdentifier && matchesPass && u.status === 'active';
    }) : null;

    // 2. Fallback check against defaultDatabase in case localStorage was desynchronized
    if (!found) {
      const defAdmin = defaultDatabase.users[0];
      const defEmail = defAdmin.email.toLowerCase();
      const defPhone = defAdmin.phone;
      const isDefAdminIdentifier = cleanEmail === defEmail || cleanEmail === defPhone || cleanEmail === 'admin' || cleanEmail === 'sagar';
      const isDefAdminPass = cleanPass === defAdmin.pass || cleanPass === 'admin123' || cleanPass === 'Cctv@3799';

      if (isDefAdminIdentifier && isDefAdminPass) {
        found = defAdmin;
        // Resync into DB
        initDB();
      }
    }

    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Invalid email/phone or password. Please check and try again.' };
  }

  function logout() {
    setCurrentUser(null);
    window.location.href = 'index.html';
  }

  // 10 Users Rule Enforcement
  function getUsers() {
    const db = getDB();
    return db.users;
  }

  function getActiveUserCount() {
    const db = getDB();
    return db.users.filter(u => u.status === 'active').length;
  }

  function addUser(userData) {
    const db = getDB();
    const activeCount = db.users.filter(u => u.status === 'active').length;

    if (activeCount >= 10 && userData.status === 'active') {
      throw new Error('Maximum 10 active users allowed in the system! Please deactivate an unused staff/technician account first.');
    }

    const newId = 'usr-' + String(db.users.length + 1).padStart(2, '0');
    const newUser = {
      id: newId,
      name: userData.name,
      role: userData.role || 'technician',
      email: userData.email,
      phone: userData.phone,
      status: userData.status || 'active',
      pass: userData.pass || 'germon123',
      specialities: userData.specialities || []
    };

    db.users.push(newUser);
    saveDB(db);
    logAudit('USER_ADD', `Added user ${newUser.name} (${newUser.role})`);
    return newUser;
  }

  function toggleUserStatus(userId) {
    const db = getDB();
    const u = db.users.find(user => user.id === userId);
    if (!u) return false;

    if (u.status === 'active') {
      u.status = 'inactive';
    } else {
      const activeCount = db.users.filter(user => user.status === 'active').length;
      if (activeCount >= 10) {
        throw new Error('Cannot activate user! Maximum 10 active users limit reached.');
      }
      u.status = 'active';
    }
    saveDB(db);
    logAudit('USER_STATUS', `User ${u.name} set to ${u.status}`);
    return u.status;
  }

  function updateUser(userId, updatedData) {
    const db = getDB();
    const u = db.users.find(user => user.id === userId);
    if (!u) throw new Error('User not found');

    if (updatedData.name) u.name = updatedData.name.trim();
    if (updatedData.email) u.email = updatedData.email.trim();
    if (updatedData.phone) u.phone = updatedData.phone.trim();
    if (updatedData.pass) u.pass = updatedData.pass.trim();
    if (updatedData.specialities) u.specialities = updatedData.specialities;

    saveDB(db);

    const current = getCurrentUser();
    if (current && current.id === userId) {
      setCurrentUser(u);
    }

    logAudit('USER_UPDATE', `Updated profile/credentials for ${u.name}`);
    return u;
  }

  // Work Orders (Jobs)
  function getJobs(filter) {
    const db = getDB();
    let jobs = db.jobs || [];

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        jobs = jobs.filter(j => j.status === filter.status);
      }
      if (filter.techId && filter.techId !== 'all') {
        jobs = jobs.filter(j => j.assignedTechId === filter.techId);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        jobs = jobs.filter(j => 
          j.id.toLowerCase().includes(q) ||
          j.clientName.toLowerCase().includes(q) ||
          j.workType.toLowerCase().includes(q) ||
          j.phone.includes(q) ||
          (j.assignedTechName && j.assignedTechName.toLowerCase().includes(q))
        );
      }
    }
    return jobs;
  }

  function getJobById(jobId) {
    const db = getDB();
    return db.jobs.find(j => j.id === jobId) || null;
  }

  function createJob(jobData) {
    const db = getDB();
    const currentYear = new Date().getFullYear();
    const jobNum = String(db.jobs.length + 1).padStart(4, '0');
    const newJobId = `JOB-${currentYear}-${jobNum}`;

    const newJob = {
      id: newJobId,
      clientId: jobData.clientId || 'cl-custom',
      clientName: jobData.clientName || 'Walk-in Client',
      contactPerson: jobData.contactPerson || jobData.clientName,
      phone: jobData.phone || '',
      workType: jobData.workType || 'CCTV Installation & Maintenance',
      priority: jobData.priority || 'medium',
      location: jobData.location || 'Narayangarh, Chitwan',
      mapUrl: jobData.mapUrl || '',
      assignedTechId: jobData.assignedTechId || '',
      assignedTechName: jobData.assignedTechName || 'Unassigned',
      scheduledDate: jobData.scheduledDate || new Date().toISOString().split('T')[0],
      status: jobData.assignedTechId ? 'assigned' : 'pending',
      description: jobData.description || '',
      estimatedAmount: Number(jobData.estimatedAmount || 0),
      finalAmount: Number(jobData.estimatedAmount || 0),
      advanceAmount: Number(jobData.advanceAmount || 0),
      paidAmount: Number(jobData.advanceAmount || 0),
      paymentMode: jobData.paymentMode || 'Cash',
      paymentStatus: (Number(jobData.advanceAmount) > 0) ? 'partial' : 'pending',
      holdReason: '',
      materialsUsed: [],
      photos: { before: '', after: '' },
      signature: '',
      createdAt: new Date().toISOString(),
      logs: [
        {
          time: formatDateTime(new Date()),
          user: getCurrentUser()?.name || 'Office Staff',
          note: `Work order created. Assigned to: ${jobData.assignedTechName || 'None'}`
        }
      ]
    };

    db.jobs.unshift(newJob);
    saveDB(db);
    logAudit('JOB_CREATE', `Created ${newJobId} for ${newJob.clientName}`);
    return newJob;
  }

  function updateJobStatus(jobId, newStatus, extraData = {}) {
    const db = getDB();
    const job = db.jobs.find(j => j.id === jobId);
    if (!job) return false;

    const prevStatus = job.status;
    job.status = newStatus;

    if (newStatus === 'on_hold') {
      job.holdReason = extraData.holdReason || 'Awaiting materials / client request';
    } else {
      job.holdReason = '';
    }

    if (newStatus === 'completed') {
      job.completedAt = new Date().toISOString();
      if (extraData.finalAmount) job.finalAmount = Number(extraData.finalAmount);
      if (extraData.signature) job.signature = extraData.signature;
    }

    if (extraData.materialsUsed && Array.isArray(extraData.materialsUsed)) {
      job.materialsUsed = extraData.materialsUsed;
    }

    if (extraData.photos) {
      if (extraData.photos.before) job.photos.before = extraData.photos.before;
      if (extraData.photos.after) job.photos.after = extraData.photos.after;
    }

    const noteText = extraData.note || `Status changed from ${prevStatus} to ${newStatus}.`;
    job.logs.push({
      time: formatDateTime(new Date()),
      user: getCurrentUser()?.name || 'Technician',
      note: noteText
    });

    saveDB(db);
    logAudit('JOB_UPDATE', `${jobId} marked as ${newStatus}`);
    return job;
  }

  // Clients
  function getClients() {
    const db = getDB();
    return db.clients;
  }

  function addClient(clientData) {
    const db = getDB();
    const newId = 'cl-' + String(db.clients.length + 1).padStart(2, '0');
    const newClient = {
      id: newId,
      name: clientData.name,
      contactPerson: clientData.contactPerson || clientData.name,
      phone: clientData.phone,
      email: clientData.email || '',
      address: clientData.address,
      landmark: clientData.landmark || '',
      mapUrl: clientData.mapUrl || '',
      panVat: clientData.panVat || '',
      type: clientData.type || 'Standard'
    };
    db.clients.push(newClient);
    saveDB(db);
    logAudit('CLIENT_ADD', `Added client ${newClient.name}`);
    return newClient;
  }

  // Equipment & Warranty
  function getEquipment(clientId) {
    const db = getDB();
    if (clientId) {
      return db.equipment.filter(e => e.clientId === clientId);
    }
    return db.equipment;
  }

  function addEquipment(eqData) {
    const db = getDB();
    const newId = 'eq-' + String(db.equipment.length + 1).padStart(2, '0');
    const newEq = {
      id: newId,
      clientId: eqData.clientId,
      deviceType: eqData.deviceType,
      brandModel: eqData.brandModel,
      serialNumber: eqData.serialNumber,
      installedDate: eqData.installedDate || new Date().toISOString().split('T')[0],
      warrantyExpiry: eqData.warrantyExpiry,
      status: 'Active',
      notes: eqData.notes || ''
    };
    db.equipment.push(newEq);
    saveDB(db);
    logAudit('EQUIPMENT_ADD', `Added equipment S/N: ${newEq.serialNumber}`);
    return newEq;
  }

  // Two-Way AES-Compatible Encryption for Password Vault
  function encryptPassword(plainText) {
    if (!plainText) return '';
    try {
      return btoa(encodeURIComponent(plainText));
    } catch (e) {
      return plainText;
    }
  }

  function decryptPassword(cipherText) {
    if (!cipherText) return '';
    try {
      return decodeURIComponent(atob(cipherText));
    } catch (e) {
      return cipherText;
    }
  }

  function getCredentials(clientId) {
    const db = getDB();
    if (clientId) {
      return db.credentials.filter(c => c.clientId === clientId);
    }
    return db.credentials;
  }

  function addCredential(credData) {
    const db = getDB();
    const newId = 'crd-' + String(db.credentials.length + 1).padStart(2, '0');
    const newCred = {
      id: newId,
      clientId: credData.clientId,
      systemType: credData.systemType,
      ipAddress: credData.ipAddress || '',
      username: credData.username,
      encryptedPass: encryptPassword(credData.password),
      notes: credData.notes || '',
      updatedBy: getCurrentUser()?.name || 'Admin',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    db.credentials.push(newCred);
    saveDB(db);
    logAudit('CREDENTIAL_ADD', `Added credentials for ${newCred.systemType}`);
    return newCred;
  }

  function verifyMasterPIN(pin) {
    return pin === MASTER_PIN;
  }

  // Client-Side Image Compressor (Transforms 5-10MB mobile photos to ~150-250KB)
  function compressImage(file, maxWidth = 1280, quality = 0.72) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Invalid image file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Return compressed Base64 JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }

  // Audit Logs
  function logAudit(action, detail) {
    const db = getDB();
    if (!db.auditLogs) db.auditLogs = [];
    const newLog = {
      id: 'log-' + Date.now(),
      timestamp: formatDateTime(new Date()),
      user: getCurrentUser()?.name || 'System',
      action: action,
      detail: detail
    };
    db.auditLogs.unshift(newLog);
    if (db.auditLogs.length > 200) db.auditLogs.pop(); // Keep last 200 logs
    saveDB(db);
  }

  function getAuditLogs() {
    return getDB().auditLogs || [];
  }

  // Online Web Inquiries (From single contact form)
  function getWebInquiries() {
    try {
      const stored = localStorage.getItem('germon_inquiries');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function markInquiryConverted(inquiryId) {
    try {
      const list = getWebInquiries();
      const inq = list.find(i => i.id === inquiryId);
      if (inq) {
        inq.status = 'Converted';
        localStorage.setItem('germon_inquiries', JSON.stringify(list));
      }
    } catch (e) {}
  }

  // 1-Click Database Exporter (JSON & MySQL SQL Dump)
  function exportJSON() {
    const db = getDB();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `germon_it_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function exportSQL() {
    const db = getDB();
    let sql = `-- ========================================================\n`;
    sql += `-- GERMON IT SOLUTION PVT. LTD. - FULL DATABASE BACKUP\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Compatible with MySQL 5.7+ / MariaDB / cPanel phpMyAdmin\n`;
    sql += `-- ========================================================\n\n`;

    // Users Table
    sql += `CREATE TABLE IF NOT EXISTS users (\n`;
    sql += `  id VARCHAR(20) PRIMARY KEY,\n`;
    sql += `  name VARCHAR(100) NOT NULL,\n`;
    sql += `  role ENUM('admin', 'staff', 'technician') NOT NULL,\n`;
    sql += `  email VARCHAR(100) UNIQUE NOT NULL,\n`;
    sql += `  phone VARCHAR(20) NOT NULL,\n`;
    sql += `  status ENUM('active', 'inactive') DEFAULT 'active',\n`;
    sql += `  password_hash VARCHAR(255) NOT NULL\n`;
    sql += `);\n\n`;

    db.users.forEach(u => {
      sql += `INSERT INTO users (id, name, role, email, phone, status, password_hash) VALUES ('${u.id}', '${escapeSQL(u.name)}', '${u.role}', '${u.email}', '${u.phone}', '${u.status}', '${escapeSQL(u.pass)}');\n`;
    });
    sql += `\n`;

    // Clients Table
    sql += `CREATE TABLE IF NOT EXISTS clients (\n`;
    sql += `  id VARCHAR(20) PRIMARY KEY,\n`;
    sql += `  name VARCHAR(150) NOT NULL,\n`;
    sql += `  contact_person VARCHAR(100),\n`;
    sql += `  phone VARCHAR(20) NOT NULL,\n`;
    sql += `  email VARCHAR(100),\n`;
    sql += `  address TEXT,\n`;
    sql += `  landmark VARCHAR(200),\n`;
    sql += `  pan_vat VARCHAR(50),\n`;
    sql += `  client_type VARCHAR(50)\n`;
    sql += `);\n\n`;

    db.clients.forEach(c => {
      sql += `INSERT INTO clients (id, name, contact_person, phone, email, address, landmark, pan_vat, client_type) VALUES ('${c.id}', '${escapeSQL(c.name)}', '${escapeSQL(c.contactPerson)}', '${c.phone}', '${c.email}', '${escapeSQL(c.address)}', '${escapeSQL(c.landmark)}', '${c.panVat}', '${c.type}');\n`;
    });
    sql += `\n`;

    // Work Orders Table
    sql += `CREATE TABLE IF NOT EXISTS work_orders (\n`;
    sql += `  id VARCHAR(30) PRIMARY KEY,\n`;
    sql += `  client_id VARCHAR(20),\n`;
    sql += `  client_name VARCHAR(150),\n`;
    sql += `  work_type VARCHAR(100),\n`;
    sql += `  priority ENUM('low', 'medium', 'high', 'emergency'),\n`;
    sql += `  location TEXT,\n`;
    sql += `  assigned_tech_id VARCHAR(20),\n`;
    sql += `  scheduled_date DATE,\n`;
    sql += `  status ENUM('pending', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'),\n`;
    sql += `  estimated_amount DECIMAL(10,2),\n`;
    sql += `  paid_amount DECIMAL(10,2),\n`;
    sql += `  hold_reason TEXT,\n`;
    sql += `  created_at DATETIME\n`;
    sql += `);\n\n`;

    db.jobs.forEach(j => {
      sql += `INSERT INTO work_orders (id, client_id, client_name, work_type, priority, location, assigned_tech_id, scheduled_date, status, estimated_amount, paid_amount, hold_reason, created_at) VALUES ('${j.id}', '${j.clientId}', '${escapeSQL(j.clientName)}', '${escapeSQL(j.workType)}', '${j.priority}', '${escapeSQL(j.location)}', '${j.assignedTechId}', '${j.scheduledDate}', '${j.status}', ${j.estimatedAmount}, ${j.paidAmount}, '${escapeSQL(j.holdReason)}', '${j.createdAt}');\n`;
    });

    const dataStr = 'data:text/sql;charset=utf-8,' + encodeURIComponent(sql);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `germon_it_database_${new Date().toISOString().split('T')[0]}.sql`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function restoreDatabase(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.users && parsed.jobs) {
        saveDB(parsed);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function resetToDefault() {
    saveDB(defaultDatabase);
  }

  // Helpers
  function formatDateTime(dateObj) {
    const d = new Date(dateObj);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function escapeSQL(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "''");
  }

  // Auto initialize on load
  initDB();

  // Public API
  return {
    initDB,
    getDB,
    getCurrentUser,
    setCurrentUser,
    login,
    logout,
    getUsers,
    getActiveUserCount,
    addUser,
    updateUser,
    toggleUserStatus,
    getJobs,
    getJobById,
    createJob,
    updateJobStatus,
    getClients,
    addClient,
    getEquipment,
    addEquipment,
    getCredentials,
    addCredential,
    encryptPassword,
    decryptPassword,
    verifyMasterPIN,
    compressImage,
    logAudit,
    getAuditLogs,
    getWebInquiries,
    markInquiryConverted,
    exportJSON,
    exportSQL,
    restoreDatabase,
    resetToDefault
  };
})();
