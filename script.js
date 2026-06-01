(function () {
  const stage = document.querySelector(".stage");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const mapItems = Array.from(document.querySelectorAll(".map-item"));
  const prevButton = document.querySelector("#prevSlide");
  const nextButton = document.querySelector("#nextSlide");
  const currentSlide = document.querySelector("#currentSlide");
  const totalSlides = document.querySelector("#totalSlides");
  const progressBar = document.querySelector("#progressBar");
  const slideMap = document.querySelector(".slide-map");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let activeIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let lastWheelAt = 0;

  const formatIndex = (index) => String(index + 1).padStart(2, "0");

  function setSlide(nextIndex, direction = "next", pushHash = true) {
    const boundedIndex = (nextIndex + slides.length) % slides.length;

    if (boundedIndex === activeIndex) {
      return;
    }

    stage.dataset.direction = direction;
    slides[activeIndex].classList.remove("active");
    slides[activeIndex].setAttribute("aria-hidden", "true");
    slides[activeIndex].inert = true;
    mapItems[activeIndex].classList.remove("active");
    mapItems[activeIndex].removeAttribute("aria-current");

    activeIndex = boundedIndex;

    slides[activeIndex].classList.add("active");
    slides[activeIndex].removeAttribute("aria-hidden");
    slides[activeIndex].inert = false;
    mapItems[activeIndex].classList.add("active");
    mapItems[activeIndex].setAttribute("aria-current", "true");

    currentSlide.textContent = formatIndex(activeIndex);
    progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
    slides[activeIndex].scrollTop = 0;
    slides[activeIndex].scrollLeft = 0;
    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;

    if (pushHash) {
      history.replaceState(null, "", `#slide-${activeIndex + 1}`);
    }

    if (slideMap) {
      const activeItem = mapItems[activeIndex];
      const targetLeft = activeItem.offsetLeft - slideMap.clientWidth / 2 + activeItem.clientWidth / 2;
      slideMap.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }

  function goNext() {
    setSlide(activeIndex + 1, "next");
  }

  function goPrev() {
    setSlide(activeIndex - 1, "prev");
  }

  function hydrateFromHash() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (!match) {
      return;
    }

    const hashIndex = Number(match[1]) - 1;
    if (hashIndex >= 0 && hashIndex < slides.length) {
      setSlide(hashIndex, hashIndex > activeIndex ? "next" : "prev", false);
    }
  }

  slides.forEach((slide, index) => {
    if (index !== activeIndex) {
      slide.setAttribute("aria-hidden", "true");
      slide.inert = true;
    } else {
      slide.inert = false;
    }
  });

  totalSlides.textContent = formatIndex(slides.length - 1);
  currentSlide.textContent = formatIndex(activeIndex);
  progressBar.style.width = `${(1 / slides.length) * 100}%`;

  prevButton.addEventListener("click", goPrev);
  nextButton.addEventListener("click", goNext);

  mapItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      setSlide(index, index > activeIndex ? "next" : "prev");
    });
  });

  window.addEventListener("keydown", (event) => {
    const forwardKeys = ["ArrowRight", "PageDown", " "];
    const backKeys = ["ArrowLeft", "PageUp"];

    if (forwardKeys.includes(event.key)) {
      event.preventDefault();
      goNext();
    }

    if (backKeys.includes(event.key)) {
      event.preventDefault();
      goPrev();
    }

    if (event.key === "Home") {
      event.preventDefault();
      setSlide(0, "prev");
    }

    if (event.key === "End") {
      event.preventDefault();
      setSlide(slides.length - 1, "next");
    }
  });

  window.addEventListener(
    "wheel",
    (event) => {
      const now = Date.now();
      if (now - lastWheelAt < 760 || Math.abs(event.deltaY) < 42) {
        return;
      }

      lastWheelAt = now;
      if (event.deltaY > 0) {
        goNext();
      } else {
        goPrev();
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    },
    { passive: true }
  );

  if (!reduceMotion) {
    window.addEventListener("pointermove", (event) => {
      const x = Math.round((event.clientX / window.innerWidth) * 100);
      const y = Math.round((event.clientY / window.innerHeight) * 100);
      stage.style.setProperty("--mouse-x", `${x}%`);
      stage.style.setProperty("--mouse-y", `${y}%`);
    });
  }

  window.addEventListener("hashchange", hydrateFromHash);
  hydrateFromHash();

  window.addEventListener("load", () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
})();
