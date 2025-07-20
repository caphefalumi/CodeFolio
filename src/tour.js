// Shepherd tour configuration for CodeFolio
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function startAppTour(router, i18n) {
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

  // --- Welcome Step ---
  tour.addStep({
    id: 'welcome',
    text: i18n.t('tourWelcome'),
    attachTo: { element: 'body', on: 'center' },
    buttons: [
      { text: i18n.t('tourSkip'), action: tour.complete, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourStart'), action: tour.next }
    ]
  });

  // --- Navigation Bar Tour (always visible) ---
  tour.addStep({
    id: 'logo-brand',
    text: i18n.t('tourLogoBrand'),
    attachTo: { element: '.v-app-bar-title, .v-toolbar-title', on: 'bottom' },
    buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
  });

  tour.addStep({
    id: 'theme-toggle',
    text: i18n.t('tourThemeToggle'),
    attachTo: { element: 'button[aria-label*="theme"], .v-btn[aria-label*="Theme"]', on: 'bottom' },
    buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
  });

  tour.addStep({
    id: 'language-switcher',
    text: i18n.t('tourLanguageSwitcher'),
    attachTo: { element: '.v-btn[aria-label="selectLanguage"], .v-btn:has(.mdi-translate), .language-switcher', on: 'bottom' },
    buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
  });

  tour.addStep({
    id: 'home-nav',
    text: i18n.t('tourHomeNav'),
    attachTo: { element: '.v-btn[to="/"], .v-btn[href="/"]', on: 'bottom' },
    buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
  });

  tour.addStep({
    id: 'projects-nav',
    text: i18n.t('tourProjectsNav'),
    attachTo: { element: 'v-btn[to="/projects"], .v-btn[href="/projects"]', on: 'bottom' },
    buttons: [{ text: i18n.t('tourExploreProjects'), action: () => { 
      router.push('/projects'); 
      setTimeout(() => tour.next(), 800); 
    } }]
  });

  // --- Projects Page Tour ---
  tour.addStep({
    id: 'projects-page-welcome',
    text: '📁 Welcome to the Projects page! Here you can discover amazing projects from the developer community.',
    attachTo: { element: '.v-container, .projects-container', on: 'top' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'projects-search',
    text: '🔍 Search for projects by title, description, tags, or author name. Find exactly what you\'re looking for!',
    attachTo: { element: 'input[aria-label*="search"], input[placeholder*="search"], .v-text-field input', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'project-type-filter',
    text: '📂 Filter projects by type: Web Development, Mobile Apps, APIs, Games, Design, Data Science, and more!',
    attachTo: { element: '.v-select[aria-label*="projectType"], .v-select:has(input[aria-label*="projectType"]), .project-type-filter', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'project-sort',
    text: '📊 Sort projects by newest first, most viewed, or highest rated to discover trending content.',
    attachTo: { element: '.v-select[aria-label*="sortBy"], .v-select:has(input[aria-label*="sortBy"]), .project-sort', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'project-cards',
    text: '💼 Browse through project cards. Each shows the title, description, author, and tags. Click any card to view details!',
    attachTo: { element: '.project-card, .v-card, .v-col article', on: 'top' },
    buttons: [{ text: 'View Project', action: () => {
      // Try to find a project card and navigate to it
      const projectCard = document.querySelector('.project-card, .v-card');
      if (projectCard) {
        const viewBtn = projectCard.querySelector('.v-btn[color="primary"], .v-btn:has(.mdi-eye)');
        if (viewBtn) viewBtn.click();
      }
      setTimeout(() => tour.next(), 800);
    } }]
  });

  // --- Project Detail Page Tour ---
  tour.addStep({
    id: 'project-detail-welcome',
    text: '📋 Project Details Page - Here you can explore the project in depth and interact with the community.',
    attachTo: { element: '.v-container, .project-detail-container', on: 'top' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'project-header',
    text: '📋 Project details including title, description, author, and tags. Click the author name to visit their profile!',
    attachTo: { element: '.v-card-title, .project-title, .project-header', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'project-voting',
    text: '👍👎 Vote on projects! Upvote great projects and downvote if needed. Your votes help the community discover quality content.',
    attachTo: { element: '.v-card-actions .v-btn[aria-label*="vote"], .v-card-actions .v-btn:has(.mdi-arrow-up-bold), .voting-buttons', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'github-link',
    text: '🐙 View the project on GitHub to see the source code, contribute, or star the repository.',
    attachTo: { element: '.v-btn[href*="github"], .v-btn:has(.mdi-github), .github-link', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'project-content',
    text: '📝 Detailed project content with rich formatting. Learn about implementation details, features, and technical insights.',
    attachTo: { element: '.project-content, .v-card-text, .project-description', on: 'top' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'github-stats',
    text: '📈 View GitHub statistics including stars, forks, and issues. See how popular the project is in the open-source community.',
    attachTo: { element: '#github-stats-heading, .github-stats, .v-card:has(.text-h4)', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'project-details',
    text: '📅 Project metadata including creation date, last update, and view count. Track the project\'s activity and popularity.',
    attachTo: { element: '#project-details-heading, .project-metadata, .v-list', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'comments-section',
    text: '💬 Join the discussion! Add comments, ask questions, or provide feedback. You can also mention other users with @username.',
    attachTo: { element: '#comments-heading, .comments-section, .v-card:has(.mention-textarea)', on: 'bottom' },
    buttons: [{ text: 'Next', action: () => {
      // Navigate to home page
      router.push('/'); 
      setTimeout(() => tour.next(), 800);
    } }]
  });

  // --- Home Page Tour ---
  tour.addStep({
    id: 'home-hero',
    text: '🚀 Welcome to CodeFolio! This is where developers showcase their projects and connect with the community.',
    attachTo: { element: '#hero-heading, .hero-section, .text-h2', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'featured-projects',
    text: '⭐ Featured projects section highlights the best work from our community. Discover amazing projects here!',
    attachTo: { element: '#featured-projects-heading, .featured-projects, .text-h4', on: 'bottom' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'platform-overview',
    text: '🏗️ Learn about the platform\'s features: modern frontend, secure backend, and robust security measures.',
    attachTo: { element: '.platform-features, .v-card:has(.text-h6)', on: 'top' },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  // --- Authentication Features (conditional) ---
  tour.addStep({
    id: 'login-button',
    text: '🔐 Sign in to access all features including creating projects, commenting, and following other developers.',
    attachTo: { element: '.v-btn[to="/login"], .v-btn[href="/login"], .login-btn', on: 'bottom' },
    when: { show: () => !!document.querySelector('.v-btn[to="/login"], .v-btn[href="/login"], .login-btn') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'register-button',
    text: '📝 New to CodeFolio? Create an account to start sharing your projects and connecting with other developers.',
    attachTo: { element: '.v-btn[to="/register"], .v-btn[href="/register"], .register-btn', on: 'bottom' },
    when: { show: () => !!document.querySelector('.v-btn[to="/register"], .v-btn[href="/register"], .register-btn') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  // --- User Features (conditional - only for logged in users) ---
  tour.addStep({
    id: 'notifications',
    text: '🔔 Check your notifications here. You\'ll get notified about new followers, comments, and project updates.',
    attachTo: { element: '#notification-trigger, .notification-btn, .v-btn[aria-label*="notification"]', on: 'bottom' },
    when: { show: () => !!document.querySelector('#notification-trigger, .notification-btn, .v-btn[aria-label*="notification"]') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'user-menu',
    text: '👤 Access your profile, manage your account, and logout from here.',
    attachTo: { element: '.v-btn[aria-label^="User menu"], .user-menu-btn, .profile-menu', on: 'bottom' },
    when: { show: () => !!document.querySelector('.v-btn[aria-label^="User menu"], .user-menu-btn, .profile-menu') },
    buttons: [{ text: 'View Profile', action: () => {
      let username = null;
      const btn = document.querySelector('.v-btn[aria-label^="User menu"], .user-menu-btn, .profile-menu');
      if (btn) {
        const label = btn.getAttribute('aria-label');
        username = label ? label.replace('User menu for ', '').trim() : null;
      }
      if (!username) username = 'profile';
      router.push(`/${username}`); 
      setTimeout(() => tour.next(), 800);
    } }]
  });

  // --- Profile Page Tour (conditional) ---
  tour.addStep({
    id: 'profile-header',
    text: '👤 Your profile header displays your avatar, name, username, bio, and contact information. Make it stand out!',
    attachTo: { element: '.profile-header, .v-avatar, .user-avatar', on: 'bottom' },
    when: { show: () => !!document.querySelector('.profile-header, .v-avatar, .user-avatar') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'follow-stats',
    text: '👥 Follow and be followed! Click on follower/following counts to see the full list. Build your developer network.',
    attachTo: { element: '.v-chip[color="primary"], .v-chip[color="secondary"], .follow-stats', on: 'bottom' },
    when: { show: () => !!document.querySelector('.v-chip[color="primary"], .v-chip[color="secondary"], .follow-stats') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'edit-profile-btn',
    text: '✏️ Edit your profile to update your information, change your avatar, or modify your bio.',
    attachTo: { element: 'button:has-text("Edit Profile"), .v-btn:has(.mdi-pencil), .edit-profile-btn', on: 'bottom' },
    when: { show: () => !!document.querySelector('button:has-text("Edit Profile"), .v-btn:has(.mdi-pencil), .edit-profile-btn') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'add-project-btn',
    text: '➕ Add new projects to showcase your work! Include detailed descriptions, GitHub links, and cover images.',
    attachTo: { element: 'button[aria-label="Add a new project"], .v-btn:has(.mdi-plus), .add-project-btn', on: 'bottom' },
    when: { show: () => !!document.querySelector('button[aria-label="Add a new project"], .v-btn:has(.mdi-plus), .add-project-btn') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'export-pdf',
    text: i18n.t('tourExportPdf'),
    attachTo: { element: 'button[aria-label*="Export"], .v-btn:has(.mdi-file-pdf-box), .export-pdf-btn', on: 'bottom' },
    when: { show: () => !!document.querySelector('button[aria-label*="Export"], .v-btn:has(.mdi-file-pdf-box), .export-pdf-btn') },
    buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
  });

  tour.addStep({
    id: 'reset-password',
    text: '🔒 Reset your password securely using email verification. Keep your account safe!',
    attachTo: { element: 'button:has-text("Reset Password"), .v-btn:has(.mdi-lock-reset), .reset-password-btn', on: 'bottom' },
    when: { show: () => !!document.querySelector('button:has-text("Reset Password"), .v-btn:has(.mdi-lock-reset), .reset-password-btn') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'my-projects',
    text: '💼 Your projects section shows all the work you\'ve shared. Edit or delete projects, and see how they perform.',
    attachTo: { element: '#projects-section-heading, .my-projects, .v-toolbar-title', on: 'bottom' },
    when: { show: () => !!document.querySelector('#projects-section-heading, .my-projects, .v-toolbar-title') },
    buttons: [{ text: 'Next', action: () => { 
      router.push('/'); 
      setTimeout(() => tour.next(), 800); 
    } }]
  });

  // --- Admin Features (conditional) ---
  tour.addStep({
    id: 'admin-nav',
    text: '⚙️ Admin panel for managing users, projects, and viewing analytics (admin users only).',
    attachTo: { element: '.v-btn[to="/admin"], .v-btn[href="/admin"], .admin-nav', on: 'bottom' },
    when: { show: () => !!document.querySelector('.v-btn[to="/admin"], .v-btn[href="/admin"], .admin-nav') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  tour.addStep({
    id: 'admin-dashboard',
    text: '⚙️ Admin dashboard for managing users, projects, and viewing platform analytics. Full control over the platform.',
    attachTo: { element: '.text-h4:has-text("Admin"), .admin-dashboard, .v-tabs', on: 'bottom' },
    when: { show: () => window.location.pathname === '/admin' && !!document.querySelector('.text-h4:has-text("Admin"), .admin-dashboard, .v-tabs') },
    buttons: [{ text: 'Next', action: tour.next }]
  });

  // --- Final Step ---
  tour.addStep({
    id: 'tour-complete',
    text: i18n.t('tourCompleteMessage'),
    attachTo: { element: 'body', on: 'center' },
    buttons: [
      { text: i18n.t('tourComplete'), action: tour.complete, classes: 'shepherd-button-primary' }
    ]
  });

  tour.start();
}
