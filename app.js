const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const savedTheme = localStorage.getItem("kawaii-theme");
root.dataset.theme = savedTheme || "light";
const restingCardSelector = ".work-card, .guide-card, .diary-note, .article-panel, .related-card";

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

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
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

function setupInfoCards() {
  const timeEl = document.querySelector("[data-live-time]");
  const dateEl = document.querySelector("[data-live-date]");
  const weatherEl = document.querySelector("[data-live-weather]");

  const updateClock = () => {
    const now = new Date();
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
      });
    }
  };

  updateClock();
  window.setInterval(updateClock, 1000);

  if (!weatherEl) return;

  const weatherNames = {
    0: "晴",
    1: "微晴",
    2: "多云",
    3: "阴",
    45: "雾",
    48: "雾",
    51: "小雨",
    53: "小雨",
    55: "小雨",
    61: "下雨",
    63: "下雨",
    65: "大雨",
    71: "小雪",
    73: "下雪",
    75: "大雪",
    80: "阵雨",
    81: "阵雨",
    82: "阵雨",
    95: "雷雨",
    96: "雷雨",
    99: "雷雨",
  };

  const defaultWeatherPlace = {
    label: "上海",
    latitude: 31.2304,
    longitude: 121.4737,
  };

  const setUnavailable = () => {
    weatherEl.textContent = "天气暂缺";
    weatherEl.title = "天气接口暂时不可用，请稍后刷新。";
  };

  const loadWeather = async ({ label, latitude, longitude }) => {
    if (!window.fetch) {
      setUnavailable();
      return;
    }

    try {
      const params = new URLSearchParams({
        latitude: latitude.toFixed(4),
        longitude: longitude.toFixed(4),
        current: "temperature_2m,weather_code",
        timezone: "auto",
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!response.ok) throw new Error("weather unavailable");

      const data = await response.json();
      const temp = Number(data.current?.temperature_2m);
      const code = Number(data.current?.weather_code);
      if (!Number.isFinite(temp)) throw new Error("weather missing");

      weatherEl.textContent = `${label} ${weatherNames[code] || "天气"} ${Math.round(temp)}°`;
      weatherEl.title =
        label === "附近"
          ? "根据浏览器定位获取的实时天气。"
          : "浏览器未提供定位时，默认显示上海天气。";
    } catch {
      setUnavailable();
    }
  };

  const loadDefaultWeather = () => loadWeather(defaultWeatherPlace);

  if (!navigator.geolocation) {
    loadDefaultWeather();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      loadWeather({ label: "附近", latitude, longitude });
    },
    loadDefaultWeather,
    { timeout: 4200, maximumAge: 1000 * 60 * 30 },
  );
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

  audio.addEventListener("ended", () => switchTrack(1));
  audio.addEventListener("play", syncPlayingState);
  audio.addEventListener("pause", syncPlayingState);
}

function setupGuideFilter() {
  const search = document.querySelector("#guide-search");
  const chips = document.querySelectorAll(".filter-chip");
  const guides = document.querySelectorAll(".guide-card");
  if (!search || !chips.length || !guides.length) return;

  let active = "all";

  const apply = () => {
    const query = search.value.trim().toLowerCase();
    guides.forEach((guide) => {
      const tags = guide.dataset.tags || "";
      const text = guide.textContent.toLowerCase();
      const categoryMatch = active === "all" || tags.includes(active);
      const queryMatch = !query || tags.includes(query) || text.includes(query);
      guide.classList.toggle("is-hidden", !(categoryMatch && queryMatch));
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      active = chip.dataset.filter || "all";
      apply();
    });
  });

  search.addEventListener("input", apply);
}

document.addEventListener("DOMContentLoaded", () => {
  bootIcons();
  setupThemeToggle();
  setupProgress();
  setupSmoothScroll();
  revealWithFallback();
  setupAnimeLoops();
  setupHeroArtworkSlider();
  setupShowcaseSliders();
  setupTiltCards();
  setupMagnetButtons();
  setupWorkCardLinks();
  setupCounters();
  setupInfoCards();
  setupMusicPlayer();
  setupGuideFilter();
});
