import { atom } from 'nanostores';

// Initialize the store with the current theme from localStorage
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const theme = localStorage.getItem('theme') || 'default';
    console.log('🎨 getInitialTheme:', theme);
    return theme;
  }
  console.log('🎨 getInitialTheme: default (no window)');
  return 'default';
};

export const themeStore = atom<string>(getInitialTheme());

export function setTheme(theme: string) {
  console.log('🎨 setTheme called with:', theme);
  themeStore.set(theme);
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    console.log('🎨 Theme set in localStorage and DOM:', theme);
  }
}

// Initialize theme on page load and after view transitions
if (typeof window !== 'undefined') {
  // Initial load
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    console.log('🎨 Initializing theme from localStorage:', savedTheme);
    if (savedTheme) {
      themeStore.set(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  };

  // Run on initial load
  initializeTheme();

  // Run after view transitions
  document.addEventListener('astro:after-swap', initializeTheme);
}

// Log when store changes
themeStore.listen((value) => {
  console.log('🎨 themeStore updated to:', value);
}); 