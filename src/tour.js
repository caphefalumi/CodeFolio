// Shepherd tour configuration for CodeFolio
import Shepherd from "shepherd.js"
import "shepherd.js/dist/css/shepherd.css"

export function startAppTour(router, i18n) {
	const savedTourState = localStorage.getItem("tour-state")
	let shouldResume = false
	let startStepIndex = 0
	let startRoute = null
	if (savedTourState) {
		try {
			const parsed = JSON.parse(savedTourState)
			if (
				typeof parsed === "object" &&
				typeof parsed.step === "number" &&
				typeof parsed.route === "string"
			) {
				startStepIndex = parsed.step
				startRoute = parsed.route
				shouldResume = true
			}
		} catch (e) {
			// fallback for old format (just a number)
			const parsed = parseInt(savedTourState, 10)
			if (!isNaN(parsed)) {
				startStepIndex = parsed
				shouldResume = true
			}
		}
	}

	const tour = new Shepherd.Tour({
		defaultStepOptions: {
			scrollTo: { behavior: "smooth", block: "center" },
			cancelIcon: { enabled: true },
			classes: "shepherd-theme-arrows",
			modalOverlayOpeningPadding: 8,
			modalOverlayOpeningRadius: 4,
		},
		useModalOverlay: true,
	})

	// Save current step and route to localStorage on show
	tour.on("show", () => {
		const stepIndex = tour.currentStep
			? tour.steps.indexOf(tour.currentStep)
			: 0
		const route = getCurrentRoute()
		localStorage.setItem(
			"tour-state",
			JSON.stringify({ step: stepIndex, route })
		)
	})
	// Remove from localStorage on complete/cancel
	tour.on("complete", () => {
		localStorage.removeItem("tour-state")
	})

	// Helper to add a back button to all steps except the first
	function withBackButton(buttons, tour) {
		if (!buttons.some(btn => btn.action === tour.back)) {
			// Insert Back as the first button (except for the first step)
			return [
				{
					text: i18n.t("tourPrevious"),
					action: tour.back,
					classes: "shepherd-button-secondary",
				},
				...buttons,
			]
		}
		return buttons
	}

	// --- Header & Navigation Bar ---
	tour.addStep({
		id: "welcome",
		text: i18n.t("tourWelcome"),
		buttons: [
			{
				text: i18n.t("tourSkip"),
				action: tour.complete,
				classes: "shepherd-button-secondary",
			},
			{ text: i18n.t("tourStart"), action: tour.next },
		],
	})
	// --- CodeFolio & Home Page ---
	tour.addStep({
		id: "logo-brand",
		text: i18n.t("tourLogoBrand"),
		attachTo: { element: "#tour-step-logo-brand", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "platform-overview",
		text: i18n.t("tourPlatformOverview"),
		attachTo: { element: "#tour-step-platform-overview", on: "top" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "featured-projects",
		text: i18n.t("tourFeaturedProjects"),
		attachTo: { element: "#featured-projects-heading", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "theme-toggle",
		text: i18n.t("tourThemeToggle"),
		attachTo: { element: "#tour-step-theme-toggle", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "language-switcher",
		text: i18n.t("tourLanguageSwitcher"),
		attachTo: { element: "#tour-step-language-switcher", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "home-nav",
		text: i18n.t("tourHomeNav"),
		attachTo: { element: "#tour-step-home-nav", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "projects-nav",
		text: i18n.t("tourProjectsNav"),
		attachTo: { element: "#tour-step-projects-nav", on: "bottom" },
		buttons: withBackButton(
			[
				{
					text: i18n.t("tourExploreProjects"),
					action: () => {
						router.push("/projects")
						setTimeout(() => tour.next(), 800)
					},
				},
			],
			tour
		),
	})
	// --- Projects Page ---
	tour.addStep({
		id: "projects-page-welcome",
		text: i18n.t("tourProjectsPageWelcome"),
		attachTo: { element: "#tour-step-projects-page-welcome", on: "top" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "projects-search",
		text: i18n.t("tourProjectsSearch"),
		attachTo: { element: "#tour-step-projects-search", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "search-hashtag-mention",
		text: i18n.t("tourSearchHashtagMention"),
		attachTo: { element: "#tour-step-projects-search", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "project-type-filter",
		text: i18n.t("tourProjectTypeFilter"),
		attachTo: { element: "#project-type-filter", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "project-sort",
		text: i18n.t("tourProjectSort"),
		attachTo: { element: "#project-sort", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "project-cards",
		text: i18n.t("tourProjectCards"),
		attachTo: { element: "#tour-step-project-card", on: "top" },
		buttons: withBackButton(
			[
				{
					text: i18n.t("tourViewProject"),
					action: () => {
						// Try to find a project card and navigate to it
						const projectCard = document.querySelector(
							"#tour-step-project-card"
						)
						if (projectCard) {
							const viewBtn = projectCard.querySelector(
								'.v-btn[color="primary"], .v-btn:has(.mdi-eye)'
							)
							if (viewBtn) viewBtn.click()
						}
						setTimeout(() => tour.next(), 800)
					},
				},
			],
			tour
		),
	})

	// --- Project Detail Page ---
	tour.addStep({
		id: "project-detail-welcome",
		text: i18n.t("tourProjectDetailWelcome"),
		attachTo: { element: "#tour-step-project-detail-welcome", on: "top" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "project-header",
		text: i18n.t("tourProjectHeader"),
		attachTo: { element: "#tour-step-project-header", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "project-voting",
		text: i18n.t("tourProjectVoting"),
		attachTo: { element: "#tour-step-project-voting", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "github-link",
		text: i18n.t("tourGithubLink"),
		attachTo: { element: "#tour-step-github-link", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "project-content",
		text: i18n.t("tourProjectContent"),
		attachTo: { element: "#tour-step-project-content", on: "top" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "github-stats",
		text: i18n.t("tourGithubStats"),
		attachTo: { element: "#tour-step-github-stats", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "project-details",
		text: i18n.t("tourProjectDetails"),
		attachTo: { element: "#tour-step-project-details", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "comments-section",
		text: i18n.t("tourComments"),
		attachTo: { element: "#tour-step-comments-section", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	tour.addStep({
		id: "comments-mention",
		text: i18n.t("tourCommentsMention"),
		attachTo: { element: "#tour-step-comments-section", on: "bottom" },
		buttons: withBackButton(
			[{ text: i18n.t("tourNext"), action: tour.next }],
			tour
		),
	})
	// --- Notification & User Menu ---
	const loginBtn = document.querySelector("#tour-step-login-button")
	if (loginBtn) {
		tour.addStep({
			id: "login-button",
			text: i18n.t("tourLoginButton"),
			attachTo: { element: "#tour-step-login-button", on: "bottom" },
			buttons: withBackButton(
				[
					{
						text: i18n.t("tourNext"),
						action: () => {
							router.push("/login")
							setTimeout(() => tour.next(), 800)
						},
					},
				],
				tour
			),
		})
	} else {
		tour.addStep({
			id: "notifications",
			text: i18n.t("tourNotifications"),
			attachTo: { element: "#notification-trigger", on: "bottom" },
			when: { show: () => !!document.querySelector("#notification-trigger") },
			buttons: withBackButton(
				[{ text: i18n.t("tourNext"), action: tour.next }],
				tour
			),
		})

		tour.addStep({
			id: "user-menu",
			text: i18n.t("tourUserMenu"),
			attachTo: { element: "#tour-step-user-menu", on: "bottom" },
			when: { show: () => !!document.querySelector("#tour-step-user-menu") },
			buttons: withBackButton(
				[
					{
						text: i18n.t("tourViewProfile"),
						action: () => {
							let username = null
							const btn = document.querySelector("#tour-step-user-menu")
							if (btn) {
								const label = btn.getAttribute("aria-label")
								username = label
									? label.replace("User menu for ", "").trim()
									: null
							}
							if (!username) username = ""
							router.push(`/${username}`)
							setTimeout(() => tour.next(), 800)
						},
					},
				],
				tour
			),
		})

		tour.addStep({
			id: "follow-stats",
			text: i18n.t("tourFollowStats"),
			attachTo: { element: "#follow-stats", on: "bottom" },
			buttons: withBackButton(
				[{ text: i18n.t("tourNext"), action: tour.next }],
				tour
			),
		})
		tour.addStep({
			id: "edit-profile-btn",
			text: i18n.t("tourEditProfileBtn"),
			attachTo: { element: "#edit-profile-btn", on: "bottom" },
			buttons: withBackButton(
				[{ text: i18n.t("tourNext"), action: tour.next }],
				tour
			),
		})
		tour.addStep({
			id: "reset-password",
			text: i18n.t("tourResetPassword"),
			attachTo: { element: "#reset-password-btn", on: "bottom" },
			buttons: withBackButton(
				[{ text: i18n.t("tourNext"), action: tour.next }],
				tour
			),
		})
		tour.addStep({
			id: "export-pdf",
			text: i18n.t("tourExportPdf"),
			attachTo: { element: "#export-pdf-btn", on: "bottom" },
			buttons: withBackButton(
				[{ text: i18n.t("tourNext"), action: tour.next }],
				tour
			),
		})
	}

	// --- Admin Features (conditional) ---
	const isAdmin = document.querySelector("#admin-nav")
	if (isAdmin) {
		tour.addStep({
			id: "admin-nav",
			text: i18n.t("tourAdminNav"),
			attachTo: { element: "#admin-nav", on: "bottom" },
			buttons: withBackButton(
				[
					{
						text: i18n.t("tourNext"),
						action: () => {
							router.push("/admin")
							setTimeout(() => tour.next(), 800)
						},
					},
				],
				tour
			),
		})
		tour.addStep({
			id: "admin-tab-users",
			text: i18n.t("tourAdminTabUsers"),
			attachTo: { element: "#admin-tab-users", on: "bottom" },
			buttons: withBackButton(
				[
					{
						text: i18n.t("tourNext"),
						action: () => {
							router.push("/admin?tab=posts")
							setTimeout(() => tour.next(), 800)
						},
					},
				],
				tour
			),
		})
		tour.addStep({
			id: "admin-tab-posts",
			text: i18n.t("tourAdminTabPosts"),
			attachTo: { element: "#admin-tab-posts", on: "bottom" },
			buttons: withBackButton(
				[
					{
						text: i18n.t("tourNext"),
						action: () => {
							router.push("/admin?tab=analytics")
							setTimeout(() => tour.next(), 800)
						},
					},
				],
				tour
			),
		})
		tour.addStep({
			id: "admin-tab-analytics",
			text: i18n.t("tourAdminTabAnalytics"),
			attachTo: { element: "#admin-tab-analytics", on: "bottom" },
			buttons: withBackButton(
				[{ text: i18n.t("tourEnd"), action: tour.next }],
				tour
			),
		})
	}
	// --- Final Step ---
	tour.addStep({
		id: "tour-complete",
		text: i18n.t("tourCompleteMessage"),
		buttons: [
			{
				text: i18n.t("tourComplete"),
				action: tour.complete,
				classes: "shepherd-button-primary",
			},
			{
				text: i18n.t("tourStartOver"),
				action: () => {
					localStorage.removeItem("tour-state")
					tour.cancel()
					setTimeout(() => {
						tour.start()
					}, 400)
				},
				classes: "shepherd-button-secondary",
			},
		],
	})

	// --- Resume logic: navigate to correct route before resuming ---
	function getCurrentRoute() {
		// Vue Router 3/4 compatible
		return router.currentRoute && router.currentRoute.value
			? router.currentRoute.value.path
			: router.currentRoute.path
	}

	function resumeTourAtStep(stepIndex, route) {
		const currentRoute = getCurrentRoute()
		if (route && currentRoute !== route) {
			router.push(route)
			setTimeout(() => {
				tour.start()
				tour.show(stepIndex)
			}, 800)
		} else {
			tour.start()
			tour.show(stepIndex)
		}
	}

	// Start or resume the tour
	if (
		shouldResume &&
		startStepIndex > 0 &&
		startStepIndex < tour.steps.length
	) {
		resumeTourAtStep(startStepIndex, startRoute)
	} else {
		tour.start()
	}
}
