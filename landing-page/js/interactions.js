// ===================================
// ADVANCED INTERACTIONS - LEARNINNSLICES
// ===================================

// Advanced interaction handlers and micro-interactions

class InteractionManager {
  constructor() {
    this.touchDevice = 'ontouchstart' in window;
    this.mousePosition = { x: 0, y: 0 };
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    this.setupGlobalInteractions();
    this.setupAccessibility();
    this.setupPerformanceMonitoring();
  }

  setupGlobalInteractions() {
    // Track mouse position globally
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      this.updateCursorEffects(e);
    });

    // Handle touch events for mobile
    if (this.touchDevice) {
      this.setupTouchInteractions();
    }

    // Setup keyboard navigation
    this.setupKeyboardNavigation();
  }

  setupTouchInteractions() {
    let touchStartY = 0;
    let touchStartTime = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchDuration = Date.now() - touchStartTime;
      const touchDistance = Math.abs(touchEndY - touchStartY);

      // Detect swipe gestures
      if (touchDuration < 300 && touchDistance > 50) {
        const direction = touchStartY > touchEndY ? 'up' : 'down';
        this.handleSwipeGesture(direction, e);
      }
    }, { passive: true });

    // Add touch feedback to interactive elements
    const touchElements = document.querySelectorAll('button, .cta-button, .nav-link');
    touchElements.forEach(element => {
      element.addEventListener('touchstart', (e) => {
        this.addTouchFeedback(element);
      }, { passive: true });
    });
  }

  addTouchFeedback(element) {
    if (this.isReducedMotion) return;

    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';

    setTimeout(() => {
      element.style.transform = '';
    }, 150);
  }

  handleSwipeGesture(direction, event) {
    // Handle navigation swipes
    const currentSection = this.getCurrentSection();
    
    if (direction === 'up') {
      this.navigateToNextSection(currentSection);
    } else if (direction === 'down') {
      this.navigateToPrevSection(currentSection);
    }
  }

  getCurrentSection() {
    const sections = document.querySelectorAll('section');
    const scrollTop = window.pageYOffset;
    
    for (let section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        return section;
      }
    }
    return sections[0];
  }

  navigateToNextSection(currentSection) {
    const nextSection = currentSection.nextElementSibling;
    if (nextSection && nextSection.tagName === 'SECTION') {
      this.scrollToSection(nextSection);
    }
  }

  navigateToPrevSection(currentSection) {
    const prevSection = currentSection.previousElementSibling;
    if (prevSection && prevSection.tagName === 'SECTION') {
      this.scrollToSection(prevSection);
    }
  }

  scrollToSection(section) {
    gsap.to(window, {
      scrollTo: {
        y: section.offsetTop - 70,
        autoKill: false
      },
      duration: 1,
      ease: "power2.inOut"
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // ESC key to close modals or mobile menu
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeMobileMenu();
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        this.navigateToNextSection(this.getCurrentSection());
      }

      if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        this.navigateToPrevSection(this.getCurrentSection());
      }

      // Enter/Space for button activation
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('cta-button')) {
        e.preventDefault();
        this.activateButton(e.target);
      }
    });
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.modal, .tooltip, .dropdown');
    modals.forEach(modal => {
      modal.classList.remove('active', 'visible');
    });
  }

  closeMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileToggle && navMenu) {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  }

  activateButton(button) {
    // Trigger click event with visual feedback
    if (!this.isReducedMotion) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          button.click();
        }
      });
    } else {
      button.click();
    }
  }

  updateCursorEffects(event) {
    if (this.isReducedMotion) return;

    // Update parallax elements based on mouse position
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.getAttribute('data-parallax')) || 0.1;
      const x = (this.mousePosition.x - window.innerWidth / 2) * speed;
      const y = (this.mousePosition.y - window.innerHeight / 2) * speed;
      
      gsap.to(element, {
        x: x,
        y: y,
        duration: 1,
        ease: "power2.out"
      });
    });

    // Update tilt effects
    const tiltElements = document.querySelectorAll('[data-tilt]');
    tiltElements.forEach(element => {
      this.updateTiltEffect(element, event);
    });
  }

  updateTiltEffect(element, event) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    const tiltX = (deltaY / rect.height) * -20;
    const tiltY = (deltaX / rect.width) * 20;
    
    const intensity = parseFloat(element.getAttribute('data-tilt')) || 1;
    
    gsap.to(element, {
      rotationX: tiltX * intensity,
      rotationY: tiltY * intensity,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out"
    });
  }

  setupAccessibility() {
    // Add focus indicators for keyboard navigation
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      element.addEventListener('focus', (e) => {
        if (!this.isReducedMotion) {
          gsap.to(element, {
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.5)',
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });

      element.addEventListener('blur', (e) => {
        if (!this.isReducedMotion) {
          gsap.to(element, {
            boxShadow: 'none',
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });
    });

    // Announce page changes for screen readers
    this.setupLiveRegion();
  }

  setupLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);

    this.liveRegion = liveRegion;
  }

  announceChange(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
      setTimeout(() => {
        this.liveRegion.textContent = '';
      }, 1000);
    }
  }

  setupPerformanceMonitoring() {
    // Monitor interaction performance
    this.interactionTimes = [];
    
    const observeInteraction = (element, eventType) => {
      element.addEventListener(eventType, (e) => {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.interactionTimes.push(duration);
          
          // Keep only last 50 measurements
          if (this.interactionTimes.length > 50) {
            this.interactionTimes.shift();
          }
          
          // Calculate average interaction time
          const avgTime = this.interactionTimes.reduce((a, b) => a + b, 0) / this.interactionTimes.length;
          
          // If interactions are slow, reduce quality
          if (avgTime > 16.67) { // 60fps threshold
            document.body.classList.add('performance-mode');
          }
        });
      });
    };

    // Monitor button clicks
    const buttons = document.querySelectorAll('button, .cta-button');
    buttons.forEach(button => {
      observeInteraction(button, 'click');
    });

    // Monitor scroll performance
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });
  }
}

// Advanced form interactions
class FormInteractions {
  constructor() {
    this.setupFormValidation();
    this.setupFormAnimations();
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        this.setupInputValidation(input);
      });
      
      form.addEventListener('submit', (e) => {
        this.handleFormSubmit(e, form);
      });
    });
  }

  setupInputValidation(input) {
    const validationRules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[1-9][\d]{0,15}$/,
      url: /^https?:\/\/.+\..+/
    };

    let validationTimeout;

    input.addEventListener('input', () => {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        this.validateInput(input, validationRules);
      }, 300);
    });

    input.addEventListener('blur', () => {
      this.validateInput(input, validationRules);
    });
  }

  validateInput(input, rules) {
    const value = input.value.trim();
    const type = input.type || input.getAttribute('data-type');
    let isValid = true;
    let message = '';

    // Check if required
    if (input.hasAttribute('required') && !value) {
      isValid = false;
      message = 'This field is required';
    }

    // Check pattern validation
    if (value && rules[type] && !rules[type].test(value)) {
      isValid = false;
      message = `Please enter a valid ${type}`;
    }

    // Check min/max length
    const minLength = input.getAttribute('minlength');
    const maxLength = input.getAttribute('maxlength');
    
    if (minLength && value.length < parseInt(minLength)) {
      isValid = false;
      message = `Must be at least ${minLength} characters`;
    }
    
    if (maxLength && value.length > parseInt(maxLength)) {
      isValid = false;
      message = `Must be no more than ${maxLength} characters`;
    }

    this.showValidationFeedback(input, isValid, message);
  }

  showValidationFeedback(input, isValid, message) {
    // Remove existing feedback
    const existingFeedback = input.parentNode.querySelector('.validation-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Update input styling
    input.classList.remove('valid', 'invalid');
    input.classList.add(isValid ? 'valid' : 'invalid');

    // Show message for invalid inputs
    if (!isValid && message) {
      const feedback = document.createElement('div');
      feedback.className = 'validation-feedback';
      feedback.textContent = message;
      feedback.style.color = '#ef4444';
      feedback.style.fontSize = '0.875rem';
      feedback.style.marginTop = '0.25rem';
      
      input.parentNode.appendChild(feedback);
      
      // Animate feedback appearance
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(feedback, 
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      }
    }
  }

  setupFormAnimations() {
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      // Floating label effect
      this.createFloatingLabel(input);
      
      // Focus animations
      input.addEventListener('focus', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.to(input, {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });
      
      input.addEventListener('blur', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.to(input, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });
    });
  }

  createFloatingLabel(input) {
    const placeholder = input.getAttribute('placeholder');
    if (!placeholder) return;

    // Create floating label
    const label = document.createElement('label');
    label.textContent = placeholder;
    label.className = 'floating-label';
    label.style.position = 'absolute';
    label.style.left = '12px';
    label.style.top = '50%';
    label.style.transform = 'translateY(-50%)';
    label.style.pointerEvents = 'none';
    label.style.transition = 'all 0.3s ease';
    label.style.color = '#9ca3af';
    label.style.fontSize = '1rem';

    // Wrap input in container
    const container = document.createElement('div');
    container.style.position = 'relative';
    input.parentNode.insertBefore(container, input);
    container.appendChild(input);
    container.appendChild(label);

    // Remove placeholder
    input.removeAttribute('placeholder');

    const updateLabel = () => {
      const hasValue = input.value.trim() !== '';
      const isFocused = document.activeElement === input;
      
      if (hasValue || isFocused) {
        label.style.top = '8px';
        label.style.fontSize = '0.75rem';
        label.style.color = '#6366f1';
      } else {
        label.style.top = '50%';
        label.style.fontSize = '1rem';
        label.style.color = '#9ca3af';
      }
    };

    input.addEventListener('focus', updateLabel);
    input.addEventListener('blur', updateLabel);
    input.addEventListener('input', updateLabel);
  }

  handleFormSubmit(event, form) {
    event.preventDefault();
    
    // Validate all inputs
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        isFormValid = false;
        this.showValidationFeedback(input, false, 'This field is required');
      }
    });

    if (isFormValid) {
      this.submitForm(form);
    } else {
      // Shake form to indicate error
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.to(form, {
          x: 10,
          duration: 0.1,
          yoyo: true,
          repeat: 5,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(form, { x: 0 });
          }
        });
      }
    }
  }

  submitForm(form) {
    const submitButton = form.querySelector('button[type="submit"], .cta-button');
    
    if (submitButton) {
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Submitting...';
      submitButton.disabled = true;
      
      // Simulate form submission
      setTimeout(() => {
        submitButton.textContent = 'Success!';
        submitButton.style.background = '#10b981';
        
        setTimeout(() => {
          submitButton.textContent = originalText;
          submitButton.disabled = false;
          submitButton.style.background = '';
          form.reset();
        }, 2000);
      }, 1500);
    }
  }
}

// Initialize interaction managers
const interactionManager = new InteractionManager();
const formInteractions = new FormInteractions();

// Add CSS for form styles
const formStyles = `
  .floating-label {
    background: white;
    padding: 0 4px;
  }
  
  input.valid {
    border-color: #10b981;
  }
  
  input.invalid {
    border-color: #ef4444;
  }
  
  .validation-feedback {
    animation: slideInUp 0.3s ease;
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .performance-mode * {
    transition: none !important;
    animation: none !important;
  }
  
  [data-tilt] {
    transform-style: preserve-3d;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = formStyles;
document.head.appendChild(styleSheet);

// Export for use in other modules
window.InteractionManager = InteractionManager;
window.FormInteractions = FormInteractions;
