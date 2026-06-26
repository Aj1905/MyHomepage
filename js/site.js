"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function applyMinimumViewport() {
  const viewport = document.querySelector("meta[name='viewport']");
  if (!viewport) return;

  const defaultContent = "width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0";
  const fixedContent = "width=375,initial-scale=1.0,maximum-scale=1.0,user-scalable=0";

  function updateViewport() {
    const viewportWidth = Math.min(window.screen.width || window.innerWidth, window.innerWidth);
    viewport.setAttribute("content", viewportWidth < 375 ? fixedContent : defaultContent);
  }

  updateViewport();
  window.addEventListener("resize", updateViewport, { passive: true });
  window.addEventListener("orientationchange", updateViewport, { passive: true });
}

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

  const points = Array.from({ length: 42 }, (_, index) => ({
    angle: index * 0.61,
    radius: 36 + (index % 9) * 18,
    speed: 0.0015 + (index % 5) * 0.00035
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

    context.fillStyle = "#f6faf9";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(18, 96, 80, 0.14)";
    context.lineWidth = 1;
    for (let x = -40; x < width + 40; x += 48) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + height * 0.22, height);
      context.stroke();
    }

    const renderedPoints = points.map((point) => {
      const angle = point.angle + timestamp * point.speed;
      return {
        x: centerX + Math.cos(angle) * point.radius * scale * 2.2,
        y: centerY + Math.sin(angle * 1.18) * point.radius * scale * 1.25
      };
    });

    context.strokeStyle = "rgba(14, 25, 45, 0.16)";
    renderedPoints.forEach((point, index) => {
      const next = renderedPoints[(index + 7) % renderedPoints.length];
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    });

    renderedPoints.forEach((point, index) => {
      context.beginPath();
      context.fillStyle = index % 3 === 0 ? "#b5842f" : "#126050";
      context.globalAlpha = index % 3 === 0 ? 0.55 : 0.38;
      context.arc(point.x, point.y, 2.2 + (index % 4) * 0.45, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;

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
  applyMinimumViewport();
  splitHeadingText();
  activateIntro();
  observeScrollItems();
  drawHeroCanvas();
});
