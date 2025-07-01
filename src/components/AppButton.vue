<template>
	<v-btn
		:type="type"
		:color="color"
		:variant="variant"
		:size="size"
		:block="block"
		:disabled="disabled"
		:loading="loading"
		:aria-label="ariaLabel"
		:class="buttonClass"
		@click="handleClick"
	>
		<v-icon v-if="prependIcon" :left="!!$slots.default" :aria-hidden="true">
			{{ prependIcon }}
		</v-icon>
		<slot></slot>
		<v-icon v-if="appendIcon" right :aria-hidden="true">
			{{ appendIcon }}
		</v-icon>
	</v-btn>
</template>

<script>
	export default {
		name: "AppButton",
		props: {
			type: {
				type: String,
				default: "button",
			},
			color: {
				type: String,
				default: "primary",
			},
			variant: {
				type: String,
				default: "elevated",
			},
			size: {
				type: String,
				default: "default",
			},
			block: {
				type: Boolean,
				default: false,
			},
			disabled: {
				type: Boolean,
				default: false,
			},
			loading: {
				type: Boolean,
				default: false,
			},
			prependIcon: {
				type: String,
				default: "",
			},
			appendIcon: {
				type: String,
				default: "",
			},
			ariaLabel: {
				type: String,
				default: "",
			},
			buttonClass: {
				type: String,
				default: "",
			},
		},
		emits: ["click"],
		methods: {
			handleClick(event) {
				if (!this.disabled && !this.loading) {
					this.$emit("click", event)
				}
			},
		},
	}
</script>
