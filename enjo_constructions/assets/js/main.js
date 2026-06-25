/* ============================================================
   ENJO CONSTRUCTIONS – Main JavaScript
   ============================================================ */

'use strict';

// ── Navbar scroll effect ────────────────────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
  // On inner pages the navbar is always dark
  if (navbar.classList.contains('always-dark')) {
    // already styled via CSS
  }

  window.addEventListener('scroll', () => {
    if (!navbar.classList.contains('always-dark')) {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
  });

  // Set active state based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    } else {
      // Remove any stale aria-current set in HTML (except on correct page)
      if (link.getAttribute('aria-current') === 'page' && href !== currentPage) {
        link.removeAttribute('aria-current');
      }
    }
  });
}

// ── Mobile hamburger & Side Drawer ──────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('#nav-links');

if (hamburger && navLinks) {
  const closeDrawer = () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
    const backdrop = document.querySelector('.nav-backdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
  };

  const openDrawer = () => {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('open');
    document.body.style.overflow = 'hidden';

    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', closeDrawer);
    }
    // Force reflow before adding class for transition
    void backdrop.offsetWidth;
    backdrop.classList.add('open');
  };

  hamburger.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Close drawer when any link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Close drawer on resize back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
      closeDrawer();
    }
  });

  // ESC key closes drawer
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeDrawer();
    }
  });
}

// ── Scroll reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Toast notification ──────────────────────────────────────
function showToast(message, icon = 'fa-circle-check', isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.style.background = isError ? 'var(--terracotta)' : 'var(--green-dark)';
  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

// ── Form Validation Helpers ─────────────────────────────────
function clearFormErrors(form) {
  form.querySelectorAll('.invalid-field').forEach(input => {
    input.classList.remove('invalid-field');
  });
  form.querySelectorAll('.error-msg').forEach(msg => {
    msg.remove();
  });
}

function showFieldError(input, message) {
  input.classList.add('invalid-field');
  let errorMsg = input.parentNode.querySelector('.error-msg');
  if (!errorMsg) {
    errorMsg = document.createElement('span');
    errorMsg.className = 'error-msg';
    input.parentNode.appendChild(errorMsg);
  }
  errorMsg.textContent = message;
}

// ── Newsletter form ─────────────────────────────────────────
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    clearFormErrors(form);

    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;

    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailVal) {
      showFieldError(emailInput, 'Email address is required.');
      return;
    } else if (!emailRegex.test(emailVal)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      return;
    }

    // Store locally
    try {
      const subscribers = JSON.parse(localStorage.getItem('enjo_newsletter_subscribers') || '[]');
      subscribers.push({ email: emailVal, timestamp: new Date().toISOString() });
      localStorage.setItem('enjo_newsletter_subscribers', JSON.stringify(subscribers));
    } catch (err) {}

    showToast('🎉 You\'re subscribed! Weekly tips incoming.', 'fa-circle-check');
    form.reset();
  });
});

// ── Contact form – EmailJS integration ─────────────────────
// Uses EmailJS free tier to send directly to enjoconstruction@gmail.com
// Service & template IDs are configured in contact.html <head>
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearFormErrors(contactForm);

    const nameInput    = document.getElementById('contact-name');
    const phoneInput   = document.getElementById('contact-phone');
    const emailInput   = document.getElementById('contact-email-field');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const submitBtn    = document.getElementById('contact-submit');

    let hasError = false;

    // Name validation
    if (!nameInput.value.trim()) {
      showFieldError(nameInput, 'Full name is required.');
      hasError = true;
    } else if (nameInput.value.trim().length < 3) {
      showFieldError(nameInput, 'Name must be at least 3 characters.');
      hasError = true;
    }

    // Phone validation
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal) {
      showFieldError(phoneInput, 'Phone / WhatsApp number is required.');
      hasError = true;
    } else if (phoneVal.replace(/[\s\-+()]/g, '').length < 9) {
      showFieldError(phoneInput, 'Please enter a valid phone number.');
      hasError = true;
    }

    // Email validation (optional – only if filled)
    if (emailInput && emailInput.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        showFieldError(emailInput, 'Please enter a valid email address.');
        hasError = true;
      }
    }

    // Message validation
    if (!messageInput.value.trim()) {
      showFieldError(messageInput, 'Message is required.');
      hasError = true;
    } else if (messageInput.value.trim().length < 10) {
      showFieldError(messageInput, 'Message must be at least 10 characters.');
      hasError = true;
    }

    if (hasError) return;

    // Button loading state
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    // Subject label map
    const subjectLabels = {
      'floor-plan'   : 'I want a floor plan',
      'cost-estimate': 'I need a cost estimate',
      'consultation' : 'General construction advice',
      'custom'       : 'Custom / bespoke design',
      'permits'      : 'Permits & regulations',
      'other'        : 'Other enquiry'
    };

    const subjectVal   = subjectInput ? subjectInput.value : '';
    const subjectLabel = subjectLabels[subjectVal] || subjectVal || 'General Enquiry';

    // Build template params for EmailJS
    const templateParams = {
      from_name   : nameInput.value.trim(),
      phone       : phoneVal,
      from_email  : emailInput ? (emailInput.value.trim() || 'Not provided') : 'Not provided',
      subject     : subjectLabel,
      message     : messageInput.value.trim(),
      reply_to    : emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'noreply@enjoconstructions.com',
      sent_time   : new Date().toLocaleString('en-UG', { dateStyle: 'full', timeStyle: 'short' })
    };

    // Save to localStorage as backup regardless
    try {
      const submissions = JSON.parse(localStorage.getItem('enjo_submissions') || '[]');
      submissions.push({ ...templateParams, timestamp: new Date().toISOString() });
      localStorage.setItem('enjo_submissions', JSON.stringify(submissions));
    } catch (err) {}

    // Send via EmailJS
    try {
      if (typeof emailjs !== 'undefined') {
        await emailjs.send(
          window.EMAILJS_SERVICE_ID  || 'service_enjo',
          window.EMAILJS_TEMPLATE_ID || 'template_enjo_contact',
          templateParams
        );
      }

      // Show success
      const inlineSuccess = document.getElementById('form-success');
      if (inlineSuccess) {
        inlineSuccess.classList.add('show');
        setTimeout(() => inlineSuccess.classList.remove('show'), 7000);
      }
      showToast('✅ Message sent! We\'ll reply within 24 hours.', 'fa-paper-plane');
      contactForm.reset();

    } catch (err) {
      console.error('EmailJS send error:', err);
      // Even if EmailJS fails, confirm to user (data is saved locally + WhatsApp fallback visible)
      showToast('Message saved! For fastest reply, also WhatsApp us.', 'fa-paper-plane');
      contactForm.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });
}

// ── Filter state (Plans page) ────────────────────────────────
window.applyFilters = function(immediate = false) {
  const bedrooms = document.getElementById('filter-beds')?.value   || 'all';
  const budget   = document.getElementById('filter-budget')?.value || 'all';
  const type     = document.getElementById('filter-type')?.value   || 'all';
  const cards    = document.querySelectorAll('.plan-card[data-price]');
  const loader   = document.getElementById('plans-loader');
  const grid     = document.getElementById('plans-grid');

  const performFiltering = () => {
    let visible = 0;
    cards.forEach(card => {
      const cb = card.dataset.beds;
      const ct = card.dataset.type;
      const cp = parseInt(card.dataset.price, 10);

      let show = true;
      if (bedrooms !== 'all' && cb !== bedrooms) show = false;
      if (type !== 'all' && ct !== type) show = false;

      if (budget !== 'all') {
        const parts = budget.split('-');
        const min = parseInt(parts[0], 10);
        const max = parts[1] ? parseInt(parts[1], 10) : Infinity;
        // A card is shown if its price falls within the range
        if (cp < min || cp > max) show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const noResults = document.getElementById('no-results');
    if (noResults) {
      noResults.style.display = visible === 0 ? 'flex' : 'none';
    }
  };

  if (immediate) {
    performFiltering();
  } else if (loader && grid) {
    loader.style.display = 'flex';
    grid.style.display   = 'none';
    const noResults = document.getElementById('no-results');
    if (noResults) noResults.style.display = 'none';

    setTimeout(() => {
      loader.style.display = 'none';
      grid.style.display   = 'grid';
      performFiltering();
    }, 350);
  } else {
    performFiltering();
  }
};

// ── Plan Details Modal ───────────────────────────────────────
const modalOverlay = document.getElementById('plan-modal');
const modalClose   = document.getElementById('modal-close-btn');

window.openPlanModal = function(data) {
  if (!modalOverlay) return;
  document.getElementById('modal-img').src            = data.img;
  document.getElementById('modal-img').alt            = data.title;
  document.getElementById('modal-title').textContent  = data.title;
  document.getElementById('modal-price').textContent  = data.price;
  document.getElementById('modal-beds').textContent   = data.beds + ' Bedrooms';
  document.getElementById('modal-size').textContent   = data.size + ' sqm';
  document.getElementById('modal-found').textContent  = data.foundation;
  document.getElementById('modal-type').textContent   = data.type;
  document.getElementById('modal-desc').textContent   = data.desc;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closePlanModal = function() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
};

if (modalClose) modalClose.addEventListener('click', window.closePlanModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) window.closePlanModal();
  });
}

// ── Blog search & category filter ───────────────────────────
const blogSearch = document.getElementById('blog-search');
const catTags    = document.querySelectorAll('.cat-tag');
const blogLoader = document.getElementById('blog-loader');
const blogGrid   = document.getElementById('blog-grid');

function filterBlog(immediate = false) {
  const runFilter = () => {
    const q   = blogSearch ? blogSearch.value.toLowerCase() : '';
    const cat = document.querySelector('.cat-tag.active')?.dataset.cat || 'all';
    document.querySelectorAll('.blog-card').forEach(card => {
      const title   = card.dataset.title?.toLowerCase() || '';
      const cardCat = card.dataset.cat  || '';
      const matchQ   = !q || title.includes(q);
      const matchCat = cat === 'all' || cardCat === cat;
      card.style.display = matchQ && matchCat ? '' : 'none';
    });
  };

  if (immediate) {
    runFilter();
  } else if (blogLoader && blogGrid) {
    blogLoader.style.display = 'flex';
    blogGrid.style.display   = 'none';
    setTimeout(() => {
      blogLoader.style.display = 'none';
      blogGrid.style.display   = 'grid';
      runFilter();
    }, 350);
  } else {
    runFilter();
  }
}

if (blogSearch) blogSearch.addEventListener('input', () => filterBlog(false));

catTags.forEach(tag => {
  tag.addEventListener('click', () => {
    catTags.forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    filterBlog(false);
  });
});

// ── Blog Articles Repository ────────────────────────────────
const blogArticles = [
  {
    slug: 'under-50m',
    title: 'The Complete Guide to Building a House in Uganda for Under UGX 50M',
    category: 'materials',
    date: 'June 2025',
    readtime: '12 min read',
    content: [
      'Is it really possible to build a durable, beautiful family home in Uganda with a budget under UGX 50 Million? The short answer is yes. However, achieving this requires strict discipline, careful planning, and avoiding the common pitfalls that inflate construction budgets in Kampala and surrounding districts.',
      'The foundation of building within a tight budget is size and simplicity. You should choose a compact 2-bedroom or a modest 3-bedroom design ranging between 60 to 90 square meters. Complex multi-angled walls and high hip roofs consume vast amounts of bricks, cement, and timber. Stick to a simple rectangular layout.',
      'When sourcing building materials in Kampala, avoid buying bag-by-bag from local hardware shops in your suburb. Retail prices are marked up by 20% to 30%. Sourcing cement directly from wholesale distributors in Nakasero or Kyambogo, and negotiating Murram and aggregate in full truckloads (rather than forwarders), can save you millions.',
      'Another crucial cost-saving strategy is labor management. Avoid commercial contractors if you are on a tight budget. Instead, hire a qualified local "fundi" directly, and structure their payment on a fixed contract per building phase (e.g., foundation, walling to ring-beam, and roofing) rather than daily wages. A contract keeps the fundi motivated to finish quickly.',
      'Lastly, manage your finishes incrementally. You do not need to install ceramic tiles, high-end plaster ceilings, or plaster-finish interior walls on day one. Move in with simple concrete screed floors and paint the raw brick or cement walls. Finish the house room-by-room as savings accumulate.'
    ]
  },
  {
    slug: 'cement',
    title: 'How to Save 20% on Cement in Kampala',
    category: 'materials',
    date: 'May 2025',
    readtime: '7 min read',
    content: [
      'Cement is the glue of your construction site, and it represents one of the largest material expenses on any Ugandan build. With prices of popular brands like Tororo, Hima, and Simba fluctuating in hardware shops, smart homebuilders are deploying clever buying tactics to secure savings of 20% or more.',
      'The first rule of thumb is buying in bulk. Sourcing cement 5 or 10 bags at a time from a local hardware store in Wakiso or Kira is highly inefficient. Wholesalers in Kampala\'s Industrial Area or distributors offer discount brackets starting at 50 bags. Pool your requirements for a phase and order them all together to unlock these wholesale rates.',
      'Timing is also key. In Uganda, cement prices typically spike during the rainy seasons (March to May and September to November). Heavy rains disrupt transport from manufacturing hubs in Tororo and Hima, causing localized shortages. Buy and store your cement during the dry seasons when distribution is stable and prices level out.',
      'Storage is a common source of wastage. Cement is highly sensitive to moisture. Storing bags directly on a concrete slab or soil floor allows them to absorb ground dampness, causing the cement to clump and harden inside the bag. Always build a raised platform using wooden pallets, and cover the stack with a thick polythene sheet to protect it from air humidity.'
    ]
  },
  {
    slug: 'clay',
    title: 'Foundation Tips for Uganda\'s Clay Soils',
    category: 'design',
    date: 'May 2025',
    readtime: '8 min read',
    content: [
      'Expansive clay soils—popularly known as "black cotton soil"—are common in swampy and low-lying parts of Kampala, Wakiso, and Mukono. While clay provides a lush landscape, it is a nightmare for structural engineers. Clay expands heavily when saturated with water during rainy seasons and shrinks, cracking deep fissures, during dry periods.',
      'If you build a house on clay using a standard shallow strip foundation, the swelling soil will push against the house base, creating massive structural cracks in your walls. To build safely, you must select the correct foundation. For residential bungalows, structural engineers recommend a raft foundation.',
      'A raft foundation (or floating slab) behaves like a concrete raft sitting on a sea of clay. It distributes the weight of the entire house evenly across the surface. If the soil shifts or expands, the entire concrete slab moves uniformly, preventing differential settlement that breaks brickwork.',
      'If your budget forces you to use a strip foundation, you must excavate deeper than usual. You must dig through the clay layer until you reach stable red soil or stone (which can be 1.5 to 2 meters deep), clear the bottom, and backfill with thoroughly compacted murram before pouring concrete. Never skip soil inspection; a sinking house costs far more to rectify than laying the proper foundation.'
    ]
  },
  {
    slug: 'roofing',
    title: 'Roofing Options Under UGX 5M',
    category: 'materials',
    date: 'April 2025',
    readtime: '6 min read',
    content: [
      'Once your walls are up and the ring-beam has cured, you face the most capital-intensive phase: roofing. Many Ugandan homeowners get stuck at this stage for months due to poor budgeting. If you have a strict limit of UGX 5 Million, you can still roof a standard 2 or 3-bedroom house safely by making smart design choices.',
      'First, forget about clay or concrete tiles. Tiles are heavy and require thick, expensive structural timber (like treated mahogany or mature eucalyptus) spaced closely together to support the load. They also require high labor costs. Instead, opt for modern pre-painted zinc-aluminum iron sheets.',
      'Ugandan brands like Uganda Baati and Roofings Group produce pre-painted sheets (Gauge 30 or 28) that are lightweight, durable, and come in beautiful terracotta, green, and blue finishes. Gauge 30 sheets are highly cost-effective and perfectly suitable for standard residential bungalows.',
      'To keep timber costs under control, design a simple double-pitched gable roof. Avoid complex hip roofs with valleys and ridges, which generate massive timber off-cut waste and require expensive ridge caps. A gable roof layout is simple, fast to construct, uses fewer timber trusses, and sheds tropical rain extremely well.'
    ]
  },
  {
    slug: 'permits',
    title: 'How to Get a Building Permit in Kampala (2025 Guide)',
    category: 'permits',
    date: 'April 2025',
    readtime: '9 min read',
    content: [
      'Building a house in Kampala without municipal approval is a recipe for disaster. Law enforcement officers from KCCA or Wakiso District Planning departments routinely inspect construction sites. If they catch you building without a permit, you face heavy fines, stop-work orders, or complete demolition of your structure.',
      'Getting a permit in 2025 is streamlined but requires strict documentation. You must submit: a certified copy of your land title (issued within the last three months), architectural plans drawn by a registered architect, structural plans (if building a multi-storey house), a surveyor\'s report, and neighborhood consent letters.',
      'Submissions are processed online through the physical planning portal. Once submitted, municipal surveyors inspect the plot to ensure the house footprint maintains required setbacks from boundary lines and public roads. The approval fee is calculated based on the total floor area.',
      'Although the process takes between 4 to 8 weeks, it provides immense benefits. An approved plan protects your investment, increases property value, and is mandatory when applying for utility connections from NWSC (water) and Umeme (electricity). Do not take shortcuts; get approved before clearing your site.'
    ]
  },
  {
    slug: 'labour',
    title: 'How to Hire Reliable Construction Labour in Uganda',
    category: 'labour',
    date: 'March 2025',
    readtime: '8 min read',
    content: [
      'Managing site labor is a significant challenge for homebuilders in Uganda. Substandard workmanship, missing materials, and sudden fundi desertions are common complaints. Building a trustworthy team is critical to keeping your house on schedule and within budget.',
      'First, never hire casual workers or fundis on a daily wage (known locally as "mutala") for major phases. If paid daily, workers have a financial incentive to work slowly and drag out the project. Instead, agree on a fixed-price contract for specific milestones (e.g., laying the slab, walling to beam level, roofing).',
      'In Kampala, standard daily rates in 2025 hover around UGX 20,000 to 30,000 for a skilled fundi and UGX 10,000 to 15,000 for a helper. Use these rates to estimate fair milestone prices. Never pay 100% of the milestone fee upfront. A safe structure is 30% mobilization, 40% mid-stage, and 30% after inspection.',
      'Always have a written agreement, even if handwritten, specifying the work scope, price, and deadlines. Have it signed by the fundi and witnessed by the local LC1 chairperson. This simple step establishes legal accountability and reduces disputes significantly.'
    ]
  },
  {
    slug: 'finance',
    title: 'SACCOs vs Bank Loans: Best Way to Finance Your Build',
    category: 'finance',
    date: 'March 2025',
    readtime: '10 min read',
    content: [
      'For the average Ugandan, financing a house build with pure savings is a long, slow journey. At some point, you may consider borrowing to speed up the process. The two primary loan sources are commercial banks and savings cooperatives (SACCOs). Understanding their pros and cons is vital.',
      'Commercial bank mortgages offer large loan limits and long repayment periods (up to 15–20 years). However, bank interest rates in Uganda are high, ranging between 16% and 22% per annum. They also demand strict collateral, typically the land title of the plot you are building on, and involve heavy legal and survey fees.',
      'SACCOs offer a friendlier alternative. If you belong to a SACCO (such as Wazalendo or a corporate savings group), you can borrow up to three times your accumulated savings. SACCO interest rates are generally lower (12% to 15% per annum) and calculations are straightforward, with minimal administrative fees.',
      'The best approach for residential homebuilders is building in phases. Borrow small amounts from your SACCO to complete a specific phase (like roofing), pay it off over 12 months, and then borrow again for the next phase. This incremental borrowing keeps you out of deep debt and protects your land title.'
    ]
  },
  {
    slug: 'land',
    title: 'How to Buy Land in Uganda Safely – Avoid Fraud',
    category: 'permits',
    date: 'February 2025',
    readtime: '11 min read',
    content: [
      'Land fraud is one of the most prevalent crimes in Uganda. Scammers use sophisticated methods, including forged titles and selling family land without consent, to steal money from unsuspecting buyers. Protecting yourself requires rigorous verification before hand-over of funds.',
      'Step one is performing a formal land search at the Ministry of Lands registry. A search report costs a small fee and reveals the true registered owner, the size of the plot, and whether the land carries any mortgages, bank caveats, or court disputes. Never trust a photocopy of a title.',
      'Step two is hiring an independent registered surveyor. The surveyor must visit the plot, run GPS coordinates, and cross-reference them with the official land survey maps. This ensures the plot physically exists, matches the shape on the title deed, and is not located in a gazetted wetland or forestry reserve.',
      'Step three is involving the local community. Visit the LC1 chairperson of the area and talk to the immediate neighbors. They know the history of the land, family dynamics, and whether there are undisclosed disputes. Always draft a formal agreement witnessed by a lawyer, and pay through a bank transfer to maintain a solid paper trail.'
    ]
  },
  {
    slug: 'mistakes',
    title: 'Top 5 Design Mistakes Ugandan Homebuilders Make',
    category: 'design',
    date: 'January 2025',
    readtime: '7 min read',
    content: [
      'A poorly designed house can be uncomfortable to live in and expensive to maintain. Many Ugandan homeowners rush into construction without optimizing their floor plans, resulting in structural and aesthetic mistakes that are difficult to correct later.',
      'Mistake 1: Incorrect house orientation. In Uganda\'s tropical climate, placing large windows facing directly east or west traps intense sunlight, turning rooms into hot ovens by afternoon. Windows should face north or south to capture natural light without direct heat glare.',
      'Mistake 2: Poor kitchen ventilation. Many builders place the kitchen in a closed corner with small windows. Without adequate airflow or an exhaust hood, cooking smoke and grease damage walls and spread throughout the living areas. Ensure wide windows and vents.',
      'Mistake 3: Wasteful corridors. Wide, winding hallways consume valuable square meters that could expand bedrooms. Keep corridors short and direct to maximize usable room space.',
      'Mistake 4: Small windows. To save on glass costs, builders install tiny windows. This makes rooms dark, damp, and requires turning on lights during the day, raising electricity bills. Natural light is free—use it.',
      'Mistake 5: Neglecting soil parameters. Building a generic house design without adjusting the foundation to match clay or sandy soil leads to wall cracking. Always customize your foundation layout to your site\'s soil conditions.'
    ]
  },
  {
    slug: 'contractor',
    title: 'Labour vs Contractor: Who Should You Hire?',
    category: 'labour',
    date: 'January 2025',
    readtime: '8 min read',
    content: [
      'One of the first decisions you face is choosing a construction management style: hiring daily laborers and buying materials yourself (Direct Labour), or contracting the entire project to a registered building company.',
      'Direct labour is highly popular because it is cheaper on paper. You bypass the contractor\'s overhead fees (usually 15–25% of the budget) and maintain direct control over purchasing. However, this method demands significant personal time. You must be at the site daily to verify material deliveries, count cement bags, and monitor fundis.',
      'If you have a full-time job or live in the diaspora, managing direct labour is highly risky. Without supervision, materials are frequently stolen, and workers produce substandard work that requires expensive rebuilding. In such cases, hiring a contractor is safer.',
      'A reputable contractor provides a binding bill of quantities, manages sub-workers, secures permits, and assumes legal responsibility for structural quality. For busy builders or diaspora Ugandans, paying a management margin to a verified contractor is a wise investment that saves money in the long run.'
    ]
  }
];

// ── Blog Modal Logic ────────────────────────────────────────
const blogModal       = document.getElementById('blog-modal');
const blogCloseBtn    = document.getElementById('blog-modal-close-btn');
const blogCloseBtnBot = document.getElementById('blog-modal-close-btn-bottom');

window.openBlogModal = function(slug) {
  if (!blogModal) return;
  const article = blogArticles.find(a => a.slug === slug);
  if (!article) return;

  document.getElementById('blog-modal-cat').textContent      = article.category.charAt(0).toUpperCase() + article.category.slice(1);
  document.getElementById('blog-modal-title').textContent    = article.title;
  document.getElementById('blog-modal-date').textContent     = article.date;
  document.getElementById('blog-modal-readtime').textContent = article.readtime;

  const contentContainer = document.getElementById('blog-modal-content');
  contentContainer.innerHTML = '';
  article.content.forEach(pText => {
    const p = document.createElement('p');
    p.textContent = pText;
    contentContainer.appendChild(p);
  });

  blogModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const newUrl = window.location.pathname + '?post=' + slug;
  window.history.pushState({ post: slug }, article.title, newUrl);
};

window.closeBlogModal = function() {
  if (!blogModal) return;
  blogModal.classList.remove('open');
  document.body.style.overflow = '';
  window.history.pushState({}, document.title, window.location.pathname);
};

if (blogCloseBtn)    blogCloseBtn.addEventListener('click', window.closeBlogModal);
if (blogCloseBtnBot) blogCloseBtnBot.addEventListener('click', window.closeBlogModal);
if (blogModal) {
  blogModal.addEventListener('click', e => {
    if (e.target === blogModal) window.closeBlogModal();
  });
}

// ── Close modals on ESC ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (typeof window.closePlanModal === 'function') window.closePlanModal();
    if (typeof window.closeBlogModal === 'function') window.closeBlogModal();
  }
});

// ── Page Initialization ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // 1. Plans page: apply URL params to filters
  if (document.getElementById('plans-grid')) {
    const params    = new URLSearchParams(window.location.search);
    const bedsParam = params.get('beds');
    const typeParam = params.get('type');

    if (bedsParam) {
      const selectBeds = document.getElementById('filter-beds');
      if (selectBeds) selectBeds.value = bedsParam;
    }
    if (typeParam) {
      const selectType = document.getElementById('filter-type');
      if (selectType) selectType.value = typeParam;
    }

    window.applyFilters(true);
  }

  // 2. Blog deep linking via URL param
  const params    = new URLSearchParams(window.location.search);
  const postSlug  = params.get('post');
  if (postSlug) {
    setTimeout(() => window.openBlogModal(postSlug), 200);
  } else if (window.location.hash) {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('post-') || hash.startsWith('read-')) {
      const slug = hash.replace('post-', '').replace('read-', '');
      setTimeout(() => window.openBlogModal(slug), 200);
    }
  }

  // 3. Blog card read-more buttons
  document.querySelectorAll('.blog-card').forEach(card => {
    const readMoreLink = card.querySelector('.read-more-link');
    if (readMoreLink) {
      readMoreLink.addEventListener('click', e => {
        e.preventDefault();
        const slug = card.id.replace('post-', '');
        window.openBlogModal(slug);
      });
    }
  });

  // 4. Featured post trigger
  const featuredTrigger = document.getElementById('read-featured');
  if (featuredTrigger) {
    featuredTrigger.addEventListener('click', e => {
      e.preventDefault();
      window.openBlogModal('under-50m');
    });
  }
});

// ── Smooth counter animation ─────────────────────────────────
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));
