import { createI18n } from "vue-i18n"
import en from "./en.json"
import vi from "./vi.json"

// Get saved language from localStorage or default to English
const getSavedLanguage = () => {
	const saved = localStorage.getItem("codefolio-language")
	return saved || "en"
}

// Save language preference to localStorage
const saveLanguage = locale => {
	localStorage.setItem("codefolio-language", locale)
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
