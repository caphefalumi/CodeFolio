// Shepherd tour configuration for CodeFolio
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'

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
  })

  // --- Header & Navigation Bar ---
  tour.addStep({
    id: 'welcome',
    text: i18n.t('tourWelcome'),
    buttons: [
      { text: i18n.t('tourSkip'), action: tour.complete, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourStart'), action: tour.next }
    ]
  })
  // --- CodeFolio & Home Page ---
  tour.addStep({
    id: 'logo-brand',
    text: i18n.t('tourLogoBrand'),
    attachTo: { element: '#tour-step-logo-brand', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'platform-overview',
    text: i18n.t('tourPlatformOverview'),
    attachTo: { element: '#tour-step-platform-overview', on: 'top' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'featured-projects',
    text: i18n.t('tourFeaturedProjects'),
    attachTo: { element: '#featured-projects-heading', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'theme-toggle',
    text: i18n.t('tourThemeToggle'),
    attachTo: { element: '#tour-step-theme-toggle', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'language-switcher',
    text: i18n.t('tourLanguageSwitcher'),
    attachTo: { element: '#tour-step-language-switcher', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'home-nav',
    text: i18n.t('tourHomeNav'),
    attachTo: { element: '#tour-step-home-nav', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'projects-nav',
    text: i18n.t('tourProjectsNav'),
    attachTo: { element: '#tour-step-projects-nav', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourExploreProjects'), action: () => { 
        router.push('/projects') 
        setTimeout(() => tour.next(), 800) 
      } }
    ]
  })



  // --- Projects Page ---
  tour.addStep({
    id: 'projects-page-welcome',
    text: i18n.t('tourProjectsPageWelcome'),
    attachTo: { element: '#tour-step-projects-page-welcome', on: 'top' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'projects-search',
    text: i18n.t('tourProjectsSearch'),
    attachTo: { element: '#tour-step-projects-search', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'project-type-filter',
    text: i18n.t('tourProjectTypeFilter'),
    attachTo: { element: '#project-type-filter', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'project-sort',
    text: i18n.t('tourProjectSort'),
    attachTo: { element: '#project-sort', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'project-cards',
    text: i18n.t('tourProjectCards'),
    attachTo: { element: '#tour-step-project-card', on: 'top' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourViewProject'), action: () => {
        // Try to find a project card and navigate to it
        const projectCard = document.querySelector('#tour-step-project-card')
        if (projectCard) {
          const viewBtn = projectCard.querySelector('.v-btn[color="primary"], .v-btn:has(.mdi-eye)')
          if (viewBtn) viewBtn.click()
        }
        setTimeout(() => tour.next(), 800)
      } }
    ]
  })

  // --- Project Detail Page ---
  tour.addStep({
    id: 'project-detail-welcome',
    text: i18n.t('tourProjectDetailWelcome'),
    attachTo: { element: '#tour-step-project-detail-welcome', on: 'top' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'project-header',
    text: i18n.t('tourProjectHeader'),
    attachTo: { element: '#tour-step-project-header', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'project-voting',
    text: i18n.t('tourProjectVoting'),
    attachTo: { element: '#tour-step-project-voting', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'github-link',
    text: i18n.t('tourGithubLink'),
    attachTo: { element: '#tour-step-github-link', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'project-content',
    text: i18n.t('tourProjectContent'),
    attachTo: { element: '#tour-step-project-content', on: 'top' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'github-stats',
    text: i18n.t('tourGithubStats'),
    attachTo: { element: '#tour-step-github-stats', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'project-details',
    text: i18n.t('tourProjectDetails'),
    attachTo: { element: '#tour-step-project-details', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: tour.next }
    ]
  })
  tour.addStep({
    id: 'comments-section',
    text: i18n.t('tourCommentsSection'),
    attachTo: { element: '#tour-step-comments-section', on: 'bottom' },
    buttons: [
      { text: i18n.t('tourPrevious'), action: tour.back, classes: 'shepherd-button-secondary' },
      { text: i18n.t('tourNext'), action: () => {
        // Navigate to home page
        router.push('/') 
        setTimeout(() => tour.next(), 800) 
      } }
    ]
  })

  // --- Notification & User Menu ---
  const loginBtn = document.querySelector('#tour-step-login-button')
  console.log('Login Button:', loginBtn)
  if (loginBtn) {
    tour.addStep({
      id: 'login-button',
      text: i18n.t('tourLoginButton'),
      attachTo: { element: '#tour-step-login-button', on: 'bottom' },
      buttons: [{ text: i18n.t('tourNext'), action: () => {
        router.push('/login')
        setTimeout(() => tour.next(), 800)
      }}],
    })
  }
  else {
    tour.addStep({
      id: 'notifications',
      text: i18n.t('tourNotifications'),
      attachTo: { element: '#notification-trigger', on: 'bottom' },
      when: { show: () => !!document.querySelector('#notification-trigger') },
      buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
    })

    tour.addStep({
      id: 'user-menu',
      text: i18n.t('tourUserMenu'),
      attachTo: { element: '#tour-step-user-menu', on: 'bottom' },
      when: { show: () => !!document.querySelector('#tour-step-user-menu') },
      buttons: [{ text: i18n.t('tourViewProfile'), action: () => {
        let username = null
        const btn = document.querySelector('#tour-step-user-menu')
        if (btn) {
          const label = btn.getAttribute('aria-label')
          username = label ? label.replace('User menu for ', '').trim() : null
        }
        if (!username) username = 'profile'
        router.push(`/${username}`) 
        setTimeout(() => tour.next(), 800)
      } }]
    })

    tour.addStep({
      id: 'follow-stats',
      text: i18n.t('tourFollowStats'),
      attachTo: { element: '#follow-stats', on: 'bottom' },
      buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
    })
    tour.addStep({
      id: 'edit-profile-btn',
      text: i18n.t('tourEditProfileBtn'),
      attachTo: { element: '#edit-profile-btn', on: 'bottom' },
      buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
    })
    tour.addStep({
      id: 'reset-password',
      text: i18n.t('tourResetPassword'),
      attachTo: { element: '#reset-password-btn', on: 'bottom' },
      buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
    })
    tour.addStep({
      id: 'export-pdf',
      text: i18n.t('tourExportPdf'),
      attachTo: { element: '#export-pdf-btn', on: 'bottom' },
      buttons: [{ text: i18n.t('tourNext'), action: tour.next }]
    })

  }

  // --- Admin Features (conditional) ---
  const isAdmin = document.querySelector('#admin-nav')
  if (isAdmin) {
    tour.addStep({
      id: 'admin-nav',
      text: i18n.t('tourAdminNav'),
      attachTo: { element: '#admin-nav', on: 'bottom' },
      buttons: [{ text: i18n.t('tourNext'), action: () => {
        router.push('/admin')
        setTimeout(() => tour.next(), 800)
      }}]
    })
    tour.addStep({
      id: 'admin-tab-users',
      text: i18n.t('tourAdminTabUsers'),
      attachTo: { element: '#admin-tab-users', on: 'bottom' },
      buttons: [{ text: i18n.t('tourNext'), action: () => {
        router.push('/admin?tab=posts')
        setTimeout(() => tour.next(), 800)
      }}]
    })
    tour.addStep({
      id: 'admin-tab-posts',
      text: i18n.t('tourAdminTabPosts'),
      attachTo: { element: '#admin-tab-posts', on: 'bottom' },
      buttons: [{ text: i18n.t('tourNext'), action: () => {
        router.push('/admin?tab=analytics')
        setTimeout(() => tour.next(), 800)
      }}]
    })
    tour.addStep({
      id: 'admin-tab-analytics',
      text: i18n.t('tourAdminTabAnalytics'),
      attachTo: { element: '#admin-tab-analytics', on: 'bottom' },
      buttons: [{ text: i18n.t('tourEnd'), action: tour.next }]
    })
  }
  // --- Final Step ---
  tour.addStep({
    id: 'tour-complete',
    text: i18n.t('tourCompleteMessage'),
    attachTo: { element: 'body', on: 'center' },
    buttons: [
      { text: i18n.t('tourComplete'), action: tour.complete, classes: 'shepherd-button-primary' }
    ]
  })

  tour.start()
}
