"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showElement(element) {
  element.classList.add("is-show");
}

function splitHeadingText() {
  document.querySelectorAll(".js-heading-animation .heading__main").forEach((heading) => {
    if (heading.dataset.split === "true") return;

    const text = heading.textContent || "";
    heading.textContent = "";

    Array.from(text).forEach((character) => {
      const span = document.createElement("span");
      span.textContent = character === " " ? "\u00a0" : character;
      heading.appendChild(span);
    });

    heading.dataset.split = "true";
  });
}

function activateIntro() {
  document.querySelector(".js-header")?.classList.add("is-active");
  document.querySelector(".information-bar--mv")?.classList.add("is-active");
  document.querySelector(".mv__rect")?.classList.add("is-active");

  document.querySelectorAll(".js-heading-animation").forEach((heading) => {
    heading.classList.add("is-animation");
  });
}

function observeScrollItems() {
  const items = Array.from(document.querySelectorAll(".js-scroll-show"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach(showElement);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      showElement(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });

  items.forEach((item) => observer.observe(item));
}

function drawHeroCanvas() {
  const canvas = document.getElementById("js-canvas");
  const wrapper = document.getElementById("js-canvas__wrapper");
  if (!canvas || !wrapper) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const points = Array.from({ length: 46 }, (_, index) => ({
    angle: index * 0.61,
    radius: 38 + (index % 10) * 19,
    speed: 0.001 + (index % 6) * 0.00024,
    size: 1.2 + (index % 5) * 0.32,
    tone: index % 4
  }));

  const distantStars = Array.from({ length: 130 }, (_, index) => ({
    x: ((index * 73) % 997) / 997,
    y: ((index * 151) % 991) / 991,
    size: 0.45 + ((index * 29) % 100) / 130,
    phase: (index * 0.79) % Math.PI,
    alpha: 0.35 + ((index * 17) % 100) / 240
  }));

  function resize() {
    const rect = wrapper.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function render(timestamp) {
    context.clearRect(0, 0, width, height);

    const centerX = width * 0.34;
    const centerY = height * 0.44;
    const scale = Math.min(width, height) / 520;

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#050814");
    background.addColorStop(0.48, "#0b1532");
    background.addColorStop(1, "#02030a");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const nebula = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.72);
    nebula.addColorStop(0, "rgba(18, 96, 80, 0.28)");
    nebula.addColorStop(0.42, "rgba(31, 72, 132, 0.16)");
    nebula.addColorStop(1, "rgba(2, 3, 10, 0)");
    context.fillStyle = nebula;
    context.fillRect(0, 0, width, height);

    distantStars.forEach((star) => {
      const twinkle = Math.sin(timestamp * 0.0012 + star.phase) * 0.18;
      context.globalAlpha = Math.max(0.2, star.alpha + twinkle);
      context.fillStyle = star.size > 0.95 ? "#f7e7b0" : "#e9f7ff";
      context.beginPath();
      context.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;

    const renderedPoints = points.map((point) => {
      const angle = point.angle + timestamp * point.speed;
      return {
        x: centerX + Math.cos(angle) * point.radius * scale * 2.2,
        y: centerY + Math.sin(angle * 1.18) * point.radius * scale * 1.25
      };
    });

    renderedPoints.forEach((point, index) => {
      const palette = point.tone === 0 ? "#fff7d6" : point.tone === 1 ? "#bdefff" : point.tone === 2 ? "#d7fff2" : "#f8fbff";
      const pulse = 0.78 + Math.sin(timestamp * 0.003 + index) * 0.22;
      const radius = point.size * scale * 2.9 * pulse;

      context.shadowColor = palette;
      context.shadowBlur = 14 + radius * 2.8;
      context.beginPath();
      context.fillStyle = palette;
      context.globalAlpha = point.tone === 0 ? 0.96 : 0.84;
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = palette;
      context.lineWidth = index % 3 === 0 ? 0.9 : 0.55;
      context.globalAlpha = index % 3 === 0 ? 0.78 : 0.48;
      context.beginPath();
      context.moveTo(point.x - radius * 3.6, point.y);
      context.lineTo(point.x + radius * 3.6, point.y);
      context.moveTo(point.x, point.y - radius * 3.6);
      context.lineTo(point.x, point.y + radius * 3.6);
      context.stroke();
    });
    context.globalAlpha = 1;
    context.shadowBlur = 0;

    if (!prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(render);
    }
  }

  resize();
  render(0);

  window.addEventListener("resize", resize, { passive: true });

  if (prefersReducedMotion && animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  splitHeadingText();
  activateIntro();
  observeScrollItems();
  drawHeroCanvas();
});
