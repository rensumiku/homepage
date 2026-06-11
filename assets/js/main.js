(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-nav]");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      }
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  const revealVisibleItems = () => {
    revealItems.forEach((item) => {
      if (item.classList.contains("is-visible")) return;
      const rect = item.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (inView) item.classList.add("is-visible");
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
      { threshold: 0.16 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  window.addEventListener("scroll", revealVisibleItems, { passive: true });
  window.addEventListener("hashchange", () => window.setTimeout(revealVisibleItems, 250));
  window.setTimeout(revealVisibleItems, 250);
  window.setTimeout(revealVisibleItems, 1200);

  const tickets = document.querySelectorAll(".floating-ticket");
  document.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 14;
    const y = (event.clientY / window.innerHeight - 0.5) * 14;
    tickets.forEach((ticket, index) => {
      const depth = index + 1;
      ticket.style.transform = `translate(${x / depth}px, ${y / depth}px)`;
    });
  });

  const filterButtons = document.querySelectorAll("[data-topic-filter]");
  const topicItems = document.querySelectorAll("[data-topic]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-topic-filter");
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      topicItems.forEach((item) => {
        const matches = filter === "all" || item.getAttribute("data-topic") === filter;
        item.classList.toggle("is-hidden", !matches);
      });
    });
  });

  const emailButton = document.querySelector("[data-copy-email]");
  if (emailButton) {
    emailButton.addEventListener("click", async () => {
      const email = emailButton.getAttribute("data-copy-email") || "info@sumix.jp";
      try {
        await navigator.clipboard.writeText(email);
        emailButton.textContent = "コピーしました";
        emailButton.classList.add("copied");
        window.setTimeout(() => {
          emailButton.textContent = email;
          emailButton.classList.remove("copied");
        }, 1700);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (event) => {
      const email = form.querySelector('input[name="email"]');
      const message = form.querySelector('textarea[name="message"]');
      if (!(email instanceof HTMLInputElement) || !(message instanceof HTMLTextAreaElement)) return;
      if (!email.validity.valid || message.value.trim().length < 10) {
        event.preventDefault();
        if (message.value.trim().length < 10) {
          message.setCustomValidity("お問い合わせ内容を10文字以上で入力してください。");
          message.reportValidity();
          window.setTimeout(() => message.setCustomValidity(""), 1200);
        }
      }
    });
  }

  const canvas = document.querySelector("[data-route-canvas]");
  if (canvas instanceof HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    const points = [];
    let width = 0;
    let height = 0;
    let animationId = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const colors = ["#1269f3", "#ff6b5f", "#64d8b5", "#ffe36e"];

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      points.length = 0;
      const count = Math.max(28, Math.floor(width / 34));
      for (let i = 0; i < count; i += 1) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          size: Math.random() * 2 + 2,
          color: colors[i % colors.length],
        });
      }
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      points.forEach((point, index) => {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < -20) point.x = width + 20;
        if (point.x > width + 20) point.x = -20;
        if (point.y < -20) point.y = height + 20;
        if (point.y > height + 20) point.y = -20;

        for (let next = index + 1; next < points.length; next += 1) {
          const other = points[next];
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            context.globalAlpha = (150 - distance) / 600;
            context.strokeStyle = "#071b3a";
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }

        context.globalAlpha = 0.75;
        context.fillStyle = point.color;
        context.beginPath();
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      animationId = window.requestAnimationFrame(draw);
    };

    const start = () => {
      window.cancelAnimationFrame(animationId);
      resize();
      if (!reducedMotion.matches) draw();
    };

    window.addEventListener("resize", start, { passive: true });
    reducedMotion.addEventListener("change", start);
    start();
  }
})();
