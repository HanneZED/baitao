const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let savedTheme = "light";
try {
  const storedTheme = localStorage.getItem("kawaii-theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    savedTheme = storedTheme;
  }
} catch (error) {
  savedTheme = root.dataset.theme === "dark" ? "dark" : "light";
}
root.dataset.theme = savedTheme;
const restingCardSelector = ".work-card, .guide-card, .collection-card, .diary-note, .article-panel, .related-card";

function clearInlineMotion(element) {
  ["transform", "translate", "rotate", "scale"].forEach((property) => {
    element.style.removeProperty(property);
  });
}

function setThemeColor(theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#201725" : "#fff8fb");
}

setThemeColor(root.dataset.theme);

function bootIcons() {
  if (!window.lucide) return;
  window.lucide.createIcons({ attrs: { "stroke-width": 1.9 } });
  root.classList.add("icons-ready");
}

function setupPageLoader() {
  const loader = document.querySelector("[data-page-loader]");
  if (!loader) {
    document.body.classList.remove("is-loading");
    return;
  }

  const minVisibleMs = reducedMotion ? 180 : 760;
  const startedAt = performance.now();
  let hidden = false;

  const hideLoader = () => {
    if (hidden) return;
    hidden = true;

    const remaining = Math.max(0, minVisibleMs - (performance.now() - startedAt));
    window.setTimeout(() => {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-loaded");
      loader.setAttribute("aria-hidden", "true");
      window.setTimeout(() => loader.remove(), reducedMotion ? 120 : 620);
    }, remaining);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
    window.setTimeout(hideLoader, 3600);
  }
}

function setupThemeToggle() {
  const button = document.querySelector(".theme-toggle");
  if (!button) return;

  button.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    const update = () => {
      root.dataset.theme = nextTheme;
      localStorage.setItem("kawaii-theme", nextTheme);
      setThemeColor(nextTheme);
    };

    if (document.startViewTransition && !reducedMotion) {
      document.startViewTransition(update);
    } else {
      update();
    }
  });
}

function setupProgress() {
  const line = document.querySelector(".progress-line");
  if (!line) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max <= 0 ? 0 : window.scrollY / max;
    line.style.transform = `scaleX(${amount})`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function setupSmoothScroll() {
  if (reducedMotion || !window.Lenis) return;

  const lenis = new Lenis({
    duration: 1.08,
    smoothWheel: true,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  window.kawaiiLenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function setSmoothScrollPaused(paused) {
  const lenis = window.kawaiiLenis;
  if (!lenis) return;
  if (paused) lenis.stop?.();
  else lenis.start?.();
}

function setupChromeCompact() {
  const header = document.querySelector(".site-header");
  const musicPlayer = document.querySelector("[data-music-player]");
  if (!header && !musicPlayer) return;

  const lerp = (start, end, progress) => start + (end - start) * progress;
  let ticking = false;

  const syncHeader = (progress) => {
    if (!header) return;

    header.style.setProperty("--header-width", `${lerp(720, 590, progress).toFixed(2)}px`);
    header.style.setProperty("--header-top", `${lerp(14.4, 10.4, progress).toFixed(2)}px`);
    header.style.setProperty("--header-min-height", `${lerp(66, 54, progress).toFixed(2)}px`);
    header.style.setProperty("--header-pad-y", `${lerp(6.72, 5.12, progress).toFixed(2)}px`);
    header.style.setProperty("--header-pad-x", `${lerp(8.32, 6.08, progress).toFixed(2)}px`);
    header.style.setProperty("--brand-gap", `${lerp(10.56, 8.8, progress).toFixed(2)}px`);
    header.style.setProperty("--brand-min-height", `${lerp(48, 44, progress).toFixed(2)}px`);
    header.style.setProperty("--brand-pad-right", `${lerp(14.4, 10.4, progress).toFixed(2)}px`);
    header.style.setProperty("--badge-size", `${lerp(46, 40, progress).toFixed(2)}px`);
    header.style.setProperty("--badge-shadow-blur", `${lerp(20, 16, progress).toFixed(2)}px`);
    header.style.setProperty("--brand-title-size", `${lerp(16, 15.04, progress).toFixed(2)}px`);
    header.style.setProperty("--brand-small-max", `${lerp(176, 0, progress).toFixed(2)}px`);
    header.style.setProperty("--brand-small-opacity", `${lerp(1, 0, progress).toFixed(3)}`);
    header.style.setProperty("--brand-small-y", `${lerp(0, -3, progress).toFixed(2)}px`);
    header.style.setProperty("--brand-small-scale", `${lerp(1, 0.94, progress).toFixed(3)}`);
    header.style.setProperty("--nav-pad-y", `${lerp(8.8, 7.36, progress).toFixed(2)}px`);
    header.style.setProperty("--nav-pad-x", `${lerp(14.4, 11.52, progress).toFixed(2)}px`);
    header.style.setProperty("--toggle-size", `${lerp(48, 44, progress).toFixed(2)}px`);
  };

  const update = () => {
    const progress = Math.min(1, Math.max(0, window.scrollY / 120));
    const compact = window.scrollY > 72;
    syncHeader(progress);
    header?.classList.toggle("is-compact", progress > 0.92);
    musicPlayer?.classList.toggle("is-compact", compact);
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function setupStatusCategory() {
  const panels = [...document.querySelectorAll("[data-status-panel]")];
  if (!panels.length) return;

  const syncPanel = (panel) => {
    const toggle = panel.querySelector("[data-status-toggle]");
    const wrap = panel.querySelector("[data-status-grid-wrap]");
    if (!toggle || !wrap) return;

    const expanded = toggle.getAttribute("aria-expanded") !== "false";
    panel.classList.toggle("is-open", expanded);
    panel.classList.toggle("is-collapsed", !expanded);
    wrap.style.maxHeight = expanded ? `${wrap.scrollHeight}px` : "0px";
  };

  panels.forEach((panel) => {
    const toggle = panel.querySelector("[data-status-toggle]");
    if (!toggle) return;

    syncPanel(panel);
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") !== "false";
      toggle.setAttribute("aria-expanded", String(!expanded));
      syncPanel(panel);
    });
  });

  window.addEventListener("resize", () => {
    panels.forEach(syncPanel);
  });
}

function revealWithFallback() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  const splitItems = document.querySelectorAll("[data-split]");

  if (!revealItems.length && !splitItems.length) return;

  if (!reducedMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray("[data-reveal]").forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.66,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
          },
          onComplete: () => {
            if (item.matches(restingCardSelector)) clearInlineMotion(item);
          },
        },
      );
    });

    gsap.utils.toArray("[data-split]").forEach((title) => {
      gsap.to(title.querySelectorAll("span"), {
        opacity: 1,
        y: 0,
        duration: 0.74,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.12,
      });
    });

    return;
  }

  splitItems.forEach((item) => item.classList.add("is-visible"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupAnimeLoops() {
  if (reducedMotion || !window.anime) return;

  anime({
    targets: ".floating-charm",
    translateY: [0, -6],
    rotate: (el, index) => [-4 + index * 4, 3 - index * 2],
    duration: 5600,
    delay: anime.stagger(180),
    direction: "alternate",
    easing: "easeInOutSine",
    loop: true,
  });
}

function setupHeroArtworkSlider() {
  const slider = document.querySelector(".hero-artwork-slider");
  if (!slider) return;

  const slides = [...slider.querySelectorAll(".hero-artwork-slide")];
  if (slides.length <= 1) return;

  let active = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (active < 0) active = 0;

  const sync = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === active);
      slide.setAttribute("aria-hidden", index === active ? "false" : "true");
    });
  };

  const show = (next) => {
    if (next === active) return;
    active = next;
    sync();
  };

  sync();

  if (!reducedMotion) {
    window.setInterval(() => {
      show((active + 1) % slides.length);
    }, 5200);
  }
}

function setupShowcaseSliders() {
  const sliders = [...document.querySelectorAll(".showcase-carousel")];
  if (!sliders.length) return;

  sliders.forEach((slider, sliderIndex) => {
    const slides = [...slider.querySelectorAll(".showcase-slide")];
    const dotsWrap = slider.querySelector(".showcase-dots");
    if (slides.length <= 1) return;

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `查看第 ${index + 1} 张橱窗示例`);
      dot.className = index === 0 ? "is-active" : "";
      dot.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
      dot.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        show(index);
        restart();
      });
      dotsWrap?.append(dot);
      return dot;
    });

    let active = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (active < 0) active = 0;
    let timer = null;

    const sync = () => {
      const prevIndex = (active - 1 + slides.length) % slides.length;
      const nextIndex = (active + 1) % slides.length;

      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === active);
        slide.classList.toggle("is-prev", index === prevIndex);
        slide.classList.toggle("is-next", index === nextIndex);
        slide.setAttribute("aria-hidden", index === active ? "false" : "true");
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === active);
      });
    };

    const show = (next) => {
      if (next === active) return;
      active = next;
      sync();
    };

    const next = () => show((active + 1) % slides.length);
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    const start = () => {
      if (!reducedMotion && !timer) {
        timer = window.setInterval(next, 5200 + sliderIndex * 650);
      }
    };
    const restart = () => {
      stop();
      start();
    };

    sync();

    if (!reducedMotion) {
      start();
      slider.addEventListener("pointerenter", stop);
      slider.addEventListener("pointerleave", start);
    }
  });
}

function setupTiltCards() {
  const cards = document.querySelectorAll(".tilt-card, .hero-card, .guide-visual");
  const canHover = window.matchMedia("(hover: hover)").matches;
  if (!canHover || reducedMotion) return;

  cards.forEach((card) => {
    if (card.dataset.tiltBound === "true") return;
    card.dataset.tiltBound = "true";
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      clearInlineMotion(card);
      card.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 7}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      clearInlineMotion(card);
    });
  });
}

function setupMagnetButtons() {
  const magnets = document.querySelectorAll(".magnetic");
  const canHover = window.matchMedia("(hover: hover)").matches;
  if (!canHover || reducedMotion) return;

  magnets.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.035}px, ${y * 0.065}px)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });
}

function setupWorkCardLinks() {
  const cards = document.querySelectorAll("[data-card-link]");
  if (!cards.length) return;

  cards.forEach((card) => {
    const openCardLink = () => {
      window.open(card.dataset.cardLink, "_blank", "noopener,noreferrer");
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, label")) return;
      openCardLink();
    });

    card.addEventListener("keydown", (event) => {
      if (event.target.closest("a, button, input, label")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openCardLink();
    });
  });
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const countTo = (item) => {
    const target = Number(item.dataset.count || 0);
    const duration = reducedMotion ? 1 : 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      item.textContent = Math.round(target * eased).toString().padStart(2, "0");
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countTo(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.7 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupContactMiniSpeech() {
  const card = document.querySelector(".contact-card");
  const speech = document.querySelector("[data-contact-mini-speech]");
  const trigger = document.querySelector("[data-contact-mini-trigger]");
  if (!card || !speech || !trigger) return;

  let speechTimer = null;

  const showSpeech = () => {
    window.clearTimeout(speechTimer);
    speech.textContent = "哼哼~";
    speech.classList.remove("is-visible");
    speech.setAttribute("aria-hidden", "false");
    speech.getBoundingClientRect();
    speech.classList.add("is-visible");
    speechTimer = window.setTimeout(() => {
      speech.classList.remove("is-visible");
      window.setTimeout(() => {
        if (speech.classList.contains("is-visible")) return;
        speech.setAttribute("aria-hidden", "true");
        speech.textContent = "";
      }, 260);
    }, 2300);
  };

  trigger.addEventListener("click", showSpeech);

  if (!("IntersectionObserver" in window)) {
    showSpeech();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      showSpeech();
      observer.disconnect();
    },
    {
      rootMargin: "0px 0px -18% 0px",
      threshold: 0.28,
    },
  );

  observer.observe(card);
}

const defaultSiteContent = {
  version: 1,
  media: [
    {
      id: "media-starlight-route",
      type: "guide",
      category: "game",
      title: "星光地图收集路线",
      description: "适合记录开放世界每日路线、材料收集、传送点顺序和高收益绕路。",
      url: "./guides/starlight-route.html",
      cover: "./assets/work-guide.svg",
      tags: "game route collect openworld",
      body: "",
    },
    {
      id: "media-brush-workflow",
      type: "guide",
      category: "art",
      title: "插画笔刷与上色流程",
      description: "从草稿、线稿、铺色、阴影到导出的个人绘画流程模板。",
      url: "./guides/brush-workflow.html",
      cover: "./assets/work-illustration.svg",
      tags: "art brush workflow illustration",
      body: "",
    },
    {
      id: "media-cozy-desk",
      type: "guide",
      category: "life",
      title: "可爱桌面布置清单",
      description: "小灯、收纳、背景布、拍照角度和桌面维护节奏。",
      url: "./guides/cozy-desk.html",
      cover: "./assets/work-room.svg",
      tags: "life room photo setup",
      body: "",
    },
    {
      id: "media-bilibili-home",
      type: "video",
      category: "video",
      title: "bilibili 主页",
      description: "把适合展示的视频链接放在这里，之后可以在网页管理面板里继续添加。",
      url: "https://space.bilibili.com/7315220?spm_id_from=333.337.0.0",
      cover: "./img/card.png",
      tags: "video bilibili works",
      body: "",
    },
  ],
  collections: [
    {
      id: "collection-stickers",
      title: "超可爱表情包",
      description: "把喜欢的贴纸、表情包和小图收成一盒彩色糖纸。",
      cover: "./img/card.png",
      items: [
        { src: "./img/cc3/ff1.png", title: "软软的小表情", description: "可以继续在网页里上传更多图片。" },
        { src: "./img/cc3/ff2.png", title: "贴纸二号", description: "点开卡片后会在本站展开，不会打断 BGM。" },
        { src: "./img/cc3/ff3.png", title: "贴纸三号", description: "适合做表情包合集或作品小图集。" },
      ],
    },
    {
      id: "collection-drafts",
      title: "画稿与灵感",
      description: "一些像拍立得一样散开的稿件、截图和灵感碎片。",
      cover: "./img/cc3/cc3_1.jpg",
      items: [
        { src: "./img/cc3/cc3_1.jpg", title: "软乎乎的小画稿", description: "灵感先轻轻放在这里。" },
        { src: "./img/cc3/cc3_2.jpg", title: "夹在纸页里的灵感", description: "后续可以直接在网页里替换。" },
        { src: "./img/cc3/cc3_3.jpg", title: "像贴纸一样贴上去", description: "小图集会自动排版成子页面。" },
      ],
    },
  ],
  pictures: [
    { id: "cc3-1", src: "./img/cc3/cc3_1.jpg", title: "软乎乎的小画稿", description: "软乎乎的小画稿。", x: 38, y: 13, rotation: -18 },
    { id: "cc3-2", src: "./img/cc3/cc3_2.jpg", title: "夹在纸页里的灵感", description: "夹在纸页里的灵感。", x: 47, y: 9, rotation: 14 },
    { id: "card-cover", src: "./img/card.png", title: "今天也把可爱收好", description: "今天也把可爱收好。", x: 38, y: 29, rotation: 7, size: "large" },
    { id: "cc3-3", src: "./img/cc3/cc3_3.jpg", title: "像贴纸一样贴上去", description: "像贴纸一样贴上去。", x: 55, y: 34, rotation: -10 },
    { id: "cc3-4", src: "./img/cc3/cc3_4.jpg", title: "拖一拖，换个角度", description: "拖一拖，换个角度。", x: 30, y: 43, rotation: -14 },
    { id: "cc3-5", src: "./img/cc3/cc3_5.jpg", title: "小小的收藏角落", description: "小小的收藏角落。", x: 60, y: 51, rotation: 18 },
    { id: "cc3-6", src: "./img/cc3/cc3_6.jpg", title: "再偷偷添一张", description: "再偷偷添一张。", x: 67, y: 28, rotation: 12 },
  ],
};

function setupContentManager() {
  const mediaGrid = document.querySelector("[data-content-media-grid]");
  const collectionGrid = document.querySelector("[data-content-collection-grid]");
  const admin = document.querySelector("[data-content-admin]");
  if (!mediaGrid && !collectionGrid && !admin) return;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const uniqueId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const normalizeText = (value, fallback = "") => String(value || fallback).trim();
  const mediaLabel = (type, category) => {
    if (type === "video") return "视频链接";
    if (type === "guide") return "图文攻略";
    if (category === "art") return "绘画攻略";
    if (category === "game") return "游戏攻略";
    if (category === "life") return "生活记录";
    return "内容卡片";
  };

  let siteContent = clone(defaultSiteContent);
  let lastSavedContent = clone(defaultSiteContent);

  const normalizeMedia = (item) => ({
    id: normalizeText(item.id, uniqueId("media")),
    type: ["video", "guide", "article", "link"].includes(item.type) ? item.type : "article",
    category: normalizeText(item.category, item.type || "article"),
    title: normalizeText(item.title, "新内容"),
    description: normalizeText(item.description),
    url: normalizeText(item.url),
    cover: normalizeText(item.cover, "./img/card.png"),
    tags: normalizeText(item.tags),
    body: normalizeText(item.body),
  });

  const normalizeCollection = (item) => ({
    id: normalizeText(item.id, uniqueId("collection")),
    title: normalizeText(item.title, "新图片小盒"),
    description: normalizeText(item.description),
    cover: normalizeText(item.cover, "./img/card.png"),
    items: Array.isArray(item.items)
      ? item.items
          .map((image) => ({
            src: normalizeText(image.src),
            title: normalizeText(image.title, "图片"),
            description: normalizeText(image.description),
          }))
          .filter((image) => image.src)
      : [],
  });

  const normalizePicture = (item) => ({
    id: normalizeText(item.id, uniqueId("picture")),
    src: normalizeText(item.src),
    title: normalizeText(item.title, "新图片"),
    description: normalizeText(item.description),
    x: Number.isFinite(Number(item.x)) ? Number(item.x) : 50,
    y: Number.isFinite(Number(item.y)) ? Number(item.y) : 35,
    rotation: Number.isFinite(Number(item.rotation)) ? Number(item.rotation) : 0,
    size: item.size === "large" ? "large" : undefined,
  });

  const normalizeContent = (content) => ({
    version: 1,
    updatedAt: content.updatedAt || new Date().toISOString(),
    media: Array.isArray(content.media) ? content.media.map(normalizeMedia) : clone(defaultSiteContent.media),
    collections: Array.isArray(content.collections) ? content.collections.map(normalizeCollection) : clone(defaultSiteContent.collections),
    pictures: Array.isArray(content.pictures) ? content.pictures.map(normalizePicture).filter((item) => item.src) : clone(defaultSiteContent.pictures),
  });

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const pickFile = (multiple = false) =>
    new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = multiple;
      input.addEventListener("change", () => resolve([...input.files]));
      input.click();
    });

  const renderMediaCards = () => {
    if (!mediaGrid) return;
    mediaGrid.replaceChildren();
    siteContent.media.forEach((item) => {
      const isInternalDetail = item.body || (item.type === "article" && !item.url);
      const link = document.createElement("a");
      link.className = "guide-card media-card tilt-card is-visible";
      link.href = isInternalDetail ? `#${item.id}` : item.url || `#${item.id}`;
      link.dataset.tags = `${item.type} ${item.category} ${item.tags || ""}`.trim();
      link.dataset.contentCard = "";
      if (isInternalDetail) link.dataset.contentDetail = item.id;
      if (item.url && /^https?:/i.test(item.url) && !isInternalDetail) {
        link.target = "_blank";
        link.rel = "noreferrer";
      }
      link.innerHTML = `
        <img src="${escapeHtml(item.cover || "./img/card.png")}" alt="" loading="lazy" decoding="async" />
        <span>${escapeHtml(mediaLabel(item.type, item.category))}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <strong>${item.type === "video" ? "打开视频" : "查看详情"}</strong>
      `;
      mediaGrid.append(link);
    });
  };

  const renderCollectionCards = () => {
    if (!collectionGrid) return;
    collectionGrid.replaceChildren();
    siteContent.collections.forEach((item) => {
      const card = document.createElement("button");
      card.className = "collection-card tilt-card is-visible";
      card.type = "button";
      card.dataset.contentDetail = item.id;
      card.innerHTML = `
        <img src="${escapeHtml(item.cover || "./img/card.png")}" alt="" loading="lazy" decoding="async" />
        <span>Picture Box</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
      `;
      collectionGrid.append(card);
    });
  };

  const renderAdminList = () => {
    const list = admin?.querySelector("[data-admin-current-list]");
    if (!list) return;
    const rows = [
      ...siteContent.media.map((item) => ({ type: "media", id: item.id, label: `内容：${item.title}` })),
      ...siteContent.collections.map((item) => ({ type: "collection", id: item.id, label: `小盒：${item.title}` })),
    ];
    list.innerHTML = `
      <h3>当前内容</h3>
      ${rows
        .map(
          (row) => `
            <div class="content-admin-list-row">
              <span>${escapeHtml(row.label)}</span>
              <button type="button" data-admin-remove="${escapeHtml(row.type)}" data-admin-remove-id="${escapeHtml(row.id)}">移除</button>
            </div>
          `,
        )
        .join("")}
    `;
  };

  const syncContentMetrics = () => {
    document.querySelectorAll("[data-content-collection-count]").forEach((item) => {
      item.textContent = String(siteContent.collections.length);
    });
    document.querySelectorAll("[data-content-picture-count]").forEach((item) => {
      item.textContent = String(siteContent.pictures.length);
    });
    document.querySelectorAll("[data-picture-wall-count]").forEach((item) => {
      item.textContent = `${siteContent.pictures.length} 张`;
    });
  };

  const renderAll = () => {
    renderMediaCards();
    renderCollectionCards();
    renderAdminList();
    syncContentMetrics();
    bootIcons();
    setupTiltCards();
    document.dispatchEvent(new CustomEvent("kawaii:content-rendered"));
  };

  const loadContent = async () => {
    try {
      const response = await fetch("./data/site-content.json", { cache: "no-store" });
      if (!response.ok) throw new Error("content file missing");
      siteContent = normalizeContent(await response.json());
      lastSavedContent = clone(siteContent);
      renderAll();
    } catch {
      siteContent = normalizeContent(defaultSiteContent);
      lastSavedContent = clone(siteContent);
      renderAll();
    }
  };

  const getAdminKey = () => {
    const saved = sessionStorage.getItem("kawaii-admin-key") || "";
    const field = admin?.querySelector('[name="key"]');
    const current = field?.value?.trim() || saved;
    if (current) sessionStorage.setItem("kawaii-admin-key", current);
    return current;
  };

  const setAdminStatus = (message, tone = "") => {
    const status = admin?.querySelector("[data-admin-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const openAdmin = () => {
    if (!admin) return;
    admin.hidden = false;
    admin.setAttribute("aria-hidden", "false");
    const keyField = admin.querySelector('[name="key"]');
    if (keyField && !keyField.value) keyField.value = sessionStorage.getItem("kawaii-admin-key") || "";
    document.body.classList.add("is-content-admin-open");
    setSmoothScrollPaused(true);
    bootIcons();
    requestAnimationFrame(() => {
      admin.querySelector(".content-admin-shell")?.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const closeAdmin = () => {
    if (!admin) return;
    admin.hidden = true;
    admin.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-content-admin-open");
    if (!document.body.classList.contains("is-guide-view-open")) setSmoothScrollPaused(false);
  };

  const saveSiteContent = async () => {
    const key = getAdminKey();
    if (!key) {
      openAdmin();
      setAdminStatus("请先输入管理密钥，再保存到网站。", "error");
      return false;
    }

    setAdminStatus("正在保存到 GitHub，并等待 Vercel 自动部署...", "loading");
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, content: siteContent }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "保存失败");
      siteContent = normalizeContent(data);
      lastSavedContent = clone(siteContent);
      renderAll();
      setAdminStatus("保存成功。Vercel 通常会在几十秒内自动更新线上页面。", "success");
      return true;
    } catch (error) {
      setAdminStatus(`保存失败：${error.message || "请检查 Vercel 环境变量和 GitHub Token"}`, "error");
      return false;
    }
  };

  const createMediaDetail = (id) => {
    const item = siteContent.media.find((entry) => entry.id === id);
    if (!item) return null;
    const section = document.createElement("section");
    section.className = "dynamic-detail content-detail";
    const paragraphs = (item.body || item.description)
      .split(/\n{2,}/)
      .map((text) => `<p>${escapeHtml(text)}</p>`)
      .join("");
    section.innerHTML = `
      <div class="content-detail-hero">
        <img src="${escapeHtml(item.cover || "./img/card.png")}" alt="" />
        <div>
          <span>${escapeHtml(mediaLabel(item.type, item.category))}</span>
          <h1>${escapeHtml(item.title)}</h1>
          <p>${escapeHtml(item.description)}</p>
          ${item.url ? `<a class="button button-primary" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer"><span>打开原链接</span><i data-lucide="external-link" aria-hidden="true"></i></a>` : ""}
        </div>
      </div>
      <article class="content-detail-body">${paragraphs}</article>
    `;
    return { title: item.title, node: section };
  };

  const createCollectionDetail = (id) => {
    const item = siteContent.collections.find((entry) => entry.id === id);
    if (!item) return null;
    const section = document.createElement("section");
    section.className = "dynamic-detail collection-detail";
    section.innerHTML = `
      <div class="content-detail-hero">
        <img src="${escapeHtml(item.cover || "./img/card.png")}" alt="" />
        <div>
          <span>Picture Box</span>
          <h1>${escapeHtml(item.title)}</h1>
          <p>${escapeHtml(item.description)}</p>
        </div>
      </div>
      <div class="collection-detail-grid">
        ${item.items
          .map(
            (image) => `
              <figure>
                <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.title)}" loading="lazy" decoding="async" />
                <figcaption>
                  <strong>${escapeHtml(image.title)}</strong>
                  <span>${escapeHtml(image.description)}</span>
                </figcaption>
              </figure>
            `,
          )
          .join("")}
      </div>
    `;
    return { title: item.title, node: section };
  };

  const createDetail = (id) => createMediaDetail(id) || createCollectionDetail(id);

  const setupPictureWall = (wall) => {
    const stage = wall.querySelector("[data-picture-stage]");
    const input = wall.querySelector("[data-picture-input]");
    const uploadButton = wall.querySelector("[data-picture-upload]");
    const saveButton = wall.querySelector("[data-picture-save]");
    const resetButton = wall.querySelector("[data-picture-cancel]");
    const fullscreenButton = wall.querySelector("[data-picture-fullscreen]");
    const returnButton = wall.querySelector("[data-picture-return]");
    const editor = wall.querySelector("[data-picture-editor]");
    const editToggle = wall.querySelector("[data-picture-edit-toggle]");
    const compose = wall.querySelector("[data-picture-compose]");
    const description = wall.querySelector("[data-picture-description]");
    const shell = wall.closest(".guide-view-shell");
    const guideView = wall.closest("[data-guide-view]");
    if (!stage) return;

    let isPictureEditing = false;

    const setPictureEditing = (editing) => {
      isPictureEditing = editing;
      wall.classList.toggle("is-editing", editing);
      editor?.classList.toggle("is-open", editing);
      if (editToggle) {
        editToggle.setAttribute("aria-expanded", String(editing));
        editToggle.setAttribute("aria-label", editing ? "收起图片墙编辑菜单" : "展开图片墙编辑菜单");
      }
    };

    const focusPictures = (items) => {
      if (!items.length) return [];
      const xs = items.map((item) => Number(item.x) || 50);
      const ys = items.map((item) => Number(item.y) || 50);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const currentCenter = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
      };
      const targetCenter = {
        x: 50,
        y: 45,
      };
      const shift = {
        x: targetCenter.x - currentCenter.x,
        y: targetCenter.y - currentCenter.y,
      };
      const verticalSpan = Math.max(1, maxY - minY);
      const horizontalSpan = Math.max(1, maxX - minX);
      const minVisibleY = verticalSpan > 52 ? 12 : 18;
      const maxVisibleY = verticalSpan > 52 ? 88 : 76;
      const minVisibleX = horizontalSpan > 58 ? 8 : 18;
      const maxVisibleX = horizontalSpan > 58 ? 92 : 82;

      return items.map((item) => ({
        ...item,
        x: Math.min(Math.max((Number(item.x) || 50) + shift.x, minVisibleX), maxVisibleX),
        y: Math.min(Math.max((Number(item.y) || 50) + shift.y, minVisibleY), maxVisibleY),
      }));
    };

    const setPictureWindowExpanded = (expanded) => {
      wall.classList.toggle("is-expanded", expanded);
      shell?.classList.toggle("is-picture-expanded", expanded);
      guideView?.classList.toggle("is-picture-expanded", expanded);
      if (fullscreenButton) {
        fullscreenButton.setAttribute("aria-pressed", String(expanded));
        fullscreenButton.setAttribute("aria-label", expanded ? "缩小图片墙窗口" : "展开图片墙窗口");
        fullscreenButton.innerHTML = expanded
          ? '<i data-lucide="minimize-2" aria-hidden="true"></i><span>缩小</span>'
          : '<i data-lucide="maximize-2" aria-hidden="true"></i><span>展开</span>';
      }
      bootIcons();
    };

    const pictureEnterDelay = (index) => {
      const intervals = [360, 430, 520, 610];
      let delay = 0;
      for (let i = 0; i < index; i += 1) delay += intervals[i % intervals.length];
      return delay;
    };

    const renderPictures = ({ animate = false } = {}) => {
      stage.replaceChildren();
      const displayPictures = focusPictures(siteContent.pictures);
      displayPictures.forEach((displayItem, index) => {
        const item = siteContent.pictures.find((entry) => entry.id === displayItem.id) || displayItem;
        const card = document.createElement("article");
        card.className = `picture-card${item.size === "large" ? " is-large" : ""}${animate && !reducedMotion ? "" : " is-settled"}`;
        card.dataset.pictureId = item.id;
        card.style.setProperty("--x", `${displayItem.x}%`);
        card.style.setProperty("--y", `${displayItem.y}%`);
        card.style.setProperty("--rotate", `${item.rotation}deg`);
        card.style.setProperty("--enter-delay", `${pictureEnterDelay(index)}ms`);
        card.innerHTML = `
          <button type="button" class="picture-delete" data-picture-delete aria-label="删除图片">×</button>
          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" draggable="false" />
          <p>${escapeHtml(item.description || item.title)}</p>
        `;
        if (animate && !reducedMotion) {
          card.addEventListener("animationend", () => card.classList.add("is-settled"), { once: true });
        }
        stage.append(card);
      });
      syncContentMetrics();
      bootIcons();
    };

    const addPictureFiles = async (files) => {
      const startIndex = siteContent.pictures.length;
      for (const [index, file] of files.entries()) {
        const dataUrl = await fileToDataUrl(file);
        siteContent.pictures.push({
          id: uniqueId("picture"),
          src: dataUrl,
          title: file.name.replace(/\.[^.]+$/, "") || "新图片",
          description: description?.value?.trim() || file.name.replace(/\.[^.]+$/, "") || "新图片",
          x: 34 + ((startIndex + index) % 5) * 7,
          y: 18 + ((startIndex + index) % 4) * 11,
          rotation: Math.round(-14 + Math.random() * 28),
        });
      }
      if (description) description.value = "";
      renderPictures();
    };

    stage.addEventListener("pointerdown", (event) => {
      const card = event.target.closest(".picture-card");
      if (!card || event.target.closest("button")) return;
      const item = siteContent.pictures.find((entry) => entry.id === card.dataset.pictureId);
      if (!item) return;
      const stageRect = stage.getBoundingClientRect();
      const start = {
        x: event.clientX,
        y: event.clientY,
        itemX: Number.parseFloat(card.style.getPropertyValue("--x")) || item.x,
        itemY: Number.parseFloat(card.style.getPropertyValue("--y")) || item.y,
      };
      card.setPointerCapture?.(event.pointerId);
      card.classList.add("is-settled");
      card.classList.add("is-dragging");

      const move = (moveEvent) => {
        const nextX = start.itemX + ((moveEvent.clientX - start.x) / stageRect.width) * 100;
        const nextY = start.itemY + ((moveEvent.clientY - start.y) / stageRect.height) * 100;
        item.x = Math.min(Math.max(nextX, 8), 92);
        item.y = Math.min(Math.max(nextY, 6), 92);
        card.style.setProperty("--x", `${item.x}%`);
        card.style.setProperty("--y", `${item.y}%`);
      };

      const release = () => {
        card.classList.add("is-settled");
        card.classList.remove("is-dragging");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", release);
        window.removeEventListener("pointercancel", release);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", release, { once: true });
      window.addEventListener("pointercancel", release, { once: true });
    });

    stage.addEventListener("click", (event) => {
      const deleteButton = event.target.closest("[data-picture-delete]");
      if (!deleteButton) return;
      if (!isPictureEditing) return;
      const card = deleteButton.closest(".picture-card");
      siteContent.pictures = siteContent.pictures.filter((item) => item.id !== card?.dataset.pictureId);
      renderPictures();
    });

    editToggle?.addEventListener("click", () => {
      setPictureEditing(!isPictureEditing);
    });

    fullscreenButton?.addEventListener("click", () => {
      setPictureWindowExpanded(!wall.classList.contains("is-expanded"));
    });

    returnButton?.addEventListener("click", () => {
      if (wall.classList.contains("is-expanded")) setPictureWindowExpanded(false);
      document.querySelector("[data-guide-close]")?.click();
    });

    uploadButton?.addEventListener("click", () => input?.click());
    input?.addEventListener("change", () => {
      addPictureFiles([...input.files]);
      input.value = "";
    });

    saveButton?.addEventListener("click", async () => {
      openAdmin();
      if (!getAdminKey()) {
        setAdminStatus("图片墙已经在当前页面预览更新。输入管理密钥后，点“保存到网站”即可正式保存。", "loading");
        return;
      }
      await saveSiteContent();
    });

    resetButton?.addEventListener("click", () => {
      siteContent = normalizeContent(lastSavedContent);
      renderAll();
      renderPictures();
    });

    compose?.addEventListener("submit", (event) => {
      event.preventDefault();
      siteContent.pictures.push({
        id: uniqueId("picture"),
        src: "./img/card.png",
        title: "新图片卡",
        description: description?.value?.trim() || "新图片卡",
        x: 48,
        y: 48,
        rotation: Math.round(-10 + Math.random() * 20),
        size: "large",
      });
      if (description) description.value = "";
      renderPictures();
    });

    renderPictures({ animate: true });
  };

  const mountDynamicView = (container) => {
    const wall = container.querySelector("[data-picture-wall]");
    if (wall) setupPictureWall(wall);
  };

  admin?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-admin-remove]");
    if (removeButton) {
      const type = removeButton.dataset.adminRemove;
      const id = removeButton.dataset.adminRemoveId;
      if (type === "media") siteContent.media = siteContent.media.filter((item) => item.id !== id);
      if (type === "collection") siteContent.collections = siteContent.collections.filter((item) => item.id !== id);
      renderAll();
      setAdminStatus("已从页面预览移除。确认没问题后点“保存到网站”。", "success");
      return;
    }
    if (event.target.closest("[data-content-admin-close]")) closeAdmin();
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-content-admin-open]")) {
      event.preventDefault();
      openAdmin();
    }
  });

  admin?.querySelector(".content-admin-shell")?.addEventListener(
    "wheel",
    (event) => {
      event.stopPropagation();
    },
    { passive: true },
  );

  admin?.querySelector("[data-admin-upload-cover]")?.addEventListener("click", async () => {
    const [file] = await pickFile(false);
    if (!file) return;
    admin.querySelector('[data-admin-media-form] [name="cover"]').value = await fileToDataUrl(file);
  });

  admin?.querySelector("[data-admin-upload-collection-cover]")?.addEventListener("click", async () => {
    const [file] = await pickFile(false);
    if (!file) return;
    admin.querySelector('[data-admin-collection-form] [name="cover"]').value = await fileToDataUrl(file);
  });

  admin?.querySelector("[data-admin-fetch-cover]")?.addEventListener("click", async () => {
    const form = admin.querySelector("[data-admin-media-form]");
    const url = form?.elements.url.value.trim();
    if (!url) {
      setAdminStatus("先粘贴一个链接，再读取封面。", "error");
      return;
    }
    setAdminStatus("正在读取链接标题和封面...", "loading");
    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "读取失败");
      if (data.title && !form.elements.title.value) form.elements.title.value = data.title;
      if (data.description && !form.elements.description.value) form.elements.description.value = data.description;
      if (data.cover) form.elements.cover.value = data.cover;
      setAdminStatus("已读取链接信息。请确认后添加到首页。", "success");
    } catch (error) {
      setAdminStatus(`读取失败：${error.message || "这个链接没有提供可识别封面"}`, "error");
    }
  });

  admin?.querySelector("[data-admin-media-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const type = normalizeText(formData.get("type"), "article");
    const category = normalizeText(formData.get("category"), type);
    siteContent.media.unshift(
      normalizeMedia({
        id: uniqueId("media"),
        type,
        category,
        title: formData.get("title"),
        url: formData.get("url"),
        cover: formData.get("cover") || "./img/card.png",
        description: formData.get("description"),
        body: formData.get("body"),
        tags: `${type} ${category}`,
      }),
    );
    form.reset();
    renderAll();
    setAdminStatus("已添加到页面预览。确认没问题后点“保存到网站”。", "success");
  });

  admin?.querySelector("[data-admin-collection-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = [...form.elements.images.files];
    const images = [];
    for (const file of files) {
      images.push({
        src: await fileToDataUrl(file),
        title: file.name.replace(/\.[^.]+$/, "") || "图片",
        description: "",
      });
    }
    const cover = normalizeText(formData.get("cover")) || images[0]?.src || "./img/card.png";
    siteContent.collections.unshift(
      normalizeCollection({
        id: uniqueId("collection"),
        title: formData.get("title"),
        description: formData.get("description"),
        cover,
        items: images,
      }),
    );
    form.reset();
    renderAll();
    setAdminStatus("小盒已添加到页面预览。确认没问题后点“保存到网站”。", "success");
  });

  admin?.querySelector("[data-admin-save-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveSiteContent();
  });

  window.kawaiiContent = {
    createDetail,
    getContent: () => siteContent,
    mountDynamicView,
    openAdmin,
    saveSiteContent,
  };

  renderAll();
  loadContent();
}

function setupMusicPlayer() {
  const player = document.querySelector("[data-music-player]");
  const audio = document.querySelector("[data-music-audio]");
  const toggle = document.querySelector("[data-music-toggle]");
  const prevButton = document.querySelector("[data-music-prev]");
  const nextButton = document.querySelector("[data-music-next]");
  const title = document.querySelector("[data-music-title]");
  const volume = document.querySelector("[data-music-volume]");
  if (!player || !audio || !toggle || !volume) return;

  const defaultVolume = 0.1;
  const tracks = [
    {
      title: "幽冥水底",
      src: "./sound/BGM/幽冥水底.mp3",
    },
    {
      title: "サンタは中央線でやってくる",
      src: "./sound/BGM/サンタは中央線でやってくる.flac",
    },
    {
      title: "2：23 AM",
      src: "./sound/BGM/2：23 AM.ogg",
    },
  ];

  const savedTrack = Number(localStorage.getItem("kawaii-bgm-track"));
  let activeTrack = Number.isInteger(savedTrack) && tracks[savedTrack] ? savedTrack : 0;
  const savedVolumeValue = localStorage.getItem("kawaii-bgm-volume");
  const savedVolume = savedVolumeValue === null ? NaN : Number(savedVolumeValue);
  audio.volume = Number.isFinite(savedVolume) ? Math.min(Math.max(savedVolume, 0), 1) : defaultVolume;

  const syncPlayingState = () => {
    const isPlaying = !audio.paused;
    player.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.setAttribute("aria-label", isPlaying ? "暂停背景音乐" : "播放背景音乐");
  };

  const loadTrack = (index) => {
    activeTrack = (index + tracks.length) % tracks.length;
    const track = tracks[activeTrack];
    audio.src = track.src;
    localStorage.setItem("kawaii-bgm-track", activeTrack.toString());
    if (title) title.textContent = track.title;
  };

  const play = async () => {
    try {
      await audio.play();
      syncPlayingState();
    } catch {
      syncPlayingState();
      toggle.setAttribute("aria-label", "浏览器暂时无法播放背景音乐");
    }
  };

  const switchTrack = (direction) => {
    const wasPlaying = !audio.paused;
    loadTrack(activeTrack + direction);
    syncPlayingState();
    if (wasPlaying) play();
  };

  loadTrack(activeTrack);
  volume.value = audio.volume.toString();
  syncPlayingState();

  toggle.addEventListener("click", () => {
    if (audio.paused) play();
    else audio.pause();
  });

  prevButton?.addEventListener("click", () => switchTrack(-1));
  nextButton?.addEventListener("click", () => switchTrack(1));

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    localStorage.setItem("kawaii-bgm-volume", audio.volume.toString());
  });

  const getPlayerSize = () => {
    const rect = player.getBoundingClientRect();
    return {
      width: rect.width || 116,
      height: rect.height || 56,
    };
  };

  const getPlayerMargin = () => (window.innerWidth < 760 ? 12 : 16);

  const clampPlayerPosition = (nextPosition) => {
    const size = getPlayerSize();
    const margin = getPlayerMargin();
    return {
      x: Math.min(Math.max(nextPosition.x, margin), Math.max(margin, window.innerWidth - size.width - margin)),
      y: Math.min(Math.max(nextPosition.y, margin), Math.max(margin, window.innerHeight - size.height - margin)),
    };
  };

  const getClampedPlayerY = (y) => {
    const size = getPlayerSize();
    const margin = getPlayerMargin();
    return Math.min(Math.max(y, margin), Math.max(margin, window.innerHeight - size.height - margin));
  };

  const applyPlayerPosition = (position, side = null) => {
    const margin = getPlayerMargin();
    const y = getClampedPlayerY(position.y);
    player.dataset.snapSide = side || "";
    player.style.left = `${position.x}px`;
    player.style.top = `${y}px`;
    player.style.right = side === "right" ? `${margin}px` : "auto";
    player.style.bottom = "auto";
  };

  const applySnappedPlayerPosition = ({ side, y }) => {
    const margin = getPlayerMargin();
    const snappedY = getClampedPlayerY(y);
    player.dataset.snapSide = side;
    player.style.top = `${snappedY}px`;
    player.style.bottom = "auto";
    if (side === "right") {
      player.style.left = "auto";
      player.style.right = `${margin}px`;
    } else {
      player.style.left = `${margin}px`;
      player.style.right = "auto";
    }
    localStorage.setItem("kawaii-bgm-player-position", JSON.stringify({ side, y: snappedY }));
  };

  const snapPlayerToSide = (position) => {
    const size = getPlayerSize();
    const snapLeft = position.x + size.width / 2 < window.innerWidth / 2;
    applySnappedPlayerPosition({
      side: snapLeft ? "left" : "right",
      y: position.y,
    });
  };

  const restorePlayerPosition = () => {
    const rawPosition = localStorage.getItem("kawaii-bgm-player-position");
    if (!rawPosition) return;
    try {
      const savedPosition = JSON.parse(rawPosition);
      if (!Number.isFinite(savedPosition.y)) return;
      if (savedPosition.side === "left" || savedPosition.side === "right") {
        applySnappedPlayerPosition(savedPosition);
        return;
      }
      if (!Number.isFinite(savedPosition.x)) return;
      snapPlayerToSide(clampPlayerPosition(savedPosition));
    } catch {
      localStorage.removeItem("kawaii-bgm-player-position");
    }
  };

  let musicDragStart = null;
  let musicDragPosition = null;
  let musicDidDrag = false;
  let suppressMusicClick = false;

  player.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("button, input, a, label")) return;

    const rect = player.getBoundingClientRect();
    musicDragStart = { x: event.clientX, y: event.clientY };
    musicDragPosition = { x: rect.left, y: rect.top };
    musicDidDrag = false;
    player.setPointerCapture?.(event.pointerId);
    player.classList.add("is-dragging");

    const move = (moveEvent) => {
      if (!musicDragStart || !musicDragPosition) return;
      const dx = moveEvent.clientX - musicDragStart.x;
      const dy = moveEvent.clientY - musicDragStart.y;
      if (Math.hypot(dx, dy) > 6) musicDidDrag = true;
      if (!musicDidDrag) return;
      player.dataset.snapSide = "";
      applyPlayerPosition(clampPlayerPosition({
        x: musicDragPosition.x + dx,
        y: musicDragPosition.y + dy,
      }));
    };

    const release = () => {
      player.classList.remove("is-dragging");
      if (musicDidDrag) {
        suppressMusicClick = true;
        const rectAfterDrag = player.getBoundingClientRect();
        snapPlayerToSide({ x: rectAfterDrag.left, y: rectAfterDrag.top });
        window.setTimeout(() => {
          suppressMusicClick = false;
        }, 0);
      }
      musicDragStart = null;
      musicDragPosition = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release, { once: true });
    window.addEventListener("pointercancel", release, { once: true });
  });

  player.addEventListener(
    "click",
    (event) => {
      if (!suppressMusicClick) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );

  window.addEventListener("resize", () => {
    if (!player.style.top) return;
    if (player.dataset.snapSide === "left" || player.dataset.snapSide === "right") {
      applySnappedPlayerPosition({
        side: player.dataset.snapSide,
        y: player.getBoundingClientRect().top,
      });
      return;
    }
    const rect = player.getBoundingClientRect();
    snapPlayerToSide({ x: rect.left, y: rect.top });
  });

  requestAnimationFrame(restorePlayerPosition);

  audio.addEventListener("ended", () => switchTrack(1));
  audio.addEventListener("play", syncPlayingState);
  audio.addEventListener("pause", syncPlayingState);
}

function setupWebPet() {
  const pet = document.querySelector("[data-web-pet]");
  const petStage = document.querySelector("[data-pet-toggle]");
  const petSpeech = document.querySelector("[data-pet-speech]");
  const closeButton = document.querySelector("[data-pet-close]");
  const summonButton = document.querySelector("[data-pet-summon]");
  const musicPlayer = document.querySelector("[data-music-player]");
  if (!pet || !petStage || !closeButton || !summonButton) return;

  const frameRange = (count) => Array.from({ length: count }, (_, index) => index);
  const states = {
    idle: { row: 0, frames: frameRange(6), durations: [620, 180, 180, 5000, 260, 760], loop: true },
    runningRight: { row: 1, frames: frameRange(8), durations: [150, 150, 150, 150, 150, 150, 150, 280], loop: true },
    runningLeft: { row: 2, frames: frameRange(8), durations: [150, 150, 150, 150, 150, 150, 150, 280], loop: true },
    waving: { row: 3, frames: frameRange(4), durations: [190, 190, 210, 430], loop: false },
    jumping: { row: 4, frames: frameRange(5), durations: [190, 190, 190, 210, 440], loop: false },
    failed: { row: 5, frames: frameRange(8), durations: [180, 180, 180, 180, 180, 180, 180, 360], loop: false },
    waiting: { row: 6, frames: frameRange(6), durations: [190, 190, 190, 190, 190, 420], loop: false },
    running: { row: 7, frames: frameRange(6), durations: [160, 160, 160, 170, 170, 360], loop: false },
    review: { row: 8, frames: frameRange(6), durations: [190, 190, 190, 190, 190, 440], loop: false },
  };
  const animationTempo = 1.28;
  const motionTempo = 1.18;
  const inactivityLimitMs = 180000;
  const expressionNames = ["waving", "jumping", "waiting", "running", "review"];
  const autoExpressionNames = ["waiting", "waiting", "waiting", "waiting", "waiting", "waiting", "review", "waving", "running", "jumping"];
  const restStateNames = ["waiting", "waiting", "waiting", "waiting", "waiting", "waiting", "idle", "idle"];
  const interactionCooldownMs = 4200;
  const actionDelayMinMs = 5000;
  const actionDelayMaxMs = 10000;
  const moveActionChance = 0.76;
  const longMoveChance = 0.46;
  const sillyHopChance = 0.05;
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  let actionTimer = null;
  let expressionTimer = null;
  let controlTimer = null;
  let frameTimer = null;
  let inactivityTimer = null;
  let nameTimer = null;
  let speechTimer = null;
  let moveFrame = null;
  let activeState = "";
  let lastExpression = "";
  let interactionReadyAt = 0;
  let isDragging = false;
  let isNeglected = false;
  let isRecovering = false;
  let hasInitializedVisibility = false;
  let ignoreNextClick = false;
  let position = { x: 0, y: 0 };

  const setControlsOpen = (open) => {
    window.clearTimeout(controlTimer);
    pet.classList.toggle("is-control-open", open);
    closeButton.setAttribute("tabindex", open ? "0" : "-1");
    if (open) {
      controlTimer = window.setTimeout(() => setControlsOpen(false), 9000);
    }
  };

  const showPetName = () => {
    window.clearTimeout(nameTimer);
    pet.classList.add("is-name-visible");
    nameTimer = window.setTimeout(() => {
      pet.classList.remove("is-name-visible");
    }, 6000);
  };

  const sayPet = (text, tone = "meow", visibleMs = 2300) => {
    if (!petSpeech) return;
    window.clearTimeout(speechTimer);
    petSpeech.textContent = text;
    petSpeech.className = "web-pet-speech";
    petSpeech.setAttribute("aria-hidden", "false");
    petSpeech.getBoundingClientRect();
    petSpeech.classList.add("is-visible", `is-${tone}`);
    if (!Number.isFinite(visibleMs)) return;
    speechTimer = window.setTimeout(() => {
      petSpeech.classList.remove("is-visible");
      window.setTimeout(() => {
        if (petSpeech.classList.contains("is-visible")) return;
        petSpeech.setAttribute("aria-hidden", "true");
        petSpeech.textContent = "";
      }, 260);
    }, visibleMs);
  };

  const hidePetHints = () => {
    window.clearTimeout(nameTimer);
    window.clearTimeout(speechTimer);
    pet.classList.remove("is-name-visible");
    if (!petSpeech) return;
    petSpeech.className = "web-pet-speech";
    petSpeech.setAttribute("aria-hidden", "true");
    petSpeech.textContent = "";
  };

  const stopFrameLoop = () => {
    window.clearTimeout(frameTimer);
    frameTimer = null;
  };

  const setSpriteFrame = (state, frameIndex) => {
    const frame = state.frames[frameIndex] || 0;
    const frameX = frame === 0 ? 0 : (frame / 7) * 100;
    const rowY = state.row === 0 ? 0 : (state.row / 8) * 100;
    pet.style.setProperty("--pet-row", state.row.toString());
    pet.style.setProperty("--pet-frame", frame.toString());
    pet.style.setProperty("--pet-frame-x", `${frameX}%`);
    pet.style.setProperty("--pet-row-y", `${rowY}%`);
  };

  const getFrameDuration = (state, frameIndex, tempo = 1) => {
    const duration = state.durations[frameIndex] || state.durations[state.durations.length - 1] || 160;
    return duration * animationTempo * tempo;
  };

  const getStateDuration = (name, tempo = 1) => {
    const state = states[name] || states.idle;
    return state.durations.reduce((total, duration) => total + duration, 0) * animationTempo * tempo;
  };

  const playState = (name, options = {}) => {
    const state = states[name] || states.idle;
    const loop = typeof options.loop === "boolean" ? options.loop : state.loop;
    const restart = options.restart === true;
    const reverse = options.reverse === true;
    const tempo = options.tempo || 1;
    if (!restart && activeState === name && frameTimer && loop) return;

    stopFrameLoop();
    activeState = name;
    pet.dataset.petState = name;
    let frameIndex = reverse ? state.frames.length - 1 : 0;
    setSpriteFrame(state, frameIndex);

    const queueNextFrame = () => {
      const duration = getFrameDuration(state, frameIndex, tempo);
      frameTimer = window.setTimeout(() => {
        const isLastFrame = reverse ? frameIndex <= 0 : frameIndex >= state.frames.length - 1;
        if (isLastFrame && !loop) {
          frameTimer = null;
          options.onComplete?.();
          return;
        }

        frameIndex = isLastFrame ? (reverse ? state.frames.length - 1 : 0) : frameIndex + (reverse ? -1 : 1);
        setSpriteFrame(state, frameIndex);
        queueNextFrame();
      }, duration);
    };

    if (reducedMotion || state.frames.length <= 1) {
      if (!loop) {
        setSpriteFrame(state, reverse ? 0 : state.frames.length - 1);
        if (options.onComplete) {
          frameTimer = window.setTimeout(() => {
            frameTimer = null;
            options.onComplete?.();
          }, 0);
        }
      }
      return;
    }

    if (state.frames.length > 1) {
      queueNextFrame();
    }
  };

  const playRestState = (restart = false) => {
    if (isNeglected || isRecovering) return;
    const nextName = restStateNames[Math.floor(Math.random() * restStateNames.length)] || "waiting";
    playState(nextName, { loop: true, restart });
  };

  const getPetSize = () => {
    const rect = pet.getBoundingClientRect();
    return {
      width: rect.width || 132,
      height: rect.height || 150,
    };
  };

  const clampPosition = (nextPosition = position) => {
    const size = getPetSize();
    const margin = 10;
    return {
      x: clamp(nextPosition.x, margin, Math.max(margin, window.innerWidth - size.width - margin)),
      y: clamp(nextPosition.y, margin, Math.max(margin, window.innerHeight - size.height - margin)),
    };
  };

  const applyPosition = () => {
    pet.style.left = `${position.x}px`;
    pet.style.top = `${position.y}px`;
    pet.style.right = "auto";
    pet.style.bottom = "auto";
  };

  const setPetFace = (direction = 1) => {
    pet.style.setProperty("--pet-face-x", direction < 0 ? "-1" : "1");
  };

  const syncPositionFromLayout = () => {
    const rect = pet.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    position = clampPosition({ x: rect.left, y: rect.top });
    applyPosition();
  };

  const stopMove = () => {
    if (moveFrame) {
      window.cancelAnimationFrame(moveFrame);
      moveFrame = null;
    }
    pet.classList.remove("is-walking", "is-hopping");
    setPetFace(1);
  };

  const clearActionTimers = () => {
    window.clearTimeout(actionTimer);
    window.clearTimeout(expressionTimer);
  };

  const resetInactivityTimer = () => {
    window.clearTimeout(inactivityTimer);
    if (pet.classList.contains("is-hidden") || isNeglected || isRecovering) return;
    inactivityTimer = window.setTimeout(() => {
      enterNeglectedState();
    }, inactivityLimitMs);
  };

  const registerUserInteraction = () => {
    if (!pet.classList.contains("is-hidden")) resetInactivityTimer();
  };

  const scheduleNextAction = () => {
    window.clearTimeout(actionTimer);
    if (reducedMotion || isNeglected || isRecovering || pet.classList.contains("is-hidden")) return;

    actionTimer = window.setTimeout(() => {
      if (isDragging || isNeglected || isRecovering || pet.classList.contains("is-hidden")) {
        scheduleNextAction();
        return;
      }

      if (Math.random() < moveActionChance) {
        walkSomewhere();
      } else {
        playExpression("auto");
      }
    }, randomBetween(actionDelayMinMs, actionDelayMaxMs));
  };

  const setVisible = (visible) => {
    const wasHidden = pet.classList.contains("is-hidden");
    pet.classList.toggle("is-hidden", !visible);
    pet.setAttribute("aria-hidden", String(!visible));
    petStage.setAttribute("tabindex", visible ? "0" : "-1");
    summonButton.setAttribute("aria-pressed", String(visible));
    summonButton.setAttribute("aria-label", visible ? "摸摸 Cream Cat 小宠物" : "召回 Cream Cat 小宠物");
    musicPlayer?.classList.toggle("is-pet-visible", visible);
    if (visible) {
      if (!wasHidden && hasInitializedVisibility) return;
      isNeglected = false;
      isRecovering = false;
      playRestState();
      resetInactivityTimer();
      scheduleNextAction();
      hasInitializedVisibility = true;
      return;
    }

    stopMove();
    stopFrameLoop();
    clearActionTimers();
    window.clearTimeout(inactivityTimer);
    hidePetHints();
    setControlsOpen(false);
    isNeglected = false;
    isRecovering = false;
    activeState = "idle";
    pet.dataset.petState = "idle";
    setSpriteFrame(states.idle, 0);
  };

  function enterNeglectedState() {
    if (pet.classList.contains("is-hidden")) return;
    if (isDragging) {
      resetInactivityTimer();
      return;
    }

    isNeglected = true;
    isRecovering = false;
    clearActionTimers();
    stopMove();
    setControlsOpen(false);
    sayPet("呜呜~~", "sad", Infinity);
    playState("failed", {
      restart: true,
      tempo: 1.72,
      onComplete: () => setSpriteFrame(states.failed, states.failed.frames.length - 1),
    });
  }

  function recoverFromNeglect() {
    if (!isNeglected || isRecovering) return isRecovering;

    isRecovering = true;
    isNeglected = false;
    clearActionTimers();
    stopMove();
    hidePetHints();
    window.clearTimeout(inactivityTimer);
    playState("failed", {
      restart: true,
      reverse: true,
      tempo: 1.36,
      onComplete: () => {
        playState("review", {
          restart: true,
          onComplete: () => {
            isRecovering = false;
            playRestState(true);
            resetInactivityTimer();
            scheduleNextAction();
          },
        });
      },
    });
    return true;
  }

  const playExpression = (source = "auto") => {
    if (pet.classList.contains("is-hidden") || isDragging || moveFrame || isNeglected || isRecovering) return false;

    const now = Date.now();
    if (source === "user" && now < interactionReadyAt) {
      pet.classList.add("is-interaction-cooling");
      window.setTimeout(() => pet.classList.remove("is-interaction-cooling"), 260);
      return false;
    }

    if (source === "user") interactionReadyAt = now + interactionCooldownMs;
    clearActionTimers();

    const pool = source === "auto" ? autoExpressionNames : expressionNames;
    const candidates = pool.filter((name) => name !== lastExpression);
    const nextName = candidates[Math.floor(Math.random() * candidates.length)] || "waving";
    lastExpression = nextName;
    playState(nextName, { restart: true });
    if (source === "auto" && nextName === "jumping") {
      sayPet("咿呀~~~哈！", "hop");
    }

    expressionTimer = window.setTimeout(() => {
      playRestState(true);
      scheduleNextAction();
    }, getStateDuration(nextName) + 540);

    return true;
  };

  function walkSomewhere() {
    if (pet.classList.contains("is-hidden") || isDragging || moveFrame || isNeglected || isRecovering) return;

    syncPositionFromLayout();
    const isLongMove = Math.random() < longMoveChance;
    const minDistance = isLongMove ? 300 : 116;
    const target = pickMoveTarget(isLongMove, minDistance);
    const distance = Math.hypot(target.x - position.x, target.y - position.y);
    if (distance < minDistance) {
      scheduleNextAction();
      return;
    }

    clearActionTimers();
    if (isLongMove) {
      hopSomewhere(target, distance);
      return;
    }

    walkShortDistance(target, distance);
  };

  function pickMoveTarget(isLongMove, minDistance) {
    const maxX = isLongMove ? 660 : 390;
    const maxY = isLongMove ? 220 : 136;
    let target = position;
    let distance = 0;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      target = clampPosition({
        x: position.x + randomBetween(-maxX, maxX),
        y: position.y + randomBetween(-maxY, maxY),
      });
      distance = Math.hypot(target.x - position.x, target.y - position.y);
      if (distance >= minDistance) break;
    }

    if (distance >= minDistance) return target;

    const fallbackDistance = isLongMove ? 420 : 170;
    return [
      { x: fallbackDistance, y: randomBetween(-64, 64) },
      { x: -fallbackDistance, y: randomBetween(-64, 64) },
      { x: fallbackDistance * 0.72, y: fallbackDistance * 0.42 },
      { x: -fallbackDistance * 0.72, y: -fallbackDistance * 0.42 },
    ]
      .map((offset) => clampPosition({ x: position.x + offset.x, y: position.y + offset.y }))
      .sort((a, b) => Math.hypot(b.x - position.x, b.y - position.y) - Math.hypot(a.x - position.x, a.y - position.y))[0] || position;
  }

  function finishMove(target) {
    moveFrame = null;
    position = target;
    applyPosition();
    pet.classList.remove("is-walking", "is-hopping");
    setPetFace(1);
    playRestState(true);
    scheduleNextAction();
  }

  function walkShortDistance(target, distance) {
    const start = { ...position };
    const duration = clamp(distance * 15.8 * motionTempo, 2100, 4300);
    const startedAt = performance.now();
    playState(target.x >= start.x ? "runningRight" : "runningLeft", { restart: true });
    pet.classList.add("is-walking");

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
      position = {
        x: start.x + (target.x - start.x) * eased,
        y: start.y + (target.y - start.y) * eased,
      };
      applyPosition();

      if (progress < 1) {
        moveFrame = window.requestAnimationFrame(tick);
        return;
      }

      finishMove(target);
    };

    moveFrame = window.requestAnimationFrame(tick);
  }

  function hopSomewhere(target, distance) {
    const start = { ...position };
    const hopCount = Math.round(clamp(distance / 145, 2, 6));
    const duration = hopCount * randomBetween(720, 860) * motionTempo;
    const arcHeight = clamp(distance * 0.16, 34, 68);
    const startedAt = performance.now();
    const hopDirection = target.x < start.x ? -1 : 1;
    const isSillyHop = hopDirection < 0 && Math.random() < sillyHopChance;
    const faceDirection = isSillyHop ? 1 : hopDirection;
    setPetFace(faceDirection);
    sayPet(isSillyHop ? "喵呜~~！" : "咿呀~~~哈！", isSillyHop ? "silly" : "hop", Math.min(duration + 520, 3900));
    playState("jumping", { loop: true, restart: true });
    pet.classList.add("is-walking", "is-hopping");

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const hopProgress = Math.min((progress * hopCount) % 1, 1);
      const lift = 4 * hopProgress * (1 - hopProgress) * arcHeight;
      position = {
        x: start.x + (target.x - start.x) * eased,
        y: Math.max(8, start.y + (target.y - start.y) * eased - lift),
      };
      applyPosition();

      if (progress < 1) {
        moveFrame = window.requestAnimationFrame(tick);
        return;
      }

      finishMove(target);
    };

    moveFrame = window.requestAnimationFrame(tick);
  }

  petStage.addEventListener("click", () => {
    if (ignoreNextClick) {
      ignoreNextClick = false;
      return;
    }
    setVisible(true);
    setControlsOpen(true);
    showPetName();
    sayPet("喵~喵~", "meow");
    registerUserInteraction();
    if (recoverFromNeglect()) return;
    playExpression("user");
  });

  petStage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || pet.classList.contains("is-hidden")) return;

    registerUserInteraction();
    if (isNeglected) {
      ignoreNextClick = true;
      setControlsOpen(true);
      recoverFromNeglect();
      return;
    }

    stopMove();
    clearActionTimers();
    syncPositionFromLayout();
    isDragging = true;
    ignoreNextClick = false;
    pet.classList.add("is-dragging");
    playState("jumping", { loop: true, restart: true });
    petStage.setPointerCapture?.(event.pointerId);

    const startPointer = { x: event.clientX, y: event.clientY };
    const startPosition = { ...position };

    const move = (moveEvent) => {
      const dx = moveEvent.clientX - startPointer.x;
      const dy = moveEvent.clientY - startPointer.y;
      if (Math.hypot(dx, dy) > 6) ignoreNextClick = true;
      position = clampPosition({
        x: startPosition.x + dx,
        y: startPosition.y + dy,
      });
      applyPosition();
    };

    const release = () => {
      isDragging = false;
      pet.classList.remove("is-dragging");
      playRestState(true);
      resetInactivityTimer();
      scheduleNextAction();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release, { once: true });
    window.addEventListener("pointercancel", release, { once: true });
  });

  closeButton.addEventListener("click", () => {
    registerUserInteraction();
    setVisible(false);
  });

  summonButton.addEventListener("click", () => {
    const hidden = pet.classList.contains("is-hidden");
    setVisible(true);
    registerUserInteraction();
    if (recoverFromNeglect()) return;
    if (!hidden) {
      setControlsOpen(true);
      playExpression("user");
    }
  });

  window.addEventListener("resize", () => {
    position = clampPosition();
    applyPosition();
  });

  requestAnimationFrame(() => {
    const size = getPetSize();
    position = clampPosition({
      x: Math.min(window.innerWidth - size.width - 18, Math.max(18, window.innerWidth * 0.48)),
      y: window.innerHeight - size.height - 24,
    });
    applyPosition();
  });

  setVisible(true);
}

function setupGuideFilter() {
  const search = document.querySelector("#guide-search");
  const chips = document.querySelectorAll(".filter-chip");
  if (!search || !chips.length) return;

  let active = "all";

  const apply = () => {
    const query = search.value.trim().toLowerCase();
    const guides = document.querySelectorAll(".guide-card");
    guides.forEach((guide) => {
      const tags = guide.dataset.tags || "";
      const text = guide.textContent.toLowerCase();
      const categoryMatch = active === "all" || tags.includes(active);
      const queryMatch = !query || tags.includes(query) || text.includes(query);
      guide.classList.toggle("is-hidden", !(categoryMatch && queryMatch));
    });
  };

  chips.forEach((chip) => {
    if (chip.hasAttribute("data-content-admin-open")) return;
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      active = chip.dataset.filter || "all";
      apply();
    });
  });

  search.addEventListener("input", apply);
  document.addEventListener("kawaii:content-rendered", apply);
}

function setupGuideView() {
  const view = document.querySelector("[data-guide-view]");
  const content = document.querySelector("[data-guide-content]");
  const shell = view?.querySelector(".guide-view-shell");
  const status = document.querySelector("[data-guide-status]");
  const title = document.querySelector("#guide-view-title");
  const closeTriggers = document.querySelectorAll("[data-guide-close]");
  const guideLinks = document.querySelectorAll(".guide-card[href]");
  if (!view || !content || !status || !title) return;

  const homeTitle = document.title;
  let lastFocused = null;
  let guideDepth = 0;
  let requestId = 0;

  if (!history.state || typeof history.state.guideView === "undefined") {
    history.replaceState({ guideView: false, guideDepth: 0 }, "", window.location.href);
  }

  const isGuideUrl = (url) => {
    const target = new URL(url, window.location.href);
    return target.origin === window.location.origin && /\/guides\/[^/]+\.html$/.test(target.pathname);
  };

  const showView = () => {
    view.hidden = false;
    view.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-guide-view-open");
    setSmoothScrollPaused(true);
  };

  const hideView = () => {
    requestId += 1;
    view.hidden = true;
    view.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-guide-view-open");
    setSmoothScrollPaused(false);
    content.replaceChildren();
    status.textContent = "";
    title.textContent = "攻略详情";
    document.title = homeTitle;
    guideDepth = 0;
    lastFocused?.focus?.();
  };

  const normalizeGuideContent = (baseUrl) => {
    content.querySelectorAll("img[src]").forEach((image) => {
      image.src = new URL(image.getAttribute("src"), baseUrl).href;
    });

    content.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      link.href = new URL(href, baseUrl).href;
    });

    content.querySelectorAll("[data-reveal], [data-split]").forEach((item) => {
      item.classList.add("is-visible");
    });
  };

  const openInlineView = ({ node, viewTitle = "内容详情", path = "#detail", push = true, depth = guideDepth + 1, state = {} }) => {
    requestId += 1;
    lastFocused = document.activeElement;
    showView();
    content.replaceChildren(node);
    status.textContent = "";
    title.textContent = viewTitle;
    document.title = `${viewTitle} | 肥窝`;
    content.scrollTop = 0;
    content.focus({ preventScroll: true });
    window.kawaiiContent?.mountDynamicView?.(content);
    bootIcons();

    if (push) {
      guideDepth = depth;
      history.pushState(
        { guideView: true, inlineView: true, guideDepth, ...state },
        "",
        path,
      );
    } else {
      guideDepth = depth;
    }
  };

  const openTemplateView = (templateId, { push = true, depth = guideDepth + 1 } = {}) => {
    const template = document.querySelector(`#${CSS.escape(templateId)}`);
    if (!template) return false;
    const node = template.content.cloneNode(true);
    const host = document.createElement("div");
    host.append(node);
    const trigger = document.querySelector(`[data-view-template="${templateId}"]`);
    openInlineView({
      node: host,
      viewTitle: trigger?.dataset.viewTitle || "内容详情",
      path: trigger?.dataset.viewPath || `#${templateId}`,
      push,
      depth,
      state: { templateId },
    });
    return true;
  };

  const openContentDetail = (detailId, { push = true, depth = guideDepth + 1 } = {}) => {
    const detail = window.kawaiiContent?.createDetail?.(detailId);
    if (!detail) return false;
    openInlineView({
      node: detail.node,
      viewTitle: detail.title || "内容详情",
      path: `#${detailId}`,
      push,
      depth,
      state: { detailId },
    });
    return true;
  };

  const openGuide = async (url, { push = true, depth = guideDepth + 1 } = {}) => {
    const currentRequest = ++requestId;
    const guideUrl = new URL(url, window.location.href);
    lastFocused = document.activeElement;
    showView();
    content.replaceChildren();
    status.textContent = "正在展开攻略...";
    title.textContent = "攻略详情";

    try {
      const response = await fetch(guideUrl.href);
      if (!response.ok) throw new Error("guide unavailable");

      const html = await response.text();
      if (currentRequest !== requestId) return;

      const doc = new DOMParser().parseFromString(html, "text/html");
      const guideMain = doc.querySelector("main");
      const guideTitle = doc.querySelector(".guide-title")?.textContent?.trim() || "攻略详情";
      if (!guideMain) throw new Error("guide content missing");

      content.replaceChildren(guideMain.cloneNode(true));
      normalizeGuideContent(guideUrl.href);
      title.textContent = guideTitle;
      document.title = doc.title || `${guideTitle} | 肥窝`;
      status.textContent = "";
      content.scrollTop = 0;
      content.focus({ preventScroll: true });
      view.querySelector(".guide-view-shell")?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      bootIcons();

      if (push) {
        guideDepth = depth;
        history.pushState(
          { guideView: true, guideUrl: guideUrl.href, guideDepth },
          "",
          `${guideUrl.pathname}${guideUrl.search}${guideUrl.hash}`,
        );
      } else {
        guideDepth = depth;
      }
    } catch {
      status.textContent = "攻略暂时打不开，请稍后再试。";
    }
  };

  const closeGuide = () => {
    if (history.state?.guideView && guideDepth > 0) {
      history.go(-guideDepth);
      return;
    }
    hideView();
  };

  guideLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!isGuideUrl(link.href)) return;
      event.preventDefault();
      openGuide(link.href);
    });
  });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const templateTrigger = event.target.closest("[data-view-template]");
    if (templateTrigger) {
      event.preventDefault();
      openTemplateView(templateTrigger.dataset.viewTemplate);
      return;
    }

    const detailTrigger = event.target.closest("[data-content-detail]");
    if (detailTrigger) {
      event.preventDefault();
      openContentDetail(detailTrigger.dataset.contentDetail);
      return;
    }

    const guideLink = event.target.closest(".guide-card[href]");
    if (!guideLink || !isGuideUrl(guideLink.href)) return;
    event.preventDefault();
    openGuide(guideLink.href);
  });

  content.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (href?.startsWith("#")) {
      const target = content.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      return;
    }

    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin === window.location.origin && targetUrl.pathname.endsWith("/index.html")) {
      event.preventDefault();
      closeGuide();
      return;
    }

    if (isGuideUrl(targetUrl.href)) {
      event.preventDefault();
      openGuide(targetUrl.href);
    }
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", closeGuide);
  });

  shell?.addEventListener(
    "wheel",
    (event) => {
      event.stopPropagation();
    },
    { passive: true },
  );

  window.addEventListener("popstate", (event) => {
    if (event.state?.guideView && event.state.guideUrl) {
      openGuide(event.state.guideUrl, {
        push: false,
        depth: Number(event.state.guideDepth) || 1,
      });
      return;
    }
    if (event.state?.guideView && event.state.templateId) {
      openTemplateView(event.state.templateId, {
        push: false,
        depth: Number(event.state.guideDepth) || 1,
      });
      return;
    }
    if (event.state?.guideView && event.state.detailId) {
      openContentDetail(event.state.detailId, {
        push: false,
        depth: Number(event.state.guideDepth) || 1,
      });
      return;
    }
    hideView();
  });

  const openInitialHashView = () => {
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) return;

    const templateTrigger = document.querySelector(`[data-view-template][data-view-path="${CSS.escape(hash)}"]`);
    if (templateTrigger) {
      openTemplateView(templateTrigger.dataset.viewTemplate, { push: false, depth: 1 });
      return;
    }

    const detailId = decodeURIComponent(hash.slice(1));
    if (window.kawaiiContent?.createDetail?.(detailId)) {
      openContentDetail(detailId, { push: false, depth: 1 });
    }
  };

  requestAnimationFrame(openInitialHashView);
}

document.addEventListener("DOMContentLoaded", () => {
  setupPageLoader();
  bootIcons();
  setupThemeToggle();
  setupProgress();
  setupSmoothScroll();
  setupChromeCompact();
  setupStatusCategory();
  revealWithFallback();
  setupAnimeLoops();
  setupHeroArtworkSlider();
  setupShowcaseSliders();
  setupTiltCards();
  setupMagnetButtons();
  setupWorkCardLinks();
  setupCounters();
  setupContactMiniSpeech();
  setupContentManager();
  setupMusicPlayer();
  setupWebPet();
  setupGuideFilter();
  setupGuideView();
});
