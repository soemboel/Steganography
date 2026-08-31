/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║                   CYBER SECURITY SHIELD                  ║
 * ║           Anti-Inspect / Anti-Download Protection        ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 *  cyber.js — Client-Side Security Layer
 *  Protects against: DevTools, right-click, keyboard shortcuts,
 *  text selection, image drag, source viewing, and more.
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────
   *  1. DISABLE RIGHT-CLICK CONTEXT MENU
   * ───────────────────────────────────────────── */
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    showWarning();
    return false;
  });

  /* ─────────────────────────────────────────────
   *  2. BLOCK KEYBOARD SHORTCUTS
   * ───────────────────────────────────────────── */
  document.addEventListener("keydown", function (e) {
    const key = e.key ? e.key.toLowerCase() : "";

    // F12 — DevTools
    if (e.keyCode === 123) {
      e.preventDefault();
      showWarning();
      return false;
    }

    // Ctrl+Shift+I — DevTools Inspect
    if (e.ctrlKey && e.shiftKey && key === "i") {
      e.preventDefault();
      showWarning();
      return false;
    }

    // Ctrl+Shift+J — DevTools Console
    if (e.ctrlKey && e.shiftKey && key === "j") {
      e.preventDefault();
      showWarning();
      return false;
    }

    // Ctrl+Shift+C — DevTools Element Inspector
    if (e.ctrlKey && e.shiftKey && key === "c") {
      e.preventDefault();
      showWarning();
      return false;
    }

    // Ctrl+U — View Page Source
    if (e.ctrlKey && key === "u") {
      e.preventDefault();
      showWarning();
      return false;
    }

    // Ctrl+S — Save / Download Page
    if (e.ctrlKey && key === "s") {
      e.preventDefault();
      showWarning();
      return false;
    }

    // Ctrl+A — Select All
    if (e.ctrlKey && key === "a") {
      e.preventDefault();
      return false;
    }

    // Ctrl+C — Copy
    if (e.ctrlKey && key === "c") {
      e.preventDefault();
      return false;
    }

    // Ctrl+P — Print
    if (e.ctrlKey && key === "p") {
      e.preventDefault();
      showWarning();
      return false;
    }
  });

  /* ─────────────────────────────────────────────
   *  3. DISABLE TEXT SELECTION
   * ───────────────────────────────────────────── */
  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
    return false;
  });

  document.addEventListener("mousedown", function (e) {
    if (e.detail > 1) {
      e.preventDefault();
    }
  });

  /* ─────────────────────────────────────────────
   *  4. DISABLE DRAG & DROP (prevents image saving)
   * ───────────────────────────────────────────── */
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
    return false;
  });

  document.addEventListener("drop", function (e) {
    e.preventDefault();
    return false;
  });

  /* ─────────────────────────────────────────────
   *  5. DISABLE COPY / CUT
   * ───────────────────────────────────────────── */
  document.addEventListener("copy", function (e) {
    e.preventDefault();
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", "");
    }
    return false;
  });

  document.addEventListener("cut", function (e) {
    e.preventDefault();
    return false;
  });

  /* ─────────────────────────────────────────────
   *  6. DISABLE PRINT
   * ───────────────────────────────────────────── */
  window.addEventListener("beforeprint", function () {
    document.body.innerHTML =
      '<div style="text-align:center;padding:80px;font-family:sans-serif;">' +
      "<h1>Printing is disabled.</h1></div>";
  });

  /* ─────────────────────────────────────────────
   *  7. DEVTOOLS DETECTION — Window size method
   * ───────────────────────────────────────────── */
  (function detectDevTools() {
    const threshold = 160;
    let devToolsOpen = false;

    function check() {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          onDevToolsOpen();
        }
      } else {
        devToolsOpen = false;
        // Restore page if DevTools closed
        const overlay = document.getElementById("cyber-devtools-overlay");
        if (overlay) {
          overlay.remove();
          document.body.style.display = "";
        }
      }
    }

    setInterval(check, 1000);
  })();

  /* ─────────────────────────────────────────────
   *  8. DEVTOOLS DETECTION — debugger timing trick
   * ───────────────────────────────────────────── */
  (function debuggerTrap() {
    setInterval(function () {
      const s = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      if (performance.now() - s > 100) {
        onDevToolsOpen();
      }
    }, 3000);
  })();

  /* ─────────────────────────────────────────────
   *  9. DEVTOOLS OPEN ACTION
   * ───────────────────────────────────────────── */
  function onDevToolsOpen() {
    document.body.style.display = "none";
    showDevToolsOverlay();
  }

  /* ─────────────────────────────────────────────
   *  10. DISABLE view-source NAVIGATION
   * ───────────────────────────────────────────── */
  if (window.location.href.startsWith("view-source:")) {
    window.location.replace("about:blank");
  }

  /* ─────────────────────────────────────────────
   *  11. DISABLE MOBILE LONG-PRESS CONTEXT MENU
   * ───────────────────────────────────────────── */
  let longPressTimer;
  document.addEventListener("touchstart", function (e) {
    longPressTimer = setTimeout(function () {
      e.preventDefault();
    }, 500);
  });

  document.addEventListener("touchend", function () {
    clearTimeout(longPressTimer);
  });

  document.addEventListener("touchmove", function () {
    clearTimeout(longPressTimer);
  });

  /* ─────────────────────────────────────────────
   *  12. INJECT CSS PROTECTION STYLES
   * ───────────────────────────────────────────── */
  const style = document.createElement("style");
  style.id = "cyber-protection-styles";
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent !important;
    }

    img {
      pointer-events: none !important;
      -webkit-user-drag: none !important;
      -khtml-user-drag: none !important;
      -moz-user-drag: none !important;
      user-drag: none !important;
    }

    @media print {
      body { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────
   *  13. WARNING TOAST NOTIFICATION
   * ───────────────────────────────────────────── */
  function showWarning() {
    if (document.getElementById("cyber-warning")) return;

    const animStyle = document.createElement("style");
    animStyle.id = "cyber-anim-style";
    animStyle.textContent = `
      @keyframes cyberSlideIn {
        from { opacity: 0; transform: translateX(40px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(animStyle);

    const toast = document.createElement("div");
    toast.id = "cyber-warning";
    toast.style.cssText = [
      "position:fixed",
      "bottom:30px",
      "right:30px",
      "background:linear-gradient(135deg,#0f0f1a,#1a0a2e)",
      "color:#ff4757",
      "border:1px solid #ff4757",
      "border-left:4px solid #ff4757",
      "padding:16px 24px",
      "border-radius:10px",
      "font-family:'Segoe UI',monospace",
      "font-size:14px",
      "font-weight:600",
      "z-index:2147483647",
      "box-shadow:0 0 20px rgba(255,71,87,0.4),0 8px 32px rgba(0,0,0,0.5)",
      "display:flex",
      "align-items:center",
      "gap:12px",
      "animation:cyberSlideIn 0.3s ease forwards",
      "max-width:320px",
    ].join(";");

    toast.innerHTML =
      '<span style="font-size:20px;">🛡️</span>' +
      '<div>' +
        '<div style="color:#ff4757;margin-bottom:4px;">Access Blocked</div>' +
        '<div style="color:#aaa;font-size:12px;font-weight:400;">This action is not permitted.</div>' +
      "</div>";

    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.transition = "opacity 0.4s ease";
      toast.style.opacity = "0";
      setTimeout(function () {
        toast.remove();
        animStyle.remove();
      }, 400);
    }, 2500);
  }

  /* ─────────────────────────────────────────────
   *  14. DEVTOOLS OPEN OVERLAY
   * ───────────────────────────────────────────── */
  function showDevToolsOverlay() {
    if (document.getElementById("cyber-devtools-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "cyber-devtools-overlay";
    overlay.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "width:100vw",
      "height:100vh",
      "background:#0a0a0f",
      "z-index:2147483647",
      "display:flex",
      "flex-direction:column",
      "align-items:center",
      "justify-content:center",
      "font-family:'Segoe UI',monospace",
      "color:#ff4757",
    ].join(";");

    overlay.innerHTML =
      '<div style="text-align:center;">' +
        '<div style="font-size:64px;margin-bottom:20px;">🔒</div>' +
        '<h1 style="font-size:28px;margin:0 0 12px;letter-spacing:2px;">ACCESS DENIED</h1>' +
        '<p style="color:#555;font-size:14px;margin:0;">Developer tools are not permitted on this page.</p>' +
        '<p style="color:#333;font-size:12px;margin-top:8px;">Close DevTools to continue.</p>' +
      "</div>";

    document.body.appendChild(overlay);
  }

  /* ─────────────────────────────────────────────
   *  15. ANTI-IFRAME / CLICKJACKING PROTECTION
   * ───────────────────────────────────────────── */
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }

  /* ─────────────────────────────────────────────
   *  16. CONSOLE SECURITY MESSAGE
   * ───────────────────────────────────────────── */
  console.clear();
  console.log(
    "%c\uD83D\uDEE1\uFE0F SECURITY ACTIVE",
    "color:#ff4757;font-size:22px;font-weight:bold;background:#0f0f1a;padding:8px 16px;border-radius:6px;"
  );
  console.log(
    "%cThis site is protected. Unauthorized access attempts are monitored.",
    "color:#888;font-size:13px;"
  );

})();
