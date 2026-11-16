import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Lotto Ledger';
(function () {
    const theme = localStorage.getItem('theme') || 'default';
    const dark = localStorage.getItem('dark') === 'true';

    // Always reset first
    document.documentElement.classList.remove('theme-blue', 'theme-green', 'theme-red', 'dark');

    if (theme !== 'default') {
        document.documentElement.classList.add('theme-' + theme);
    }

    if (dark) {
        document.documentElement.classList.add('dark');
    }

    // Force default vars when theme=default & light mode
    if (theme === 'default' && !dark) {
        document.documentElement.classList.add('theme-default');
    }
})();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
