/**
 * Ration Saathi - Theme Manager
 * Light / Dark switching with View Transitions API circular reveal & 200ms cross-fade fallback.
 * Persists to localStorage ('rs_theme') and syncs meta[name="theme-color"].
 */

export type Theme = 'light' | 'dark';

export function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function getCurrentTheme(): Theme {
  if (typeof document !== 'undefined') {
    const rootTheme = document.documentElement.getAttribute('data-theme') as Theme;
    if (rootTheme === 'light' || rootTheme === 'dark') return rootTheme;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rs_theme') as Theme;
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return getSystemTheme();
}

export function applyTheme(theme: Theme, event?: MouseEvent) {
  const root = document.documentElement;
  const oldTheme = root.getAttribute('data-theme') || 'light';
  if (oldTheme === theme && root.hasAttribute('data-theme')) return;

  const updateDOM = () => {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    localStorage.setItem('rs_theme', theme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0A1122' : '#0B3D91');
    }

    // Update toggle button aria attributes if present
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // Dispatch custom event for Three.js and custom listeners
    window.dispatchEvent(new CustomEvent('rs:themechange', { detail: { theme } }));
  };

  // Check for View Transitions API with circular reveal
  // @ts-ignore
  if (document.startViewTransition && event) {
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      updateDOM();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      document.documentElement.animate(
        {
          clipPath: theme === 'dark' ? clipPath : [...clipPath].reverse()
        },
        {
          duration: 350,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: theme === 'dark' ? '::view-transition-new(root)' : '::view-transition-old(root)'
        }
      );
    });
  } else {
    // Fallback: 200ms cross-fade
    root.style.transition = 'background-color 200ms ease, color 200ms ease';
    updateDOM();
  }
}

export function initTheme() {
  if (typeof window === 'undefined') return;
  const initialTheme = getCurrentTheme();
  applyTheme(initialTheme);

  // Listen to system preference changes if user hasn't explicitly set theme
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('rs_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}
