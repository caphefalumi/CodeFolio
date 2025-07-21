import { createRouter, createWebHistory } from "vue-router"
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
		path: "/admin",
		name: "Admin",
		component: () => import("@/views/Admin.vue"),
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
		path: "/:pathMatch(.*)*",
		name: "CatchAll",
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
	} else {
		next()
	}
})

export default router
