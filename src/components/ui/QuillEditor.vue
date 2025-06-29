<template>
  <div class="quill-editor-wrapper">
    <div
      ref="quillEditor"
      :id="editorId"
      :style="editorStyle"
      class="quill-editor"
    ></div>
  </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default {
  name: 'QuillEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Write your content here...'
    },
    toolbar: {
      type: [Array, Boolean],
      default: () => [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['clean']
      ]
    },
    theme: {
      type: String,
      default: 'snow'
    },
    minHeight: {
      type: String,
      default: '200px'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'text-change', 'selection-change'],
  data() {
    return {
      quill: null,
      internalValue: this.modelValue
    }
  },
  computed: {
    editorId() {
      return `quill-editor-${this._uid || Math.random().toString(36).substr(2, 9)}`
    },
    editorStyle() {
      return {
        minHeight: this.minHeight,
        border: '1px solid #ccc',
        borderRadius: '4px'
      }
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal !== this.internalValue) {
        this.internalValue = newVal
        if (this.quill) {
          this.quill.root.innerHTML = newVal || ''
        }
      }
    },
    disabled(newVal) {
      if (this.quill) {
        this.quill.enable(!newVal)
      }
    }
  },
  mounted() {
    this.initQuill()
  },
  beforeUnmount() {
    this.destroyQuill()
  },
  methods: {
    initQuill() {
      if (!this.$refs.quillEditor) return

      // Clear any existing content
      this.$refs.quillEditor.innerHTML = ''
      this.$refs.quillEditor.className = 'quill-editor'

      this.quill = new Quill(this.$refs.quillEditor, {
        theme: this.theme,
        placeholder: this.placeholder,
        modules: {
          toolbar: this.toolbar
        }
      })

      // Set initial content
      this.quill.root.innerHTML = this.internalValue || ''

      // Disable if needed
      if (this.disabled) {
        this.quill.enable(false)
      }

      // Listen for content changes
      this.quill.on('text-change', () => {
        const html = this.quill.root.innerHTML
        this.internalValue = html
        this.$emit('update:modelValue', html)
        this.$emit('text-change', html)
      })

      // Listen for selection changes
      this.quill.on('selection-change', (range, oldRange, source) => {
        this.$emit('selection-change', range, oldRange, source)
      })
    },

    destroyQuill() {
      if (this.quill) {
        // Save content before destroying
        const html = this.quill.root.innerHTML
        this.internalValue = html
        this.$emit('update:modelValue', html)

        // Remove event listeners
        this.quill.off('text-change')
        this.quill.off('selection-change')

        // Destroy instance
        this.quill = null
      }

      // Clean container
      if (this.$refs.quillEditor) {
        this.$refs.quillEditor.innerHTML = ''
        this.$refs.quillEditor.className = 'quill-editor'
      }
    },

    focus() {
      if (this.quill) {
        this.quill.focus()
      }
    },

    blur() {
      if (this.quill) {
        this.quill.blur()
      }
    },

    getQuill() {
      return this.quill
    }
  }
}
</script>

<style scoped>
.quill-editor-wrapper {
  position: relative;
}

:deep(.ql-editor) {
  min-height: v-bind(minHeight);
  font-size: 16px;
  line-height: 1.6;
}

:deep(.ql-toolbar) {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

:deep(.ql-container) {
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
}

/* Hide duplicate toolbars */
:deep(.ql-toolbar:not(:first-child)) {
  display: none !important;
}

/* Prevent multiple containers */
:deep(.ql-container:not(:last-child)) {
  display: none !important;
}
</style>
