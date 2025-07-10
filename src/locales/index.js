import { createI18n } from "vue-i18n"
import en from "./en.json"
import vi from "./vi.json"

const getSavedLanguage = () => {
	return localStorage.getItem("lang")
}

// Save language preference to localStorage
const saveLanguage = locale => {
	localStorage.setItem("lang", locale)
}

const i18n = createI18n({
	legacy: false,
	locale: getSavedLanguage(),
	fallbackLocale: "en",
	messages: {
		en,
		vi,
	},
})

// Export helper functions
export { saveLanguage, getSavedLanguage }
export default i18n
