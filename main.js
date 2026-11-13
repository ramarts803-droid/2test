(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }

  // Header shadow on scroll
  var header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 10);
    }, { passive: true });
  }

  // Hamburger menu
  var menuToggle = $("menuToggle"), menuPanel = $("menuPanel");
  function setMenu(open) {
    if (!menuPanel || !menuToggle) return;
    menuPanel.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuToggle && menuPanel) {
    menuToggle.addEventListener("click", function () {
      setMenu(!menuPanel.classList.contains("open"));
    });
    // Same-page anchors scroll smoothly; links to other pages navigate normally.
    menuPanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href") || "";
        if (href.charAt(0) === "#") {
          var target = document.querySelector(href);
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".site-header")) setMenu(false);
    });
  }

  // Reveal-on-scroll
  var revealItems = document.querySelectorAll(
    ".eyebrow, .h2, .lede, .service-card, .case, .metric, .awards, .testimonial, .callout, .intake, .info, .team-img, .profile, .closing, .related-card, .service-index-card"
  );
  revealItems.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("in"); });
  }

  // Before / after sliders
  document.querySelectorAll(".ba-range").forEach(function (range) {
    var box = range.parentElement;
    range.addEventListener("input", function () {
      box.style.setProperty("--pos", range.value + "%");
    });
  });

  // Animated counters (home page only)
  var countEls = Array.prototype.slice.call(document.querySelectorAll(".count"));
  var metricsBox = document.querySelector(".metrics");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(el) {
    var target = Number(el.dataset.target), duration = 2200, startTime = performance.now();
    function step(now) {
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step); else el.textContent = String(target);
    }
    requestAnimationFrame(step);
  }
  if (!reduceMotion && "IntersectionObserver" in window && metricsBox && countEls.length) {
    countEls.forEach(function (el) { el.textContent = "0"; });
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countEls.forEach(function (el, i) { setTimeout(function () { countUp(el); }, i * 200); });
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.25 });
    counterObserver.observe(metricsBox);
  }

  // Expand / collapse: projects
  var toggleProjects = $("toggleProjects"), caseGrid = $("caseGrid");
  if (toggleProjects && caseGrid) {
    toggleProjects.addEventListener("click", function () {
      var expanded = caseGrid.classList.toggle("expanded");
      toggleProjects.setAttribute("aria-expanded", String(expanded));
      toggleProjects.textContent = expanded ? "Show fewer projects" : "Explore our projects";
    });
  }

  // Expand / collapse: services
  var toggleServices = $("toggleServices"), serviceGrid = $("serviceGrid");
  if (toggleServices && serviceGrid) {
    toggleServices.addEventListener("click", function () {
      var expanded = serviceGrid.classList.toggle("expanded");
      toggleServices.setAttribute("aria-expanded", String(expanded));
      toggleServices.textContent = expanded ? "Show fewer services" : "View all services";
    });
  }

  // Expand / collapse: team
  var toggleTeam = $("toggleTeam"), teamMore = $("teamMore");
  if (toggleTeam && teamMore) {
    toggleTeam.addEventListener("click", function () {
      var open = teamMore.classList.toggle("open");
      toggleTeam.setAttribute("aria-expanded", String(open));
      toggleTeam.textContent = open ? "Hide team details" : "Meet the team";
    });
  }

  // Lightbox for service and team photos
  var lightbox = $("lightbox"), lbImg = $("lbImg"), lbCap = $("lbCap");
  if (lightbox && lbImg) {
    var lbClose = $("lbClose"), lbPrev = $("lbPrev"), lbNext = $("lbNext");
    var lbItems = Array.prototype.slice.call(document.querySelectorAll(".service-gallery img, .team-grid img"));
    var lbIndex = 0, lbOpener = null;
    function showLb(i) {
      lbIndex = (i + lbItems.length) % lbItems.length;
      var src = lbItems[lbIndex];
      lbImg.src = src.currentSrc || src.src;
      lbImg.alt = src.alt;
      lbCap.textContent = src.alt;
    }
    function openLb(i) {
      lbOpener = document.activeElement;
      showLb(i);
      lightbox.hidden = false;
      lbClose.focus();
    }
    function closeLb() {
      lightbox.hidden = true;
      if (lbOpener) lbOpener.focus();
    }
    lbItems.forEach(function (img, i) {
      img.classList.add("zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.addEventListener("click", function () { openLb(i); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(i); }
      });
    });
    lbClose.addEventListener("click", closeLb);
    lbPrev.addEventListener("click", function () { showLb(lbIndex - 1); });
    lbNext.addEventListener("click", function () { showLb(lbIndex + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    });
  }

  // Intake form (home page)
  var form = $("intake");
  if (form) {
    var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQ0jfhOsZCfZoV6w_etmmcYh7QJMBzJ1fOhhGv0Knv0SuA6sVWTZkuZBD2aNfyX8Pf/exec";
    var btn = $("submitBtn"), status = $("status");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = $("name").value.trim(), email = $("email").value.trim(), phone = $("phone").value.trim();
      var url = SCRIPT_URL + "?" + new URLSearchParams({ name: name, email: email, phone: phone });
      btn.disabled = true;
      status.className = "";
      status.textContent = "Sending...";
      fetch(url, { method: "GET", mode: "no-cors" })
        .then(function () {
          status.className = "ok";
          status.textContent = "Thank you. We have received your enquiry and will be in touch within 24 hours.";
          form.reset();
          btn.disabled = false;
        })
        .catch(function () {
          status.className = "err";
          status.textContent = "Something went wrong. Please try again.";
          btn.disabled = false;
        });
    });
  }
})();
