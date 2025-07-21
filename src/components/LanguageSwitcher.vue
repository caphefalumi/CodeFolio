<template>
	<v-menu offset-y>
		<template #activator="{ props }">
			<v-tooltip text="Select language" location="bottom">
				<template #activator="{ props: tooltipProps }">
					<v-btn
						v-bind="{ ...props, ...tooltipProps }"
						variant="text"
						icon
						id="tour-step-language-switcher"
						:aria-label="$t('selectLanguage')"
					>
						<v-icon>mdi-translate</v-icon>
					</v-btn>
				</template>
			</v-tooltip>
		</template>

		<v-list min-width="150">
			<v-list-item
				v-for="language in languages"
				:key="language.code"
				@click="changeLanguage(language.code)"
			>
				<template #prepend>
					<v-icon>{{ language.icon }}</v-icon>
				</template>
				<v-list-item-title>{{ language.nameKey }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script>
	import { useI18n } from "vue-i18n"
	import { saveLanguage } from "@/locales"

	export default {
		name: "LanguageSwitcher",
		setup() {
			const { locale, t } = useI18n()
			const languages = [
				{
					code: "en",
					nameKey: "English",
					icon: "mdi-flag",
				},
				{
					code: "vi",
					nameKey: "Tiếng Việt",
					icon: "mdi-flag",
				},
			]

			const changeLanguage = langCode => {
				locale.value = langCode
				saveLanguage(langCode)
			}

			return {
				languages,
				currentLanguage: locale,
				changeLanguage,
				t,
			}
		},
	}
</script>

<style scoped>
	.v-list-item--active {
		background-color: var(--v-theme-primary);
		color: white;
	}
</style>
