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
  if (slider.dataset.heroSliderTimer) {
    window.clearInterval(Number(slider.dataset.heroSliderTimer));
    delete slider.dataset.heroSliderTimer;
  }

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
    slider.dataset.heroSliderTimer = String(window.setInterval(() => {
      show((active + 1) % slides.length);
    }, 5200));
  }
}

function setupShowcaseSliders() {
  const sliders = [...document.querySelectorAll(".showcase-carousel")];
  if (!sliders.length) return;

  sliders.forEach((slider, sliderIndex) => {
    if (slider.dataset.showcaseSliderTimer) {
      window.clearInterval(Number(slider.dataset.showcaseSliderTimer));
      delete slider.dataset.showcaseSliderTimer;
    }
    const slides = [...slider.querySelectorAll(".showcase-slide")];
    const dotsWrap = slider.querySelector(".showcase-dots");
    dotsWrap?.replaceChildren();
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
      delete slider.dataset.showcaseSliderTimer;
    };
    const start = () => {
      if (!reducedMotion && !timer) {
        timer = window.setInterval(next, 5200 + sliderIndex * 650);
        slider.dataset.showcaseSliderTimer = String(timer);
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
  site: {
    brand: {
      name: "肥窝",
      subtitle: "水汽白桃的橱窗",
      navWorks: "作品",
      navGuides: "攻略",
      navContact: "联系",
    },
    hero: {
      eyebrow: "水汽白桃的个人小窝",
      titleLine1: "一个普普通通",
      titleLine2: "小画师的",
      titleLine3: "小窝",
      lede: "这里轻轻收着橱窗作品、视频攻略、绘画流程和一点点图片小盒。还在慢慢长大，但每一格都会尽量整理得柔软、清楚、好翻。",
      primaryCta: "翻一翻攻略",
      secondaryCta: "看橱窗作品",
      cardRibbon: "画风 & 个人作品 展示",
      cardName: "水汽白桃",
      cardDescription: "一个喜欢各种各样小东西的小小母肥",
    },
    status: {
      title: "小窝状态",
      note: "个人状态 / 排单情况 / 约稿状态",
      personalValue: "慢慢营业中",
      personalLabel: "个人状态",
      queueValue: "按顺序排队",
      queueLabel: "排单情况",
      commissionValue: "开放中",
      commissionLabel: "约稿状态",
    },
    works: {
      eyebrow: "橱窗链接",
      title: "把作品和约稿信息放在一张安静的小卡里。",
      note: "样图、价格和说明都收在这里，需要时可以轻轻点开。",
      ribbon: "画稿 & 个人作品 展示",
      price: "40 RMB",
      cardTitle: "【洛克王国】二值笔全身qq人+精灵",
      cardDescription: "加价服务清单\n宠物一只 ¥8\n\n试营试营\n需要您发送光线充足下全身图片+小体型精灵\n有什么需求和我沟通就好\n如果时间空闲基本3～5天出\n流程：确定草稿→成图\n\n无特殊要求默认展示，感谢约稿！",
      linkLabel: "打开橱窗",
    },
    guides: {
      eyebrow: "应用 & 视频",
      title: "这些都是好东西哦，我一个人反复看了好多次！",
      note: "把常用链接和小记录分门别类放好，翻找时不打扰页面的呼吸。",
      searchPlaceholder: "搜索视频、攻略或标签",
      filterAll: "全部",
      filterVideo: "视频",
      filterGuide: "攻略",
      filterGame: "游戏",
      filterArt: "绘画",
      filterLife: "生活",
    },
    collections: {
      eyebrow: "收藏小盒",
      title: "把一组图、灵感和小收藏，收进更安静的小抽屉。",
      note: "一组图片、一点灵感，点开后像抽屉一样在小窝里展开。",
      metaLabel: "Picture Box",
      countSuffix: "个小盒正在展示",
      keepNote: "点开后保持 BGM 和小桃",
      cardKicker: "Picture Box",
    },
    pictures: {
      eyebrow: "图片小盒",
      title: "把喜欢的图片轻轻撒在桌面上，像一叠会呼吸的小拍立得。",
      note: "打开图片墙时，相纸会一张张落下；平时只安静地待在那里。",
      metaLabel: "Picture Wall",
      countSuffix: "张相纸摆在墙上",
      featureNote: "支持展开成沉浸图片墙",
      wallTitle: "小桃图片墙",
      expandLabel: "展开",
      shrinkLabel: "缩小",
      editLabel: "编辑",
      resetLabel: "重置",
      saveLabel: "保存",
      composeLabel: "相纸文字",
      composePlaceholder: "先写照片下方的文字，再上传图片或添加空白卡",
      uploadLabel: "上传带文字照片",
      blankLabel: "添加空白卡",
      hint: "点击相纸可以预览；拖动相纸可以调整位置；保存前请先输入管理密钥。",
    },
    contact: {
      miniSpeech: "哼哼~",
      eyebrow: "找到我",
      title: "看看我平时在做什么~",
      note: "我平时会在这些平台上分享我的创作和日常",
      huajiaLabel: "画加",
      xiaohongshuLabel: "小红书",
      bilibiliLabel: "bilibili",
    },
    footer: {
      left: "肥窝 | 水汽白桃   power by 温尔文雅",
      center: "power by 温尔文雅（QQ：1129474282）",
      right: "橱窗 / 攻略 / 个人小窝",
    },
    showcaseImages: [
      "./img/cc1/cc1_1.jpg",
      "./img/cc1/cc1_2.jpg",
      "./img/cc1/cc1_3.jpg",
      "./img/cc1/cc1_4.jpg",
    ],
  },
  bgm: [
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
  ],
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
  const mediaForm = admin?.querySelector("[data-admin-media-form]");
  const collectionForm = admin?.querySelector("[data-admin-collection-form]");
  const siteForm = admin?.querySelector("[data-admin-site-form]");
  const bgmForm = admin?.querySelector("[data-admin-bgm-form]");
  const saveForm = admin?.querySelector("[data-admin-save-form]");
  const adminToast = admin?.querySelector("[data-admin-toast]");

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
  const mediaCategories = [
    { value: "video", label: "视频" },
    { value: "guide", label: "攻略" },
    { value: "game", label: "游戏" },
    { value: "art", label: "绘画" },
    { value: "life", label: "生活" },
    { value: "article", label: "图文" },
    { value: "link", label: "链接" },
  ];
  const siteTextFields = [
    { path: "brand.name", label: "站点名称", selector: ".brand-copy strong" },
    { path: "brand.subtitle", label: "站点副标题", selector: ".brand-copy small" },
    { path: "brand.navWorks", label: "导航：作品", selector: '.main-nav a[href="#works"]' },
    { path: "brand.navGuides", label: "导航：攻略", selector: '.main-nav a[href="#guides"]' },
    { path: "brand.navContact", label: "导航：联系", selector: '.main-nav a[href="#contact"]' },
    { path: "hero.eyebrow", label: "首页眉标", selector: ".hero-copy .eyebrow" },
    { path: "hero.titleLine1", label: "首页大标题 1", selector: ".hero-title span:nth-child(1)" },
    { path: "hero.titleLine2", label: "首页大标题 2", selector: ".hero-title span:nth-child(2)" },
    { path: "hero.titleLine3", label: "首页大标题 3", selector: ".hero-title span:nth-child(3)" },
    { path: "hero.lede", label: "首页简介", selector: ".hero-lede", type: "textarea" },
    { path: "hero.primaryCta", label: "首页主按钮", selector: ".hero-actions .button-primary span" },
    { path: "hero.secondaryCta", label: "首页次按钮", selector: ".hero-actions .button-ghost span" },
    { path: "hero.cardRibbon", label: "首页展示卡标签", selector: ".hero-card .card-ribbon" },
    { path: "hero.cardName", label: "首页展示卡名称", selector: ".hero-card-copy strong" },
    { path: "hero.cardDescription", label: "首页展示卡说明", selector: ".hero-card-copy span" },
    { path: "status.title", label: "状态栏标题", selector: ".status-category-title span:last-child" },
    { path: "status.note", label: "状态栏说明", selector: ".status-category-note" },
    { path: "status.personalValue", label: "个人状态值", selector: ".status-item:nth-child(1) strong" },
    { path: "status.personalLabel", label: "个人状态标签", selector: ".status-item:nth-child(1) span:not(.status-icon)" },
    { path: "status.queueValue", label: "排单状态值", selector: ".status-item:nth-child(2) strong" },
    { path: "status.queueLabel", label: "排单状态标签", selector: ".status-item:nth-child(2) span:not(.status-icon)" },
    { path: "status.commissionValue", label: "约稿状态值", selector: ".status-item:nth-child(3) strong" },
    { path: "status.commissionLabel", label: "约稿状态标签", selector: ".status-item:nth-child(3) span:not(.status-icon)" },
    { path: "works.eyebrow", label: "橱窗眉标", selector: "#works .section-heading .eyebrow" },
    { path: "works.title", label: "橱窗大标题", selector: "#works-title", type: "textarea" },
    { path: "works.note", label: "橱窗副标题", selector: "#works .section-heading-note", type: "textarea" },
    { path: "works.price", label: "橱窗价格", selector: ".showcase-card > div:last-child > span" },
    { path: "works.cardTitle", label: "橱窗卡标题", selector: ".showcase-card h3", type: "textarea" },
    { path: "works.cardDescription", label: "橱窗卡说明", selector: ".showcase-card .service-list", type: "textarea" },
    { path: "works.linkLabel", label: "橱窗按钮文字", selector: ".showcase-card .work-link span" },
    { path: "guides.eyebrow", label: "应用视频眉标", selector: "#guides .section-heading .eyebrow" },
    { path: "guides.title", label: "应用视频大标题", selector: "#guides-title", type: "textarea" },
    { path: "guides.note", label: "应用视频副标题", selector: "#guides .section-heading-note", type: "textarea" },
    { path: "guides.searchPlaceholder", label: "应用视频搜索提示", selector: "#guide-search", attr: "placeholder" },
    { path: "guides.filterAll", label: "筛选：全部", selector: '[data-filter="all"]' },
    { path: "guides.filterVideo", label: "筛选：视频", selector: '[data-filter="video"]' },
    { path: "guides.filterGuide", label: "筛选：攻略", selector: '[data-filter="guide"]' },
    { path: "guides.filterGame", label: "筛选：游戏", selector: '[data-filter="game"]' },
    { path: "guides.filterArt", label: "筛选：绘画", selector: '[data-filter="art"]' },
    { path: "guides.filterLife", label: "筛选：生活", selector: '[data-filter="life"]' },
    { path: "collections.eyebrow", label: "收藏小盒眉标", selector: "#collections .section-heading .eyebrow" },
    { path: "collections.title", label: "收藏小盒大标题", selector: "#collections-title", type: "textarea" },
    { path: "collections.note", label: "收藏小盒副标题", selector: "#collections .section-heading-note", type: "textarea" },
    { path: "collections.keepNote", label: "收藏小盒提示", selector: "#collections .section-meta-row span:nth-child(3)" },
    { path: "collections.cardKicker", label: "小盒卡片标签" },
    { path: "pictures.eyebrow", label: "图片墙眉标", selector: "#pictures .section-heading .eyebrow" },
    { path: "pictures.title", label: "图片墙大标题", selector: "#pictures-title", type: "textarea" },
    { path: "pictures.note", label: "图片墙副标题", selector: "#pictures .section-heading-note", type: "textarea" },
    { path: "pictures.featureNote", label: "图片墙提示", selector: "#pictures .section-meta-row span:nth-child(3)" },
    { path: "pictures.wallTitle", label: "图片墙子页标题", selector: '[data-view-template="pictures-view-template"]', attr: "data-view-title" },
    { path: "pictures.expandLabel", label: "图片墙展开按钮" },
    { path: "pictures.shrinkLabel", label: "图片墙缩小按钮" },
    { path: "pictures.editLabel", label: "图片墙编辑按钮", selector: "[data-picture-edit-toggle] span" },
    { path: "pictures.resetLabel", label: "图片墙重置按钮", selector: "[data-picture-cancel]" },
    { path: "pictures.saveLabel", label: "图片墙保存按钮", selector: "[data-picture-save]" },
    { path: "pictures.composeLabel", label: "图片墙文字标签", selector: ".picture-compose label > span" },
    { path: "pictures.composePlaceholder", label: "图片墙输入提示", selector: "[data-picture-description]", attr: "placeholder", type: "textarea" },
    { path: "pictures.uploadLabel", label: "图片上传按钮", selector: "[data-picture-upload]" },
    { path: "pictures.blankLabel", label: "空白卡按钮", selector: ".picture-compose button[type='submit']" },
    { path: "pictures.hint", label: "图片墙底部提示", selector: ".picture-hint", type: "textarea" },
    { path: "contact.miniSpeech", label: "联系小人气泡", selector: ".contact-mini-speech" },
    { path: "contact.eyebrow", label: "联系眉标", selector: ".contact-card-header .eyebrow" },
    { path: "contact.title", label: "联系大标题", selector: "#contact-title", type: "textarea" },
    { path: "contact.note", label: "联系说明", selector: ".contact-card-header > p:not(.eyebrow)", type: "textarea" },
    { path: "contact.huajiaLabel", label: "联系按钮：画加", selector: ".contact-actions .contact-platform:nth-child(1) span:last-child" },
    { path: "contact.xiaohongshuLabel", label: "联系按钮：小红书", selector: ".contact-actions .contact-platform:nth-child(2) span:last-child" },
    { path: "contact.bilibiliLabel", label: "联系按钮：bilibili", selector: ".contact-actions .contact-platform:nth-child(3) span:last-child" },
    { path: "footer.left", label: "页脚左侧", selector: ".site-footer span:nth-child(1)" },
    { path: "footer.center", label: "页脚中间", selector: ".site-footer span:nth-child(2)" },
    { path: "footer.right", label: "页脚右侧", selector: ".site-footer span:nth-child(3)" },
  ];
  const getPath = (source, path) => path.split(".").reduce((value, key) => (value && Object.hasOwn(value, key) ? value[key] : undefined), source);
  const setPath = (target, path, value) => {
    const keys = path.split(".");
    const last = keys.pop();
    const host = keys.reduce((object, key) => {
      object[key] = object[key] && typeof object[key] === "object" ? object[key] : {};
      return object[key];
    }, target);
    host[last] = value;
  };

  let siteContent = clone(defaultSiteContent);
  let lastSavedContent = clone(defaultSiteContent);
  let editingMediaId = "";
  let editingCollectionId = "";
  let collectionEditDraftItems = [];
  let adminToastTimer = null;
  let hasUnsavedChanges = false;

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

  const normalizeSite = (site = {}) => {
    const next = clone(defaultSiteContent.site);
    siteTextFields.forEach((field) => {
      setPath(next, field.path, normalizeText(getPath(site, field.path), getPath(defaultSiteContent.site, field.path)));
    });
    next.showcaseImages = Array.isArray(site.showcaseImages)
      ? site.showcaseImages.map((item) => normalizeText(item)).filter(Boolean).slice(0, 6)
      : clone(defaultSiteContent.site.showcaseImages);
    if (!next.showcaseImages.length) next.showcaseImages = clone(defaultSiteContent.site.showcaseImages);
    return next;
  };

  const normalizeBgmTrack = (track = {}) => ({
    title: normalizeText(track.title, "新 BGM"),
    src: normalizeText(track.src),
  });

  const normalizeContent = (content) => ({
    version: 1,
    updatedAt: content.updatedAt || new Date().toISOString(),
    site: normalizeSite(content.site),
    bgm: Array.isArray(content.bgm)
      ? content.bgm.map(normalizeBgmTrack).filter((track) => track.src)
      : clone(defaultSiteContent.bgm),
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

  const renderShowcaseImages = () => {
    const images = (siteContent.site.showcaseImages || defaultSiteContent.site.showcaseImages).slice(0, 6);
    const heroSlider = document.querySelector(".hero-artwork-slider");
    if (heroSlider) {
      heroSlider.replaceChildren(
        ...images.map((src, index) => {
          const image = document.createElement("img");
          image.className = `hero-artwork-slide${index === 0 ? " is-active" : ""}`;
          image.src = src;
          image.alt = `橱窗示例 ${index + 1}`;
          image.loading = index === 0 ? "eager" : "lazy";
          image.decoding = "async";
          return image;
        }),
      );
    }
    document.querySelectorAll(".showcase-carousel").forEach((carousel) => {
      if (carousel.dataset.showcaseSliderTimer) window.clearInterval(Number(carousel.dataset.showcaseSliderTimer));
      const nextCarousel = carousel.cloneNode(false);
      const dots = document.createElement("div");
      dots.className = "showcase-dots";
      dots.setAttribute("aria-label", "选择橱窗示例");
      nextCarousel.replaceChildren(
        ...images.map((src, index) => {
          const image = document.createElement("img");
          image.className = `showcase-slide${index === 0 ? " is-active" : ""}`;
          image.src = src;
          image.alt = "";
          image.loading = "lazy";
          image.decoding = "async";
          return image;
        }),
        dots,
      );
      carousel.replaceWith(nextCarousel);
    });
  };

  const applyTextField = (field, root = document) => {
    if (!field.selector) return;
    const value = getPath(siteContent.site, field.path);
    root.querySelectorAll(field.selector).forEach((target) => {
      if (field.attr) {
        target.setAttribute(field.attr, value);
        return;
      }
      target.textContent = value;
    });
  };

  const applyIconText = (selector, value, root = document) => {
    root.querySelectorAll(selector).forEach((target) => {
      const icon = target.querySelector("i, svg");
      target.replaceChildren();
      if (icon) target.append(icon);
      target.append(` ${value}`);
    });
  };

  const applySiteText = (root = document) => {
    siteTextFields.forEach((field) => applyTextField(field, root));
    applyIconText("#collections .section-meta-row span:nth-child(1)", getPath(siteContent.site, "collections.metaLabel"), root);
    applyIconText("#pictures .section-meta-row span:nth-child(1)", getPath(siteContent.site, "pictures.metaLabel"), root);
    root.querySelectorAll(".collection-card > span").forEach((item) => {
      item.textContent = getPath(siteContent.site, "collections.cardKicker");
    });
    root.querySelectorAll("[data-picture-fullscreen]").forEach((button) => {
      const expanded = button.getAttribute("aria-pressed") === "true";
      const label = expanded ? getPath(siteContent.site, "pictures.shrinkLabel") : getPath(siteContent.site, "pictures.expandLabel");
      const span = button.querySelector("span");
      if (span) span.textContent = label;
      button.setAttribute("aria-label", expanded ? "缩小图片墙窗口" : "展开图片墙窗口");
    });
  };

  const renderSiteTextEditor = () => {
    const fields = siteForm?.querySelector("[data-admin-site-fields]");
    if (fields) {
      fields.innerHTML = siteTextFields
        .map((field) => {
          const value = getPath(siteContent.site, field.path) ?? "";
          const input =
            field.type === "textarea"
              ? `<textarea name="${escapeHtml(field.path)}" rows="3">${escapeHtml(value)}</textarea>`
              : `<input name="${escapeHtml(field.path)}" value="${escapeHtml(value)}" />`;
          return `
            <label>
              <span>${escapeHtml(field.label)}</span>
              ${input}
            </label>
          `;
        })
        .join("");
    }
    renderShowcaseEditor();
  };

  const readBgmFromEditor = () =>
    [...(bgmForm?.querySelectorAll("[data-admin-bgm-row]") || [])]
      .map((row) =>
        normalizeBgmTrack({
          title: row.querySelector('[name="bgmTitle"]')?.value,
          src: row.querySelector('[name="bgmSrc"]')?.value,
        }),
      )
      .filter((track) => track.src);

  const renderBgmEditor = () => {
    const list = bgmForm?.querySelector("[data-admin-bgm-list]");
    if (!list) return;
    list.innerHTML = siteContent.bgm
      .map(
        (track, index) => `
          <div class="admin-bgm-row" data-admin-bgm-row>
            <label>
              <span>BGM 名字</span>
              <input name="bgmTitle" value="${escapeHtml(track.title)}" placeholder="例如：幽冥水底" />
            </label>
            <label>
              <span>音频文件路径 / 链接</span>
              <input name="bgmSrc" value="${escapeHtml(track.src)}" placeholder="./sound/BGM/xxx.mp3" />
            </label>
            <button type="button" data-admin-remove-bgm="${index}">移除</button>
          </div>
        `,
      )
      .join("");
  };

  const renderAdminList = () => {
    const list = admin?.querySelector("[data-admin-current-list]");
    if (!list) return;
    const rows = [
      ...siteContent.media.map((item) => ({ type: "media", id: item.id, label: `内容：${item.title}`, meta: mediaLabel(item.type, item.category) })),
      ...siteContent.collections.map((item) => ({ type: "collection", id: item.id, label: `小盒：${item.title}`, meta: `${item.items.length} 张图片` })),
    ];
    list.innerHTML = `
      <h3>当前内容</h3>
      ${rows
        .map(
          (row) => `
            <div class="content-admin-list-row">
              <span>${escapeHtml(row.label)} · ${escapeHtml(row.meta)}</span>
              <div class="content-admin-row-actions">
                <button type="button" data-admin-edit="${escapeHtml(row.type)}" data-admin-edit-id="${escapeHtml(row.id)}">编辑</button>
                <button type="button" data-admin-remove="${escapeHtml(row.type)}" data-admin-remove-id="${escapeHtml(row.id)}">移除</button>
              </div>
            </div>
          `,
        )
        .join("")}
    `;
  };

  const syncContentMetrics = () => {
    const collectionSuffix = getPath(siteContent.site, "collections.countSuffix") || "个小盒正在展示";
    const pictureSuffix = getPath(siteContent.site, "pictures.countSuffix") || "张相纸摆在墙上";
    document.querySelectorAll("[data-content-collection-count]").forEach((item) => {
      item.textContent = String(siteContent.collections.length);
      const wrap = item.parentElement;
      if (wrap) {
        wrap.replaceChildren(item, ` ${collectionSuffix}`);
      }
    });
    document.querySelectorAll("[data-content-picture-count]").forEach((item) => {
      item.textContent = String(siteContent.pictures.length);
      const wrap = item.parentElement;
      if (wrap) {
        wrap.replaceChildren(item, pictureSuffix);
      }
    });
    document.querySelectorAll("[data-picture-wall-count]").forEach((item) => {
      item.textContent = `${siteContent.pictures.length} 张`;
    });
  };

  const renderAll = () => {
    renderShowcaseImages();
    renderMediaCards();
    renderCollectionCards();
    applySiteText();
    renderAdminList();
    renderSiteTextEditor();
    renderBgmEditor();
    syncContentMetrics();
    bootIcons();
    setupHeroArtworkSlider();
    setupShowcaseSliders();
    setupTiltCards();
    document.dispatchEvent(new CustomEvent("kawaii:content-rendered"));
  };

  const loadContent = async () => {
    try {
      const response = await fetch("./data/site-content.json", { cache: "no-store" });
      if (!response.ok) throw new Error("content file missing");
      siteContent = normalizeContent(await response.json());
      lastSavedContent = clone(siteContent);
      hasUnsavedChanges = false;
      renderAll();
    } catch {
      siteContent = normalizeContent(defaultSiteContent);
      lastSavedContent = clone(siteContent);
      hasUnsavedChanges = false;
      renderAll();
    } finally {
      window.kawaiiContentReady = true;
      document.dispatchEvent(new CustomEvent("kawaii:content-ready"));
    }
  };

  const markAdminDirty = (message = "已更新到页面预览。确认没问题后点“保存到网站”。") => {
    hasUnsavedChanges = true;
    renderAll();
    setAdminStatus(message, "success");
  };

  const getAdminKey = () => {
    const field = admin?.querySelector('[name="key"]');
    return field?.value?.trim() || "";
  };

  const setAdminStatus = (message, tone = "") => {
    const status = admin?.querySelector("[data-admin-status]");
    if (status) {
      status.textContent = message;
      status.dataset.tone = tone;
    }
    if (!adminToast) return;
    window.clearTimeout(adminToastTimer);
    adminToast.textContent = message;
    adminToast.dataset.tone = tone;
    if (!message) {
      adminToast.classList.remove("is-visible");
      adminToast.hidden = true;
      return;
    }
    adminToast.hidden = false;
    adminToast.getBoundingClientRect();
    adminToast.classList.add("is-visible");
    adminToastTimer = window.setTimeout(() => {
      adminToast.classList.remove("is-visible");
      window.setTimeout(() => {
        if (adminToast.classList.contains("is-visible")) return;
        adminToast.hidden = true;
      }, 260);
    }, 5000);
  };

  const setFormValue = (form, name, value = "") => {
    const field = form?.elements?.[name];
    if (!field) return;
    field.value = value ?? "";
  };

  const readSiteTextEditor = () => {
    const data = new FormData(siteForm);
    const nextSite = normalizeSite(siteContent.site);
    siteTextFields.forEach((field) => {
      if (!data.has(field.path)) return;
      setPath(nextSite, field.path, normalizeText(data.get(field.path), getPath(defaultSiteContent.site, field.path)));
    });
    return nextSite;
  };

  const readShowcaseImagesFromEditor = () =>
    [...(siteForm?.querySelectorAll("[data-admin-showcase-row]") || [])]
      .map((row) => normalizeText(row.querySelector('[name="showcaseImage"]')?.value))
      .filter(Boolean)
      .slice(0, 6);

  const renderShowcaseEditor = () => {
    const list = siteForm?.querySelector("[data-admin-showcase-list]");
    if (!list) return;
    const images = (siteContent.site.showcaseImages || []).slice(0, 6);
    list.innerHTML = images
      .map(
        (src, index) => `
          <div class="admin-showcase-row" data-admin-showcase-row>
            <img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" />
            <label>
              <span>轮播图片 ${index + 1}</span>
              <input name="showcaseImage" value="${escapeHtml(src)}" placeholder="./img/cc1/cc1_4.jpg" />
            </label>
            <button type="button" data-admin-remove-showcase="${index}">移除</button>
          </div>
        `,
      )
      .join("");
    const addButton = siteForm?.querySelector("[data-admin-add-showcase]");
    if (addButton) addButton.disabled = images.length >= 6;
  };

  const appendShowcaseEditorRow = (src = "") => {
    const list = siteForm?.querySelector("[data-admin-showcase-list]");
    if (!list) return;
    const count = list.querySelectorAll("[data-admin-showcase-row]").length;
    if (count >= 6) {
      setAdminStatus("轮播图片最多 6 张。", "error");
      return;
    }
    const row = document.createElement("div");
    row.className = "admin-showcase-row";
    row.dataset.adminShowcaseRow = "";
    row.innerHTML = `
      <img src="${escapeHtml(src || "./img/card.png")}" alt="" loading="lazy" decoding="async" />
      <label>
        <span>轮播图片 ${count + 1}</span>
        <input name="showcaseImage" value="${escapeHtml(src)}" placeholder="./img/cc1/cc1_4.jpg" />
      </label>
      <button type="button" data-admin-remove-showcase="${count}">移除</button>
    `;
    list.append(row);
    const addButton = siteForm?.querySelector("[data-admin-add-showcase]");
    if (addButton) addButton.disabled = count + 1 >= 6;
  };

  const resetMediaEditor = () => {
    editingMediaId = "";
    mediaForm?.reset();
    setFormValue(mediaForm, "editId", "");
    const title = admin?.querySelector("[data-admin-media-title]");
    const label = admin?.querySelector("[data-admin-media-submit-label]");
    const cancel = admin?.querySelector("[data-admin-cancel-media]");
    if (title) title.textContent = "添加视频 / 图文攻略";
    if (label) label.textContent = "添加到首页";
    if (cancel) cancel.hidden = true;
  };

  const startMediaEdit = (id) => {
    const item = siteContent.media.find((entry) => entry.id === id);
    if (!item || !mediaForm) return;
    editingMediaId = item.id;
    setFormValue(mediaForm, "editId", item.id);
    setFormValue(mediaForm, "title", item.title);
    setFormValue(mediaForm, "type", item.type);
    setFormValue(mediaForm, "url", item.url);
    setFormValue(mediaForm, "category", item.category);
    setFormValue(mediaForm, "cover", item.cover);
    setFormValue(mediaForm, "description", item.description);
    setFormValue(mediaForm, "body", item.body);
    const title = admin?.querySelector("[data-admin-media-title]");
    const label = admin?.querySelector("[data-admin-media-submit-label]");
    const cancel = admin?.querySelector("[data-admin-cancel-media]");
    if (title) title.textContent = "编辑视频 / 图文攻略";
    if (label) label.textContent = "保存修改";
    if (cancel) cancel.hidden = false;
    mediaForm.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    setAdminStatus("正在编辑这张内容卡。修改后先保存到页面预览，再点“保存到网站”。", "loading");
  };

  const readCollectionDraftFromEditor = () => {
    const editor = collectionForm?.querySelector("[data-admin-collection-items]");
    if (!editor) return collectionEditDraftItems;
    return [...editor.querySelectorAll("[data-collection-draft-index]")]
      .map((row) => {
        const index = Number(row.dataset.collectionDraftIndex);
        const image = collectionEditDraftItems[index];
        if (!image?.src) return null;
        return {
          src: image.src,
          title: normalizeText(row.querySelector('[name="itemTitle"]')?.value, image.title || "图片"),
          description: normalizeText(row.querySelector('[name="itemDescription"]')?.value, image.description),
        };
      })
      .filter(Boolean);
  };

  const renderCollectionEditor = () => {
    const editor = collectionForm?.querySelector("[data-admin-collection-items]");
    if (!editor) return;
    editor.hidden = !editingCollectionId;
    if (!editingCollectionId) {
      editor.replaceChildren();
      return;
    }
    if (!collectionEditDraftItems.length) {
      editor.innerHTML = "<strong>小盒里暂时没有图片，可以在下方继续上传。</strong>";
      return;
    }
    editor.innerHTML = `
      <strong>小盒内图片</strong>
      ${collectionEditDraftItems
        .map(
          (image, index) => `
            <div class="collection-item-editor-row" data-collection-draft-index="${index}">
              <img src="${escapeHtml(image.src)}" alt="" loading="lazy" decoding="async" />
              <div>
                <label>
                  <span>图片标题</span>
                  <input name="itemTitle" value="${escapeHtml(image.title)}" />
                </label>
                <label>
                  <span>图片说明</span>
                  <textarea name="itemDescription" rows="2">${escapeHtml(image.description)}</textarea>
                </label>
              </div>
              <button type="button" data-admin-remove-collection-image="${index}">移除</button>
            </div>
          `,
        )
        .join("")}
    `;
  };

  const resetCollectionEditor = () => {
    editingCollectionId = "";
    collectionEditDraftItems = [];
    collectionForm?.reset();
    setFormValue(collectionForm, "editId", "");
    const title = admin?.querySelector("[data-admin-collection-title]");
    const label = admin?.querySelector("[data-admin-collection-submit-label]");
    const cancel = admin?.querySelector("[data-admin-cancel-collection]");
    if (title) title.textContent = "添加可点开的图片小盒";
    if (label) label.textContent = "添加小盒";
    if (cancel) cancel.hidden = true;
    renderCollectionEditor();
  };

  const startCollectionEdit = (id) => {
    const item = siteContent.collections.find((entry) => entry.id === id);
    if (!item || !collectionForm) return;
    editingCollectionId = item.id;
    collectionEditDraftItems = clone(item.items);
    setFormValue(collectionForm, "editId", item.id);
    setFormValue(collectionForm, "title", item.title);
    setFormValue(collectionForm, "cover", item.cover);
    setFormValue(collectionForm, "description", item.description);
    const title = admin?.querySelector("[data-admin-collection-title]");
    const label = admin?.querySelector("[data-admin-collection-submit-label]");
    const cancel = admin?.querySelector("[data-admin-cancel-collection]");
    if (title) title.textContent = "编辑可点开的图片小盒";
    if (label) label.textContent = "保存小盒修改";
    if (cancel) cancel.hidden = false;
    renderCollectionEditor();
    collectionForm.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    setAdminStatus("正在编辑这个小盒。可以改文字、移除旧图，或继续上传新图片。", "loading");
  };

  const openAdmin = () => {
    if (!admin) return;
    admin.hidden = false;
    admin.setAttribute("aria-hidden", "false");
    const keyField = admin.querySelector('[name="key"]');
    if (keyField) {
      keyField.value = "";
      keyField.type = "password";
    }
    const keyToggle = admin.querySelector("[data-admin-toggle-key]");
    if (keyToggle) {
      keyToggle.setAttribute("aria-pressed", "false");
      keyToggle.setAttribute("aria-label", "显示管理密钥");
      keyToggle.innerHTML = '<i data-lucide="eye" aria-hidden="true"></i>';
    }
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
      hasUnsavedChanges = false;
      renderAll();
      const keyField = admin?.querySelector('[name="key"]');
      if (keyField) {
        keyField.value = "";
        keyField.type = "password";
      }
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
    const paragraphs = item.body
      .split(/\n{2,}/)
      .filter((text) => text.trim())
      .map((text) => `<p>${escapeHtml(text)}</p>`)
      .join("");
    section.innerHTML = `
      <div class="content-detail-hero">
        <img src="${escapeHtml(item.cover || "./img/card.png")}" alt="" />
        <div class="content-detail-copy">
          <span class="content-detail-kicker">${escapeHtml(mediaLabel(item.type, item.category))}</span>
          <h1>${escapeHtml(item.title)}</h1>
          <p>${escapeHtml(item.description)}</p>
          ${item.url ? `<a class="button button-primary" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer"><span>打开原链接</span><i data-lucide="external-link" aria-hidden="true"></i></a>` : ""}
        </div>
      </div>
      ${paragraphs ? `<article class="content-detail-body">${paragraphs}</article>` : ""}
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
        <div class="content-detail-copy">
          <span class="content-detail-kicker">Picture Box</span>
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
    const uploadButtons = wall.querySelectorAll("[data-picture-upload]");
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
    let suppressPicturePreview = false;

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
        const expandLabel = getPath(siteContent.site, "pictures.expandLabel") || "展开";
        const shrinkLabel = getPath(siteContent.site, "pictures.shrinkLabel") || "缩小";
        fullscreenButton.innerHTML = expanded
          ? `<i data-lucide="minimize-2" aria-hidden="true"></i><span>${escapeHtml(shrinkLabel)}</span>`
          : `<i data-lucide="maximize-2" aria-hidden="true"></i><span>${escapeHtml(expandLabel)}</span>`;
      }
      bootIcons();
    };

    const pictureEnterDelay = (index) => {
      const intervals = [360, 430, 520, 610];
      let delay = 0;
      for (let i = 0; i < index; i += 1) delay += intervals[i % intervals.length];
      return delay;
    };

    const syncPictureRatio = (card, image) => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (!width || !height) return;
      const ratio = Math.min(Math.max(width / height, 0.62), 1.68);
      card.style.setProperty("--picture-ratio", ratio.toFixed(3));
    };

    const closePicturePreview = (overlay) => {
      if (!overlay) return;
      overlay.classList.remove("is-visible");
      window.setTimeout(() => {
        overlay.remove();
        if (!document.querySelector(".picture-preview-overlay")) {
          document.body.classList.remove("is-picture-preview-open");
        }
      }, 260);
    };

    const openPicturePreview = (item) => {
      document.querySelectorAll(".picture-preview-overlay").forEach((overlay) => closePicturePreview(overlay));
      const overlay = document.createElement("div");
      overlay.className = "picture-preview-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", item.description || item.title || "图片预览");
      overlay.innerHTML = `
        <div class="picture-preview-dialog">
          <button class="picture-preview-close" type="button" aria-label="关闭图片预览">
            <i data-lucide="x" aria-hidden="true"></i>
          </button>
          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" />
          <div class="picture-preview-caption">
            <strong>${escapeHtml(item.title)}</strong>
            ${item.description ? `<span>${escapeHtml(item.description)}</span>` : ""}
          </div>
        </div>
      `;
      let keyClose = null;
      const close = () => {
        if (keyClose) window.removeEventListener("keydown", keyClose);
        closePicturePreview(overlay);
      };
      keyClose = (event) => {
        if (event.key !== "Escape") return;
        close();
      };
      overlay.addEventListener("click", close);
      overlay.querySelector(".picture-preview-dialog")?.addEventListener("click", (event) => event.stopPropagation());
      overlay.querySelector(".picture-preview-close")?.addEventListener("click", close);
      document.body.append(overlay);
      document.body.classList.add("is-picture-preview-open");
      bootIcons();
      window.addEventListener("keydown", keyClose);
      requestAnimationFrame(() => overlay.classList.add("is-visible"));
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
        const image = card.querySelector("img");
        if (image?.complete) syncPictureRatio(card, image);
        image?.addEventListener("load", () => syncPictureRatio(card, image), { once: true });
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
        const caption = description?.value?.trim();
        const fallback = file.name.replace(/\.[^.]+$/, "") || "新图片";
        siteContent.pictures.push({
          id: uniqueId("picture"),
          src: dataUrl,
          title: caption || fallback,
          description: caption || fallback,
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
      let didDrag = false;
      card.setPointerCapture?.(event.pointerId);
      card.classList.add("is-settled");
      card.classList.add("is-dragging");

      const move = (moveEvent) => {
        if (Math.hypot(moveEvent.clientX - start.x, moveEvent.clientY - start.y) > 6) didDrag = true;
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
        if (didDrag) {
          suppressPicturePreview = true;
          window.setTimeout(() => {
            suppressPicturePreview = false;
          }, 0);
        }
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
      if (deleteButton) {
        if (!isPictureEditing) return;
        const card = deleteButton.closest(".picture-card");
        siteContent.pictures = siteContent.pictures.filter((item) => item.id !== card?.dataset.pictureId);
        renderPictures();
        return;
      }
      const card = event.target.closest(".picture-card");
      if (!card || suppressPicturePreview) return;
      const item = siteContent.pictures.find((entry) => entry.id === card.dataset.pictureId);
      if (item) openPicturePreview(item);
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

    uploadButtons.forEach((button) => {
      button.addEventListener("click", () => input?.click());
    });
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
    const removeShowcase = event.target.closest("[data-admin-remove-showcase]");
    if (removeShowcase) {
      const images = readShowcaseImagesFromEditor();
      images.splice(Number(removeShowcase.dataset.adminRemoveShowcase), 1);
      siteContent.site = readSiteTextEditor();
      siteContent.site.showcaseImages = images;
      markAdminDirty("已从轮播图预览里移除。确认没问题后点“保存到网站”。");
      return;
    }

    if (event.target.closest("[data-admin-add-showcase]")) {
      appendShowcaseEditorRow();
      return;
    }

    const removeBgm = event.target.closest("[data-admin-remove-bgm]");
    if (removeBgm) {
      const tracks = readBgmFromEditor();
      tracks.splice(Number(removeBgm.dataset.adminRemoveBgm), 1);
      siteContent.bgm = tracks.length ? tracks : clone(defaultSiteContent.bgm);
      markAdminDirty("已从 BGM 预览列表里移除。确认没问题后点“保存到网站”。");
      return;
    }

    if (event.target.closest("[data-admin-add-bgm]")) {
      const tracks = readBgmFromEditor();
      tracks.push({ title: "新 BGM", src: "" });
      siteContent.bgm = tracks;
      renderBgmEditor();
      setAdminStatus("已添加一行 BGM，填好路径后点“更新 BGM 预览”。", "loading");
      return;
    }

    const editButton = event.target.closest("[data-admin-edit]");
    if (editButton) {
      const type = editButton.dataset.adminEdit;
      const id = editButton.dataset.adminEditId;
      if (type === "media") startMediaEdit(id);
      if (type === "collection") startCollectionEdit(id);
      return;
    }

    const removeCollectionImage = event.target.closest("[data-admin-remove-collection-image]");
    if (removeCollectionImage) {
      collectionEditDraftItems = readCollectionDraftFromEditor();
      collectionEditDraftItems.splice(Number(removeCollectionImage.dataset.adminRemoveCollectionImage), 1);
      renderCollectionEditor();
      setAdminStatus("已从这个小盒的编辑预览里移除图片。", "success");
      return;
    }

    if (event.target.closest("[data-admin-cancel-media]")) {
      resetMediaEditor();
      setAdminStatus("已退出内容卡编辑。", "success");
      return;
    }

    if (event.target.closest("[data-admin-cancel-collection]")) {
      resetCollectionEditor();
      setAdminStatus("已退出小盒编辑。", "success");
      return;
    }

    const removeButton = event.target.closest("[data-admin-remove]");
    if (removeButton) {
      const type = removeButton.dataset.adminRemove;
      const id = removeButton.dataset.adminRemoveId;
      if (type === "media") siteContent.media = siteContent.media.filter((item) => item.id !== id);
      if (type === "collection") siteContent.collections = siteContent.collections.filter((item) => item.id !== id);
      if (id === editingMediaId) resetMediaEditor();
      if (id === editingCollectionId) resetCollectionEditor();
      markAdminDirty("已从页面预览移除。确认没问题后点“保存到网站”。");
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

  admin?.querySelector("[data-admin-upload-showcase]")?.addEventListener("click", async () => {
    const [file] = await pickFile(false);
    if (!file) return;
    appendShowcaseEditorRow(await fileToDataUrl(file));
  });

  admin?.querySelector("[data-admin-toggle-key]")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const input = saveForm?.elements.key;
    if (!input) return;
    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.setAttribute("aria-pressed", String(shouldShow));
    button.setAttribute("aria-label", shouldShow ? "隐藏管理密钥" : "显示管理密钥");
    button.innerHTML = shouldShow
      ? '<i data-lucide="eye-off" aria-hidden="true"></i>'
      : '<i data-lucide="eye" aria-hidden="true"></i>';
    bootIcons();
    input.focus({ preventScroll: true });
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

  mediaForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const type = normalizeText(formData.get("type"), "article");
    const category = normalizeText(formData.get("category"), type);
    const wasEditing = Boolean(editingMediaId);
    const nextItem = normalizeMedia({
      id: editingMediaId || uniqueId("media"),
      type,
      category,
      title: formData.get("title"),
      url: formData.get("url"),
      cover: formData.get("cover") || "./img/card.png",
      description: formData.get("description"),
      body: formData.get("body"),
      tags: `${type} ${category}`,
    });
    if (editingMediaId) {
      const index = siteContent.media.findIndex((item) => item.id === editingMediaId);
      if (index >= 0) siteContent.media[index] = nextItem;
    } else {
      siteContent.media.unshift(nextItem);
    }
    resetMediaEditor();
    markAdminDirty(wasEditing ? "已更新到页面预览。确认没问题后点“保存到网站”。" : "已添加到页面预览。确认没问题后点“保存到网站”。");
  });

  siteForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    siteContent.site = readSiteTextEditor();
    siteContent.site.showcaseImages = readShowcaseImagesFromEditor().slice(0, 6);
    if (!siteContent.site.showcaseImages.length) siteContent.site.showcaseImages = clone(defaultSiteContent.site.showcaseImages);
    markAdminDirty("网页文字和轮播图已更新到页面预览。确认没问题后点“保存到网站”。");
  });

  bgmForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const tracks = readBgmFromEditor();
    if (!tracks.length) {
      setAdminStatus("请至少保留一首 BGM，并填写音频路径。", "error");
      return;
    }
    siteContent.bgm = tracks;
    markAdminDirty("BGM 列表已更新到页面预览。确认没问题后点“保存到网站”。");
  });

  collectionForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = [...form.elements.images.files];
    const wasEditing = Boolean(editingCollectionId);
    const existingItems = editingCollectionId ? readCollectionDraftFromEditor() : [];
    const images = [...existingItems];
    for (const file of files) {
      images.push({
        src: await fileToDataUrl(file),
        title: file.name.replace(/\.[^.]+$/, "") || "图片",
        description: "",
      });
    }
    const previous = siteContent.collections.find((item) => item.id === editingCollectionId);
    const cover = normalizeText(formData.get("cover")) || images[0]?.src || previous?.cover || "./img/card.png";
    const nextItem = normalizeCollection({
      id: editingCollectionId || uniqueId("collection"),
      title: formData.get("title"),
      description: formData.get("description"),
      cover,
      items: images,
    });
    if (editingCollectionId) {
      const index = siteContent.collections.findIndex((item) => item.id === editingCollectionId);
      if (index >= 0) siteContent.collections[index] = nextItem;
    } else {
      siteContent.collections.unshift(nextItem);
    }
    resetCollectionEditor();
    markAdminDirty(wasEditing ? "小盒已更新到页面预览。确认没问题后点“保存到网站”。" : "小盒已添加到页面预览。确认没问题后点“保存到网站”。");
  });

  saveForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveSiteContent();
  });

  window.kawaiiContent = {
    applySiteText,
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
  let tracks = window.kawaiiContent?.getContent?.().bgm?.length ? window.kawaiiContent.getContent().bgm : [
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

  const loadTrack = (index, { preserveSrc = false } = {}) => {
    if (!tracks.length) return;
    const previousSrc = audio.src;
    activeTrack = (index + tracks.length) % tracks.length;
    const track = tracks[activeTrack];
    if (!preserveSrc || !previousSrc.endsWith(track.src.replace(/^\.\//, ""))) audio.src = track.src;
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

  document.addEventListener("kawaii:content-rendered", () => {
    const nextTracks = window.kawaiiContent?.getContent?.().bgm || [];
    if (!nextTracks.length) return;
    const currentSrc = tracks[activeTrack]?.src;
    tracks = nextTracks;
    const matchedIndex = tracks.findIndex((track) => track.src === currentSrc);
    loadTrack(matchedIndex >= 0 ? matchedIndex : Math.min(activeTrack, tracks.length - 1), { preserveSrc: true });
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
    window.kawaiiContent?.applySiteText?.(content);
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

  let didOpenInitialHash = false;

  const openInitialHashView = () => {
    if (didOpenInitialHash) return;
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) return;

    const templateTrigger = document.querySelector(`[data-view-template][data-view-path="${CSS.escape(hash)}"]`);
    if (templateTrigger) {
      openTemplateView(templateTrigger.dataset.viewTemplate, { push: false, depth: 1 });
      didOpenInitialHash = true;
      return;
    }

    const detailId = decodeURIComponent(hash.slice(1));
    if (window.kawaiiContent?.createDetail?.(detailId)) {
      openContentDetail(detailId, { push: false, depth: 1 });
      didOpenInitialHash = true;
    }
  };

  requestAnimationFrame(openInitialHashView);
  document.addEventListener("kawaii:content-ready", openInitialHashView);
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
