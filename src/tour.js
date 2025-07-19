// Shepherd tour configuration for CodeFolio
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function startAppTour(router) {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      classes: 'shepherd-theme-arrows',
      modalOverlayOpeningPadding: 8,
      modalOverlayOpeningRadius: 4,
    },
    useModalOverlay: true,
  });

  // --- App.vue Main Navigation and Components ---
  tour.addStep({
    id: 'intro',
    text: 'Welcome to CodeFolio! This tour will guide you through the main navigation and features.',
    attachTo: { element: '#navigation', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'theme-switch',
    text: 'Switch between light and dark themes here.',
    attachTo: { element: 'button[aria-label*="theme"]', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'language-switch',
    text: 'Change the app language using this button.',
    attachTo: { element: '.v-tooltip:has(.language-switcher), language-switcher, .v-btn[aria-label*="language"]', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'nav-home',
    text: 'Return to the home page at any time.',
    attachTo: { element: '.v-btn[to="/"], a[href="/"]', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'nav-projects',
    text: 'Browse all user projects here.',
    attachTo: { element: '.v-btn[to="/projects"], a[href="/projects"]', on: 'bottom' },
    buttons: [{ text: 'Next', action: () => { router.push('/projects'); setTimeout(() => tour.next(), 500); } }]
  });
  tour.addStep({
    id: 'notifications',
    text: 'Check your notifications here.',
    attachTo: { element: '#notification-trigger', on: 'bottom' },
    when: { show: () => !!document.querySelector('#notification-trigger') },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'user-menu',
    text: 'Access your profile and logout options here.',
    attachTo: { element: '.v-btn[aria-label^="User menu for"]', on: 'bottom' },
    when: { show: () => !!document.querySelector('.v-btn[aria-label^="User menu for"]') },
    buttons: [{ text: 'Next', action: () => {
      let username = null;
      const btn = document.querySelector('.v-btn[aria-label^="User menu for"]');
      if (btn) {
        const label = btn.getAttribute('aria-label');
        username = label ? label.replace('User menu for ', '').trim() : null;
      }
      if (!username) username = 'profile';
      router.push(`/${username}`); setTimeout(() => tour.next(), 500);
    } }]
  });
  tour.addStep({
    id: 'login',
    text: 'If you are not logged in, use this button to sign in.',
    attachTo: { element: '.v-btn[to="/login"], a[href="/login"]', on: 'bottom' },
    when: { show: () => !!document.querySelector('.v-btn[to="/login"], a[href="/login"]') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  // --- Projects.vue ---
  tour.addStep({
    id: 'projects-search',
    text: 'Use the search bar to find projects by keyword, tag, or author.',
    attachTo: { element: '.v-text-field input', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'projects-type-filter',
    text: 'Filter projects by type using this dropdown.',
    attachTo: { element: '.v-select input[aria-label*="projectType"], .v-select[aria-label*="projectType"] input', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'projects-sort',
    text: 'Sort projects by newest, most viewed, or highest rated.',
    attachTo: { element: '.v-select input[aria-label*="sortBy"], .v-select[aria-label*="sortBy"] input', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'projects-list',
    text: 'Here are the projects. Click any project to view details.',
    attachTo: { element: '.project-card, .v-col .project-card, .v-col article', on: 'top' },
    buttons: [{ text: 'Next', action: () => {
      let username = null;
      const btn = document.querySelector('.v-btn[aria-label^="User menu for"]');
      if (btn) {
        const label = btn.getAttribute('aria-label');
        username = label ? label.replace('User menu for ', '').trim() : null;
      }
      if (!username) username = 'profile';
      router.push(`/${username}`); setTimeout(() => tour.next(), 500);
    } }]
  });

  // --- Profile.vue ---
  tour.addStep({
    id: 'profile-header',
    text: 'This is your profile header, showing your avatar, name, and bio.',
    attachTo: { element: '.profile-header', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'edit-profile',
    text: 'Edit your profile details here.',
    attachTo: { element: 'button[aria-label="Edit your profile"], button[aria-label="Edit Profile"], button:has(.mdi-pencil), button:has-text("Edit Profile")', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'add-project',
    text: 'Add a new project to your portfolio.',
    attachTo: { element: 'button[aria-label="Add a new project"], .v-btn:has(.mdi-plus), button[aria-label="Add Project"]', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });
  tour.addStep({
    id: 'export-profile',
    text: 'Export your profile as a PDF for sharing or backup.',
    attachTo: { element: 'button[aria-label="Export your profile as PDF"], .v-btn:has(.mdi-file-pdf-box), button[aria-label="Export as PDF"]', on: 'bottom' },
    buttons: [{ text: 'Finish', action: tour.complete }]
  });

  tour.start();
}
