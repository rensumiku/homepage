/* ═══════════════════════════════════════════════
   SumiX — main.js
   ═══════════════════════════════════════════════ */

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── Page progress bar ── */
  const progressBar = document.getElementById("page-progress");
  const updateProgress = () => {
    if (!progressBar) return;
    const total  = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = total > 0 ? Math.round((window.scrollY / total) * 100) : 0;
    progressBar.style.width = `${pct}%`;
    progressBar.setAttribute("aria-valuenow", pct);
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ── Header scroll state ── */
  const header = document.querySelector("[data-header]");
  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* ── Mobile menu ── */
  const menuButton = document.querySelector("[data-menu-button]");
  const nav        = document.querySelector("[data-nav]");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    nav.addEventListener("click", (e) => {
      if (e.target instanceof HTMLAnchorElement) {
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        menuButton.focus();
      }
    });
  }

  /* ── Active nav link on scroll ── */
  const sections  = document.querySelectorAll("section[id], div[id='top']");
  const navLinks  = document.querySelectorAll("[data-nav-link]");
  const markActiveNav = () => {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.getBoundingClientRect().top;
      if (top <= (window.innerHeight * 0.4)) current = sec.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === `#${current}`);
    });
  };
  window.addEventListener("scroll", markActiveNav, { passive: true });
  markActiveNav();

  /* ── Smooth scroll with header offset ── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id  = (link.getAttribute("href") || "").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 20;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reducedMotion.matches ? "instant" : "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ── Reveal on scroll (IntersectionObserver) ── */
  const revealItems = document.querySelectorAll(".reveal");

  const revealInView = () => {
    revealItems.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
        el.classList.add("is-visible");
      }
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px 0px 0px" }
    );
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  /* Fallback: reveal anything already visible on load */
  window.setTimeout(revealInView, 100);
  window.setTimeout(revealInView, 600);
  window.addEventListener("scroll", revealInView, { passive: true });

  /* ── Stats counter animation ── */
  const statNums = document.querySelectorAll(".stat-num[data-count]");
  const animateCount = (el, target, duration = 1600) => {
    if (reducedMotion.matches) { el.textContent = target; return; }
    const start    = performance.now();
    const from     = 0;
    const easeOut  = (t) => 1 - Math.pow(1 - t, 3);
    const tick     = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(from + (target - from) * easeOut(progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.getAttribute("data-count") || "0", 10);
            animateCount(el, target);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach((el) => counterObserver.observe(el));
  }

  /* ── Back to top button ── */
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    const updateBackToTop = () => {
      const show = window.scrollY > 600;
      if (show) {
        backToTop.hidden = false;
        requestAnimationFrame(() => backToTop.classList.add("is-visible"));
      } else {
        backToTop.classList.remove("is-visible");
      }
    };
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
    });
    updateBackToTop();
  }

  /* ── Floating CTA ── */
  const floatingCta   = document.getElementById("floating-cta");
  const ctaClose      = floatingCta?.querySelector(".floating-cta-close");
  let ctaDismissed    = false;

  const updateFloatingCta = () => {
    if (!floatingCta || ctaDismissed) return;
    const total   = document.documentElement.scrollHeight - window.innerHeight;
    const pct     = total > 0 ? window.scrollY / total : 0;
    const contact = document.getElementById("contact");
    const inContact = contact
      ? contact.getBoundingClientRect().top < window.innerHeight && contact.getBoundingClientRect().bottom > 0
      : false;

    if (pct > 0.28 && !inContact) {
      floatingCta.hidden = false;
      requestAnimationFrame(() => floatingCta.classList.add("is-visible"));
      floatingCta.setAttribute("aria-hidden", "false");
    } else {
      floatingCta.classList.remove("is-visible");
      floatingCta.setAttribute("aria-hidden", "true");
    }
  };

  if (floatingCta) {
    window.addEventListener("scroll", updateFloatingCta, { passive: true });
    ctaClose?.addEventListener("click", () => {
      ctaDismissed = true;
      floatingCta.classList.remove("is-visible");
      floatingCta.setAttribute("aria-hidden", "true");
    });
    floatingCta.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        floatingCta.classList.remove("is-visible");
      });
    });
    updateFloatingCta();
  }

  /* ── Toast system ── */
  const toastContainer = document.getElementById("toast-container");
  const showToast = ({ type = "success", title, message, duration = 5000 }) => {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${type === "success" ? "✓" : "✕"}</span>
      <div class="toast-body">
        <p class="toast-title">${title}</p>
        <p class="toast-msg">${message}</p>
      </div>
    `;
    toastContainer.appendChild(toast);
    const remove = () => {
      toast.classList.add("is-out");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    };
    const timer = window.setTimeout(remove, duration);
    toast.addEventListener("click", () => { clearTimeout(timer); remove(); });
  };

  /* ── Parallax on hero canvas (subtle) ── */
  if (!reducedMotion.matches) {
    const heroSection = document.querySelector(".hero");
    window.addEventListener("scroll", () => {
      if (!heroSection) return;
      const y = window.scrollY;
      heroSection.style.setProperty("--parallax-y", `${y * 0.15}px`);
    }, { passive: true });
  }

  /* ── Floating ticket parallax ── */
  const tickets = document.querySelectorAll(".floating-ticket");
  document.addEventListener("pointermove", (e) => {
    if (reducedMotion.matches) return;
    const x = (e.clientX / window.innerWidth  - 0.5) * 14;
    const y = (e.clientY / window.innerHeight - 0.5) * 14;
    tickets.forEach((ticket, i) => {
      const depth = i + 1;
      ticket.style.transform = `translate(${x / depth}px, ${y / depth}px)`;
    });
  });

  /* ── Card 3D tilt ── */
  const tiltCards = document.querySelectorAll(".tilt-card");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (reducedMotion.matches) return;
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(900px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) translateY(-6px)`;
      card.style.boxShadow = `${-dx * 8}px ${-dy * 8 + 12}px 40px rgba(7,27,58,0.14)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "";
    });
  });

  /* ── Magnetic buttons ── */
  const magneticBtns = document.querySelectorAll(".magnetic");
  magneticBtns.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      if (reducedMotion.matches) return;
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.28;
      const dy   = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  /* ── Topic filter ── */
  const filterButtons = document.querySelectorAll("[data-topic-filter]");
  const topicItems    = document.querySelectorAll("[data-topic]");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-topic-filter");
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      topicItems.forEach((item) => {
        const matches = filter === "all" || item.getAttribute("data-topic") === filter;
        item.classList.toggle("is-hidden", !matches);
      });
    });
  });

  /* ── Email copy ── */
  const emailButton = document.querySelector("[data-copy-email]");
  if (emailButton) {
    emailButton.addEventListener("click", async () => {
      const email = emailButton.getAttribute("data-copy-email") || "info@sumix.jp";
      try {
        await navigator.clipboard.writeText(email);
        const original = emailButton.textContent;
        emailButton.textContent = "コピーしました ✓";
        emailButton.classList.add("copied");
        window.setTimeout(() => {
          emailButton.textContent = original;
          emailButton.classList.remove("copied");
        }, 2000);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  /* ── Textarea character counter ── */
  const textarea    = document.querySelector('textarea[name="message"]');
  const charCount   = document.getElementById("char-count");
  const charCounter = document.querySelector(".char-counter");
  if (textarea && charCount) {
    const update = () => {
      const len = textarea.value.length;
      charCount.textContent = len;
      charCounter?.classList.toggle("is-long", len > 800);
    };
    textarea.addEventListener("input", update);
    update();
  }

  /* ── Real-time form validation ── */
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const inputs = form.querySelectorAll("input[required], select[required], textarea[required]");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        if (input.type === "checkbox") return;
        const valid = input.validity.valid && (input.tagName !== "TEXTAREA" || input.value.trim().length >= 10);
        input.classList.toggle("is-valid",   valid && input.value.trim().length > 0);
        input.classList.toggle("is-invalid", !valid && input.value.trim().length > 0);
      });
      input.addEventListener("input", () => {
        if (input.classList.contains("is-invalid")) {
          const valid = input.validity.valid;
          if (valid) {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
          }
        }
      });
    });

    /* Form submit */
    const submitBtn = form.querySelector("[data-submit-btn]");
    form.addEventListener("submit", (e) => {
      const email   = form.querySelector('input[name="email"]');
      const message = form.querySelector('textarea[name="message"]');

      if (!(email instanceof HTMLInputElement) || !(message instanceof HTMLTextAreaElement)) return;

      if (!email.validity.valid) {
        e.preventDefault();
        email.focus();
        return;
      }

      if (message.value.trim().length < 10) {
        e.preventDefault();
        message.setCustomValidity("お問い合わせ内容を10文字以上で入力してください。");
        message.reportValidity();
        window.setTimeout(() => message.setCustomValidity(""), 1500);
        return;
      }

      /* Show loading state */
      if (submitBtn) {
        submitBtn.classList.add("is-loading");
        submitBtn.setAttribute("disabled", "true");
      }
    });
  }

  /* ── Canvas particle background ── */
  const canvas = document.querySelector("[data-route-canvas]");
  if (canvas instanceof HTMLCanvasElement) {
    const ctx    = canvas.getContext("2d");
    const pts    = [];
    let W = 0, H = 0, rafId = 0;
    const colors = ["#1269f3", "#ff6b5f", "#64d8b5", "#ffe36e"];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts.length = 0;
      const count = Math.max(28, Math.floor(W / 34));
      for (let i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          size: Math.random() * 2 + 2,
          color: colors[i % colors.length],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        for (let j = i + 1; j < pts.length; j++) {
          const o  = pts[j];
          const dx = p.x - o.x;
          const dy = p.y - o.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            ctx.globalAlpha  = (160 - d) / 700;
            ctx.strokeStyle  = "#071b3a";
            ctx.lineWidth    = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(o.x, o.y);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 0.75;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(rafId);
      resize();
      if (!reducedMotion.matches) draw();
    };

    /* Pause when hero out of view for performance */
    if ("IntersectionObserver" in window) {
      const pauseObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          if (!reducedMotion.matches) {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(draw);
          }
        } else {
          cancelAnimationFrame(rafId);
        }
      }, { threshold: 0 });
      pauseObserver.observe(canvas);
    }

    window.addEventListener("resize", start, { passive: true });
    reducedMotion.addEventListener("change", start);
    start();
  }

  /* ── Success/error toast from URL params (after contact.php redirect) ── */
  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    window.setTimeout(() => {
      showToast({
        type: "success",
        title: "送信完了！",
        message: "お問い合わせありがとうございます。1〜2営業日以内にご返信いたします。",
        duration: 7000,
      });
    }, 500);
    history.replaceState(null, "", window.location.pathname + window.location.hash);
  }
  if (params.get("error") === "1") {
    window.setTimeout(() => {
      showToast({
        type: "error",
        title: "送信に失敗しました",
        message: "時間をおいて再度お試しいただくか、直接 info@sumix.jp までご連絡ください。",
        duration: 8000,
      });
    }, 500);
    history.replaceState(null, "", window.location.pathname + window.location.hash);
  }
})();

/* ── Bold redesign layer ── */
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Scroll-driven body theme: section at viewport middle wins */
  const themedSections = document.querySelectorAll("section[data-theme]");
  if (themedSections.length) {
    const applyTheme = () => {
      const mid = window.innerHeight / 2;
      let theme = "paper";
      themedSections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < mid && rect.bottom > mid) theme = sec.dataset.theme;
      });
      if (document.body.dataset.theme !== theme) {
        document.body.dataset.theme = theme;
      }
    };
    window.addEventListener("scroll", applyTheme, { passive: true });
    window.addEventListener("resize", applyTheme, { passive: true });
    applyTheme();
  }

  /* Custom cursor (fine pointers only) */
  const finePointer = window.matchMedia("(pointer: fine)");
  const dot  = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");

  if (dot && ring && finePointer.matches && !reducedMotion.matches) {
    document.body.classList.add("has-custom-cursor");

    let mx = -100, my = -100;   // mouse position
    let rx = -100, ry = -100;   // ring position (lerped)

    document.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top  = `${my}px`;
    }, { passive: true });

    const lerp = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top  = `${ry}px`;
      requestAnimationFrame(lerp);
    };
    requestAnimationFrame(lerp);

    const hoverTargets = "a, button, summary, input, select, textarea, label";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(hoverTargets)) ring.classList.add("is-hover");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest(hoverTargets)) ring.classList.remove("is-hover");
    });

    document.addEventListener("pointerleave", () => {
      document.body.classList.remove("has-custom-cursor");
    });
    document.addEventListener("pointerenter", () => {
      document.body.classList.add("has-custom-cursor");
    });
  }
})();
