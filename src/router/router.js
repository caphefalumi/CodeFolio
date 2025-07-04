import { createRouter, createWebHistory } from "vue-router"
import { fetchCurrentUser } from "@/composables/user.js"
const routes = [
	{
		path: "/",
		name: "Home",
		component: () => import("@/views/Home.vue"),
	},
	{
		path: "/projects",
		name: "Projects",
		component: () => import("@/views/Projects.vue"),
	},
	{
		path: "/:username",
		name: "Profile",
		component: () => import("@/views/Profile.vue"),
	},
	{
		path: "/:username/:id",
		name: "ProjectDetail",
		component: () => import("@/views/ProjectDetail.vue"),
	},
	{
		path: "/login",
		name: "Login",
		component: () => import("@/views/Login.vue"),
		meta: { requiresGuest: true },
	},
	{
		path: "/register",
		name: "Register",
		component: () => import("@/views/Register.vue"),
		meta: { requiresGuest: true },
	},
	{
		path: "/admin",
		name: "Admin",
		component: () => import("@/views/Admin.vue"),
		meta: { requiresAdmin: true },
	},

	{
		path: "/404",
		name: "NotFound",
		component: () => import("@/views/NotFound.vue"),
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
	const isAuthenticated = sessionStorage.getItem("accessToken")

	if (to.path === "/callback") {
		next("/")
	}
	// If route requires guest (login/register) and user is authenticated
	else if (to.meta.requiresGuest && isAuthenticated) {
		next("/")
	}	// If route requires admin
	else if (to.meta.requiresAdmin) {
		if (!isAuthenticated) {
			next("/404")
			return
		}

		fetchCurrentUser()
			.then((currentUser) => {
				if (!currentUser) {
					next("/404")
					return
				}

				// Check if the current user is an admin
				const isAdmin = currentUser.email === import.meta.env.VITE_ADMIN_EMAIL

				if (isAdmin) {
					next()
				} else {
					next("/404")
				}
			})
			.catch((error) => {
				console.error("Error fetching current user:", error)
				next("/404")
			})
	} else {
		next()
	}
})

export default router
