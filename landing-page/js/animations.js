// ===================================
// ADVANCED ANIMATIONS - LEARNINNSLICES
// ===================================

// Animation utility functions and advanced effects

class AnimationUtils {
  constructor() {
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.setupPerformanceOptimizations();
  }

  setupPerformanceOptimizations() {
    // Use requestAnimationFrame for smooth animations
    gsap.ticker.fps(60);
    
    // Set up performance monitoring
    this.frameCount = 0;
    this.lastTime = performance.now();
    
    gsap.ticker.add(() => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        const fps = this.frameCount;
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        // Adjust quality based on performance
        if (fps < 30) {
          this.reducedQuality = true;
          document.body.classList.add('reduced-quality');
        } else if (fps > 50 && this.reducedQuality) {
          this.reducedQuality = false;
          document.body.classList.remove('reduced-quality');
        }
      }
    });
  }

  // Morphing text effect
  morphText(element, newText, options = {}) {
    const defaults = {
      duration: 1,
      ease: "power2.inOut",
      scrambleText: true
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) {
      element.textContent = newText;
      return;
    }

    const oldText = element.textContent;
    const maxLength = Math.max(oldText.length, newText.length);
    
    let progress = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    
    const tl = gsap.timeline();
    
    // Scramble phase
    if (opts.scrambleText) {
      tl.to({}, {
        duration: opts.duration * 0.6,
        ease: "none",
        onUpdate: function() {
          progress = this.progress();
          let result = "";
          
          for (let i = 0; i < maxLength; i++) {
            if (i < newText.length) {
              if (progress > i / maxLength) {
                result += newText[i];
              } else {
                result += chars[Math.floor(Math.random() * chars.length)];
              }
            }
          }
          
          element.textContent = result;
        }
      });
    }
    
    // Final text reveal
    tl.to({}, {
      duration: opts.duration * 0.4,
      ease: opts.ease,
      onComplete: () => {
        element.textContent = newText;
      }
    });
    
    return tl;
  }

  // Particle burst effect
  createParticleBurst(x, y, options = {}) {
    const defaults = {
      count: 20,
      colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'],
      size: 4,
      spread: 100,
      duration: 1
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    const particles = [];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < opts.count; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = opts.size + 'px';
      particle.style.height = opts.size + 'px';
      particle.style.background = opts.colors[Math.floor(Math.random() * opts.colors.length)];
      particle.style.borderRadius = '50%';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      
      container.appendChild(particle);
      particles.push(particle);

      // Animate particle
      const angle = (Math.PI * 2 * i) / opts.count;
      const velocity = opts.spread * (0.5 + Math.random() * 0.5);
      const endX = x + Math.cos(angle) * velocity;
      const endY = y + Math.sin(angle) * velocity;

      gsap.to(particle, {
        x: endX - x,
        y: endY - y,
        opacity: 0,
        scale: Math.random() * 0.5 + 0.5,
        duration: opts.duration,
        ease: "power2.out",
        onComplete: () => {
          particle.remove();
        }
      });
    }

    // Clean up container
    setTimeout(() => {
      container.remove();
    }, opts.duration * 1000 + 100);
  }

  // Magnetic field effect
  createMagneticField(element, options = {}) {
    const defaults = {
      strength: 0.3,
      radius: 100
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance < opts.radius) {
        const force = (opts.radius - distance) / opts.radius;
        const moveX = deltaX * force * opts.strength;
        const moveY = deltaY * force * opts.strength;
        
        gsap.to(element, {
          x: moveX,
          y: moveY,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    });
  }

  // Liquid button effect
  liquidButton(button, options = {}) {
    const defaults = {
      color: '#6366f1',
      viscosity: 0.7
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    const liquid = document.createElement('div');
    liquid.style.position = 'absolute';
    liquid.style.top = '50%';
    liquid.style.left = '50%';
    liquid.style.width = '0';
    liquid.style.height = '0';
    liquid.style.background = opts.color;
    liquid.style.borderRadius = '50%';
    liquid.style.transform = 'translate(-50%, -50%)';
    liquid.style.transition = `all ${opts.viscosity}s cubic-bezier(0.23, 1, 0.32, 1)`;
    liquid.style.zIndex = '-1';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(liquid);

    button.addEventListener('mouseenter', () => {
      liquid.style.width = '300%';
      liquid.style.height = '300%';
    });

    button.addEventListener('mouseleave', () => {
      liquid.style.width = '0';
      liquid.style.height = '0';
    });
  }

  // Stagger reveal animation
  staggerReveal(elements, options = {}) {
    const defaults = {
      duration: 0.6,
      stagger: 0.1,
      from: { opacity: 0, y: 30 },
      to: { opacity: 1, y: 0 },
      ease: "power2.out"
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) {
      gsap.set(elements, opts.to);
      return;
    }

    gsap.fromTo(elements, opts.from, {
      ...opts.to,
      duration: opts.duration,
      stagger: opts.stagger,
      ease: opts.ease
    });
  }

  // Perspective card flip
  flipCard(card, options = {}) {
    const defaults = {
      duration: 0.8,
      ease: "power2.inOut"
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');

    if (!front || !back) return;

    const tl = gsap.timeline();
    
    tl.to(card, {
      rotationY: 90,
      duration: opts.duration / 2,
      ease: opts.ease
    })
    .set(front, { display: 'none' })
    .set(back, { display: 'block' })
    .to(card, {
      rotationY: 0,
      duration: opts.duration / 2,
      ease: opts.ease
    });

    return tl;
  }

  // Elastic scale animation
  elasticScale(element, options = {}) {
    const defaults = {
      scale: 1.1,
      duration: 0.4,
      ease: "elastic.out(1, 0.3)"
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    return gsap.to(element, {
      scale: opts.scale,
      duration: opts.duration,
      ease: opts.ease,
      yoyo: true,
      repeat: 1
    });
  }

  // Typewriter effect with cursor
  typewriter(element, text, options = {}) {
    const defaults = {
      speed: 50,
      cursor: true,
      cursorChar: '|',
      loop: false
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) {
      element.textContent = text;
      return;
    }

    element.textContent = '';
    let i = 0;
    
    // Add cursor
    if (opts.cursor) {
      const cursor = document.createElement('span');
      cursor.textContent = opts.cursorChar;
      cursor.style.animation = 'blink 1s infinite';
      element.appendChild(cursor);
    }

    const type = () => {
      if (i < text.length) {
        if (opts.cursor) {
          element.firstChild.textContent = text.substring(0, i + 1);
        } else {
          element.textContent = text.substring(0, i + 1);
        }
        i++;
        setTimeout(type, opts.speed);
      } else if (opts.loop) {
        setTimeout(() => {
          i = 0;
          type();
        }, 2000);
      }
    };

    type();
  }

  // Smooth path drawing
  drawPath(path, options = {}) {
    const defaults = {
      duration: 2,
      ease: "power2.inOut"
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    return gsap.to(path, {
      strokeDashoffset: 0,
      duration: opts.duration,
      ease: opts.ease
    });
  }

  // Ripple effect
  createRipple(element, x, y, options = {}) {
    const defaults = {
      size: 100,
      duration: 0.6,
      color: 'rgba(255, 255, 255, 0.3)'
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.left = x - opts.size / 2 + 'px';
    ripple.style.top = y - opts.size / 2 + 'px';
    ripple.style.width = opts.size + 'px';
    ripple.style.height = opts.size + 'px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = opts.color;
    ripple.style.transform = 'scale(0)';
    ripple.style.pointerEvents = 'none';
    
    element.appendChild(ripple);

    gsap.to(ripple, {
      scale: 2,
      opacity: 0,
      duration: opts.duration,
      ease: "power2.out",
      onComplete: () => {
        ripple.remove();
      }
    });
  }

  // Floating animation
  float(element, options = {}) {
    const defaults = {
      distance: 10,
      duration: 3,
      ease: "sine.inOut"
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    return gsap.to(element, {
      y: opts.distance,
      duration: opts.duration,
      ease: opts.ease,
      repeat: -1,
      yoyo: true
    });
  }

  // Glitch effect
  glitch(element, options = {}) {
    const defaults = {
      duration: 0.5,
      intensity: 5
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    const tl = gsap.timeline();
    
    for (let i = 0; i < 5; i++) {
      tl.to(element, {
        x: gsap.utils.random(-opts.intensity, opts.intensity),
        y: gsap.utils.random(-opts.intensity, opts.intensity),
        duration: 0.02,
        ease: "none"
      });
    }
    
    tl.to(element, {
      x: 0,
      y: 0,
      duration: 0.1,
      ease: "power2.out"
    });

    return tl;
  }

  // Shimmer effect
  shimmer(element, options = {}) {
    const defaults = {
      duration: 1.5,
      color: 'rgba(255, 255, 255, 0.3)'
    };
    const opts = { ...defaults, ...options };

    if (this.isReduced) return;

    const shimmer = document.createElement('div');
    shimmer.style.position = 'absolute';
    shimmer.style.top = '0';
    shimmer.style.left = '-100%';
    shimmer.style.width = '100%';
    shimmer.style.height = '100%';
    shimmer.style.background = `linear-gradient(90deg, transparent, ${opts.color}, transparent)`;
    shimmer.style.pointerEvents = 'none';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(shimmer);

    gsap.to(shimmer, {
      left: '100%',
      duration: opts.duration,
      ease: "power2.inOut",
      onComplete: () => {
        shimmer.remove();
      }
    });
  }
}

// Initialize animation utilities
const animUtils = new AnimationUtils();

// CSS for additional effects
const additionalStyles = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  
  .reduced-quality * {
    transition: none !important;
    animation: none !important;
  }
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-front,
  .card-back {
    backface-visibility: hidden;
  }
  
  .card-back {
    transform: rotateY(180deg);
  }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Export animation utilities
window.AnimationUtils = AnimationUtils;
window.animUtils = animUtils;
