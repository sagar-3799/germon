/* ==========================================================================
   GERMON IT SOLUTION PVT. LTD. - Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. Sticky Navbar & Header Scroll State
  // ------------------------------------------------------------------------
  const navbar = document.querySelector('.navbar-custom');
  const backToTopBtn = document.querySelector('.back-to-top');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 80) {
      if (navbar) navbar.classList.add('scrolled');
      if (backToTopBtn) backToTopBtn.classList.add('show');
    } else {
      if (navbar) navbar.classList.remove('scrolled');
      if (backToTopBtn) backToTopBtn.classList.remove('show');
    }
  });

  // Smooth scroll back to top
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ------------------------------------------------------------------------
  // 2. Highlight Active Navigation Item based on current URL
  // ------------------------------------------------------------------------
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  navLinks.forEach(function (link) {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // ------------------------------------------------------------------------
  // 3. Portfolio Filter Logic (Portfolio Page)
  // ------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item-wrapper');

  if (filterBtns.length > 0 && portfolioItems.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');

        portfolioItems.forEach(function (item) {
          const category = item.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            item.style.display = 'block';
            item.classList.add('animate-zoom-in');
          } else {
            item.style.display = 'none';
            item.classList.remove('animate-zoom-in');
          }
        });
      });
    });
  }

  // ------------------------------------------------------------------------
  // 4. Portfolio Lightbox / Image Preview Modal
  // ------------------------------------------------------------------------
  const portfolioZoomBtns = document.querySelectorAll('.portfolio-zoom-btn');
  const modalImg = document.getElementById('portfolioModalImage');
  const modalTitle = document.getElementById('portfolioModalTitle');
  const modalDesc = document.getElementById('portfolioModalDesc');

  if (portfolioZoomBtns.length > 0) {
    portfolioZoomBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const imgSrc = this.getAttribute('data-img');
        const title = this.getAttribute('data-title');
        const desc = this.getAttribute('data-desc');

        if (modalImg) modalImg.src = imgSrc;
        if (modalTitle) modalTitle.textContent = title || 'Project Showcase';
        if (modalDesc) modalDesc.textContent = desc || 'Germon IT Solution Pvt. Ltd. Project Execution';

        const modalElement = document.getElementById('portfolioPreviewModal');
        if (modalElement && typeof bootstrap !== 'undefined') {
          const modalInstance = new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. Contact Form Validation, Portal Integration & WhatsApp Modal
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const inquiryModalEl = document.getElementById('inquirySuccessModal');

  // Auto-fill service from URL query params (e.g. contact.html?service=cctv)
  if (contactForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      const serviceSelect = document.getElementById('serviceSelect');
      if (serviceSelect) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
          const optVal = serviceSelect.options[i].value.toLowerCase();
          if (optVal.includes(serviceParam.toLowerCase()) || serviceSelect.options[i].text.toLowerCase().includes(serviceParam.toLowerCase())) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      
      if (!contactForm.checkValidity()) {
        e.stopPropagation();
        contactForm.classList.add('was-validated');
        return;
      }

      const nameVal = document.getElementById('nameInput')?.value.trim() || 'Valued Client';
      const phoneVal = document.getElementById('phoneInput')?.value.trim() || '';
      const emailVal = document.getElementById('emailInput')?.value.trim() || '';
      const serviceVal = document.getElementById('serviceSelect')?.value || 'General Inquiry';
      const locationVal = document.getElementById('locationInput')?.value.trim() || 'Chitwan';
      const urgencyVal = document.getElementById('urgencySelect')?.value || 'Normal';
      const subjectVal = document.getElementById('subjectInput')?.value.trim() || '';
      const messageVal = document.getElementById('messageInput')?.value.trim() || '';

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Submitting Inquiry...';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Generate Inquiry ID
        const currentYear = new Date().getFullYear();
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const inquiryId = `INQ-${currentYear}-${randNum}`;

        // Save into Portal Storage
        try {
          const existingInquiries = JSON.parse(localStorage.getItem('germon_inquiries') || '[]');
          const newInquiry = {
            id: inquiryId,
            name: nameVal,
            phone: phoneVal,
            email: emailVal,
            service: serviceVal,
            location: locationVal,
            urgency: urgencyVal,
            subject: subjectVal,
            message: messageVal,
            date: new Date().toISOString(),
            status: 'New'
          };
          existingInquiries.unshift(newInquiry);
          localStorage.setItem('germon_inquiries', JSON.stringify(existingInquiries));
        } catch (err) {
          console.warn('Could not save to localStorage:', err);
        }

        contactForm.reset();
        contactForm.classList.remove('was-validated');

        // Populate and open Confirmation Modal
        const modalCustomerName = document.getElementById('modalCustomerName');
        const modalInquiryId = document.getElementById('modalInquiryId');
        const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

        if (modalCustomerName) modalCustomerName.textContent = nameVal;
        if (modalInquiryId) modalInquiryId.textContent = inquiryId;

        if (modalWhatsAppBtn) {
          const waText = encodeURIComponent(
            `Namaste Germon IT Solution!\n\n` +
            `My Name: ${nameVal}\n` +
            `Inquiry ID: ${inquiryId}\n` +
            `Service: ${serviceVal}\n` +
            `Location: ${locationVal}\n` +
            `Urgency: ${urgencyVal}\n` +
            `Message: ${messageVal || subjectVal}`
          );
          modalWhatsAppBtn.href = `https://wa.me/9779866284949?text=${waText}`;
        }

        if (inquiryModalEl && typeof bootstrap !== 'undefined') {
          const modalInst = new bootstrap.Modal(inquiryModalEl);
          modalInst.show();
        } else {
          alert(`Thank you ${nameVal}! Your inquiry ${inquiryId} has been submitted. Our team will contact you shortly.`);
        }
      }, 700);
    });
  }

  // ------------------------------------------------------------------------
  // 6. Newsletter Subscription Handler
  // ------------------------------------------------------------------------
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        alert('Thank you for subscribing to Germon IT Solution newsletter!');
        emailInput.value = '';
      }
    });
  }
});
