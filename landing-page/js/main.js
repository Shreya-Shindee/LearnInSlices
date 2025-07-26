// ===================================
// GLOBAL VARIABLES
// ===================================
let particles = [];
let mouseX = 0;
let mouseY = 0;
let isScrolling = false;

// ===================================
// UTILITY FUNCTIONS
// ===================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===================================
// CURSOR INTERACTIONS
// ===================================
function initCursorInteractions() {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update magnetic elements
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (mouseX - centerX) * 0.15;
      const deltaY = (mouseY - centerY) * 0.15;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance < 100) {
        if (typeof gsap !== 'undefined') {
          gsap.to(el, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      } else {
        if (typeof gsap !== 'undefined') {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      }
    });
  });
}

// ===================================
// PARTICLE SYSTEM
// ===================================
function initParticleSystem() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Create particles
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    });
  }
  
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
      ctx.fill();
    });
    
    requestAnimationFrame(animateParticles);
  }
  
  animateParticles();
}

// ===================================
// TESTIMONIALS CAROUSEL
// ===================================
function initTestimonialsCarousel() {
  const track = document.querySelector('.testimonials-track');
  const cards = document.querySelectorAll('.testimonial-card');
  
  if (!track || !cards.length) return;
  
  let currentIndex = 0;
  const cardWidth = cards[0].offsetWidth + 32; // including gap
  
  function updateCarousel() {
    const translateX = -currentIndex * cardWidth;
    gsap.to(track, {
      x: translateX,
      duration: 0.6,
      ease: "power2.inOut"
    });
    
    // Update active states
    cards.forEach((card, index) => {
      if (index === currentIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }
  
  function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }
  
  function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  }
  
  // Auto-advance carousel
  setInterval(nextSlide, 5000);
  
  // Add navigation
  const nextBtn = document.querySelector('.testimonials-next');
  const prevBtn = document.querySelector('.testimonials-prev');
  
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  updateCarousel();
}

// ===================================
// ROADMAP SECTION
// ===================================
function initRoadmapVisualization() {
  const roadmapTabs = document.querySelectorAll('.roadmap-tab');
  const roadmapSvg = document.querySelector('.roadmap-svg');
  
  if (!roadmapTabs.length || !roadmapSvg) {
    console.warn('Roadmap elements not found');
    return;
  }
  
  let currentRoadmap = 'frontend';
  
  // Enhanced roadmap data
  const roadmapData = {
    frontend: [
      { name: 'HTML', status: 'completed' },
      { name: 'CSS', status: 'completed' },
      { name: 'JavaScript', status: 'current' },
      { name: 'React', status: 'locked' },
      { name: 'Next.js', status: 'locked' }
    ],
    backend: [
      { name: 'Node.js', status: 'completed' },
      { name: 'Express', status: 'current' },
      { name: 'MongoDB', status: 'locked' },
      { name: 'APIs', status: 'locked' },
      { name: 'Deployment', status: 'locked' }
    ],
    design: [
      { name: 'Figma', status: 'completed' },
      { name: 'Design Systems', status: 'completed' },
      { name: 'Prototyping', status: 'current' },
      { name: 'User Testing', status: 'locked' },
      { name: 'UI/UX', status: 'locked' }
    ]
  };
  
  function getStatusColor(status) {
    switch (status) {
      case 'completed': return '#10b981'; // green
      case 'current': return '#8b5cf6';   // purple
      case 'locked': return '#6b7280';    // gray
      default: return '#6b7280';
    }
  }
  
  function renderRoadmap(roadmapType) {
    const data = roadmapData[roadmapType];
    if (!data) {
      console.warn('Roadmap data not found for:', roadmapType);
      return;
    }
    
    // Calculate responsive positioning
    const isMobile = window.innerWidth < 768;
    const nodeSpacing = isMobile ? 120 : 140;
    const startX = isMobile ? 60 : 100;
    
    // Clear previous content
    roadmapSvg.innerHTML = '';
    
    // Create background grid
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.3"/>
      </pattern>
    `;
    roadmapSvg.appendChild(defs);
    
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', 'url(#grid)');
    roadmapSvg.appendChild(background);
    
    // Create connections between nodes with responsive positioning
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = startX + (i * nodeSpacing);
      const x2 = startX + ((i + 1) * nodeSpacing);
      const y = 150;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1 + 30);
      line.setAttribute('y1', y);
      line.setAttribute('x2', x2 - 30);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#d1d5db');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-dasharray', '5,5');
      roadmapSvg.appendChild(line);
    }
    
    // Create skill nodes with responsive positioning
    data.forEach((skill, index) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'roadmap-node');
      group.setAttribute('data-skill', skill.name);
      
      const x = startX + (index * nodeSpacing);
      const y = 150;
      
      // Outer circle (glow effect)
      const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      outerCircle.setAttribute('cx', x);
      outerCircle.setAttribute('cy', y);
      outerCircle.setAttribute('r', '35');
      outerCircle.setAttribute('fill', getStatusColor(skill.status));
      outerCircle.setAttribute('opacity', '0.2');
      
      // Main circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '25');
      circle.setAttribute('fill', getStatusColor(skill.status));
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '3');
      circle.setAttribute('class', 'skill-circle');
      
      // Status icon
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('x', x);
      icon.setAttribute('y', y + 5);
      icon.setAttribute('text-anchor', 'middle');
      icon.setAttribute('fill', '#ffffff');
      icon.setAttribute('font-size', '16');
      icon.setAttribute('font-weight', 'bold');
      
      switch (skill.status) {
        case 'completed':
          icon.textContent = '✓';
          break;
        case 'current':
          icon.textContent = '●';
          break;
        case 'locked':
          icon.textContent = '🔒';
          break;
      }
      
      // Skill name
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y + 55);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#374151');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', '600');
      text.textContent = skill.name;
      
      // Progress indicator for current skill
      if (skill.status === 'current') {
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', x);
        progressCircle.setAttribute('cy', y);
        progressCircle.setAttribute('r', '28');
        progressCircle.setAttribute('fill', 'none');
        progressCircle.setAttribute('stroke', getStatusColor(skill.status));
        progressCircle.setAttribute('stroke-width', '2');
        progressCircle.setAttribute('stroke-dasharray', '50 100');
        progressCircle.setAttribute('stroke-linecap', 'round');
        progressCircle.setAttribute('class', 'progress-circle');
        group.appendChild(progressCircle);
      }
      
      group.appendChild(outerCircle);
      group.appendChild(circle);
      group.appendChild(icon);
      group.appendChild(text);
      roadmapSvg.appendChild(group);
      
      // Add hover effects
      group.addEventListener('mouseenter', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(group, { scale: 1.1, duration: 0.3, ease: "back.out(1.7)" });
        }
      });
      
      group.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(group, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
        }
      });
    });
    
    // Animate entrance
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.roadmap-node', 
        { opacity: 0, scale: 0, y: 50 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)"
        }
      );
      
      // Animate progress circle rotation
      gsap.to('.progress-circle', {
        rotation: 360,
        duration: 3,
        ease: "none",
        repeat: -1,
        transformOrigin: "center"
      });
    }
  }
  
  // Tab switching
  roadmapTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roadmapTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const roadmapType = tab.dataset.roadmap;
      currentRoadmap = roadmapType;
      renderRoadmap(roadmapType);
    });
  });
  
  // Initial render
  renderRoadmap(currentRoadmap);
}

// ===================================
// SCROLL TO TOP
// ===================================
function initScrollToTop() {
  const scrollBtn = document.querySelector('.scroll-to-top');
  if (!scrollBtn) return;
  
  const progressRing = scrollBtn.querySelector('.progress-ring');
  const progressPath = progressRing?.querySelector('path');
  
  if (progressPath) {
    const pathLength = progressPath.getTotalLength();
    progressPath.style.strokeDasharray = pathLength;
    progressPath.style.strokeDashoffset = pathLength;
  }
  
  function updateScrollProgress() {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (progressPath) {
      const pathLength = progressPath.getTotalLength();
      const offset = pathLength - (scrollPercent / 100 * pathLength);
      progressPath.style.strokeDashoffset = offset;
    }
    
    if (scrollPercent > 20) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }
  
  window.addEventListener('scroll', debounce(updateScrollProgress, 10));
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initScrollAnimations() {
  // Hero animations
  gsap.fromTo('.hero-title', 
    { opacity: 0, y: 50 },
    { 
      opacity: 1, 
      y: 0, 
      duration: 1,
      ease: "power2.out",
      delay: 0.2
    }
  );
  
  gsap.fromTo('.hero-subtitle', 
    { opacity: 0, y: 30 },
    { 
      opacity: 1, 
      y: 0, 
      duration: 1,
      ease: "power2.out",
      delay: 0.4
    }
  );
  
  gsap.fromTo('.hero-cta', 
    { opacity: 0, y: 30 },
    { 
      opacity: 1, 
      y: 0, 
      duration: 1,
      ease: "power2.out",
      delay: 0.6
    }
  );
  
  // Feature cards
  gsap.utils.toArray('.feature-card').forEach((card, index) => {
    gsap.fromTo(card,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
  
  // Stats animation
  gsap.utils.toArray('.stat-number').forEach(stat => {
    const endValue = parseInt(stat.textContent);
    gsap.fromTo(stat, 
      { textContent: 0 },
      {
        textContent: endValue,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: stat,
          start: "top 80%"
        }
      }
    );
  });
}

// ===================================
// FOOTER WAVES
// ===================================
function initFooterWaves() {
  const wavePaths = document.querySelectorAll('.footer-wave path');
  
  wavePaths.forEach((path, index) => {
    gsap.to(path, {
      attr: { d: path.getAttribute('d') },
      duration: 3 + index,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });
}

// ===================================
// FORM INTERACTIONS
// ===================================
function initFormInteractions() {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (!newsletterForm) return;
  
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button');
    const originalText = button.textContent;
    
    button.textContent = 'Subscribing...';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = 'Subscribed!';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        e.target.reset();
      }, 2000);
    }, 1500);
  });
}

// ===================================
// MAIN INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  // Hide loading screen
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 1000);
  }
  
  // Initialize GSAP
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
  } else {
    console.warn('GSAP not loaded, animations will be disabled');
  }
  
  // Initialize all components
  initCursorInteractions();
  initParticleSystem();
  initTestimonialsCarousel();
  initRoadmapVisualization();
  initScrollToTop();
  initScrollAnimations();
  initFooterWaves();
  initFormInteractions();
  
  console.log('LearnInSlices landing page initialized successfully!');
});

// ===================================
// RESIZE HANDLER
// ===================================
window.addEventListener('resize', debounce(() => {
  ScrollTrigger.refresh();
}, 250));
