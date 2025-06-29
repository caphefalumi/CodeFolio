<template>
  <v-dialog
    v-model="isOpen"
    :max-width="maxWidth"
    :fullscreen="fullscreen"
    :scrollable="scrollable"
    :transition="transition"
    :persistent="persistent"
  >
    <v-card :class="cardClass">
      <v-toolbar
        v-if="showToolbar"
        :color="toolbarColor"
        dark
        flat
      >
        <v-toolbar-title :id="titleId">
          {{ title }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          v-if="showCloseButton"
          icon
          @click="close"
          :aria-label="closeAriaLabel"
        >
          <v-icon aria-hidden="true">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text v-if="hasDefaultSlot" :class="contentClass">
        <slot></slot>
      </v-card-text>

      <v-card-actions v-if="hasActionsSlot" :class="actionsClass">
        <slot name="actions"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AppDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    maxWidth: {
      type: [String, Number],
      default: '500'
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    transition: {
      type: String,
      default: 'dialog-transition'
    },
    persistent: {
      type: Boolean,
      default: false
    },
    toolbarColor: {
      type: String,
      default: 'primary'
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    closeAriaLabel: {
      type: String,
      default: 'Close dialog'
    },
    cardClass: {
      type: String,
      default: ''
    },
    contentClass: {
      type: String,
      default: ''
    },
    actionsClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'close'],
  computed: {
    isOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    titleId() {
      return `dialog-title-${this.title.toLowerCase().replace(/\s+/g, '-')}`
    },
    hasDefaultSlot() {
      return !!this.$slots.default
    },
    hasActionsSlot() {
      return !!this.$slots.actions
    }
  },
  methods: {
    close() {
      this.isOpen = false
      this.$emit('close')
    }
  }
}
</script>
