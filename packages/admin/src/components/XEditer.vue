<template>
  <div>
    <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" :should-show="shouldShow" v-if="editor"
      class="toolbar">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }">
        <icon name="bold" />
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }">
        <icon name="italic" />
      </button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }">
        <icon name="underline" />
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }">
        <icon name="strike" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ active: editor.isActive({ textAlign: 'left' }) }">
        <icon name="align-left" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ active: editor.isActive({ textAlign: 'center' }) }">
        <icon name="align-center" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ active: editor.isActive({ textAlign: 'right' }) }">
        <icon name="align-right" />
      </button>
      <button @click="showImageUpload = true" :class="{ active: editor.isActive('image') }">
        <icon name="image" />
      </button>
      <button @click="setLink" :class="{ active: editor.isActive('link') }">
        <icon name="link" />
      </button>
    </bubble-menu>
    <editor-content :editor="editor" class="editor" />

    <!-- 图片上传对话框 -->
    <a-modal :open="showImageUpload" title="上传图片" @ok="handleImageUploadOk" @cancel="handleImageUploadCancel"
      :destroyOnClose="true">
      <Upload :type="['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']" :multiple="false" :max="1"
        @uploaded="handleImageUploaded"> 点击或拖拽图片到此处上传 </Upload>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { BubbleMenu, Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import ImageResize from 'tiptap-extension-resize-image'
import Link from '@tiptap/extension-link'
import Upload from './Upload.vue'

const props = defineProps(['modelValue', 'autofocus'])
const emits = defineEmits(['update:modelValue'])
const editor = ref(null)
const showImageUpload = ref(false)
const uploadedImageUrl = ref('')

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value.getHTML() === value
    if (isSame) {
      return
    }
    editor.value.commands.setContent(value, false)
  }
)

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    autofocus: props.autofocus || false,
    extensions: [
      StarterKit.configure({
        dropcursor: false,
        hardBreak: false,
        image: {
          HTMLAttributes: {
            class: 'resize-image'
          }
        }
      }),
      ImageResize.configure({
        // 配置图片调整大小的选项
        resizeDirections: ''
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow'
        }
      })
    ],
    onUpdate: () => {
      emits('update:modelValue', editor.value.getHTML())
    },
    onDrop: () => {
      return false
    },
    onPaste: (view, event) => {
      event.preventDefault()
      const text = event.clipboardData?.getData('text/plain')
      if (text) {
        view.dispatch(view.state.tr.insertText(text))
      }
      return true
    }
  })
})

const shouldShow = ({ editor, view, state, oldState, from, to }) => {
  return true
}

const handleImageUploaded = (fileInfo) => {
  console.log('handleImageUploaded', fileInfo)
  uploadedImageUrl.value = import.meta.env.VITE_UPLOAD_URL_PREFIX + fileInfo.name
}

const handleImageUploadOk = () => {
  console.log('handleImageUploadOk', uploadedImageUrl.value)
  if (uploadedImageUrl.value) {
    editor.value.chain().focus().setImage({ src: uploadedImageUrl.value }).run()
  }
  showImageUpload.value = false
  uploadedImageUrl.value = ''
}

const handleImageUploadCancel = () => {
  showImageUpload.value = false
  uploadedImageUrl.value = ''
}

const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  } else {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}
</script>
<style scoped lang="scss">
.toolbar {
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  background: var(--bg-0);
  // padding: 2px;
  box-shadow: 0px 4px 16px rgb(0 0 0 / 8%);
  display: flex;
  list-style-type: none;
}

button {
  background: var(--bg-0);
  border-radius: 8px;
  border: 0px;
  padding: 0px;

  .iconfont {
    font-size: 1.6em;
    color: var(--text-primary);
    opacity: 0.2;
    transition: all 0.15s ease;
  }

  &.active .iconfont {
    opacity: 1;
  }

  &:hover,
  &:active {
    cursor: pointer;

    .icon {
      opacity: 1;
    }
  }
}
</style>
<style lang="scss">
// .ProseMirror {
// word-break: break-all;
// word-wrap: break-word;
// border: 1px dashed #ffffff00;
// border-radius: 4px;
// &:hover {
//   border: 1px dashed #68cef8;
// }
// }
// .ProseMirror-focused {
//   &:hover {
//     border: 1px solid #68cef8;
//   }
//   width: 100%;
//   height: 100%;
//   left: 0;
//   top: 0;
//   z-index: 0;
//   border-radius: 4px;
//   border: 1px solid #68cef8;
// }

/* Basic editor styles */

.ProseMirror {
  p {
    line-height: 100%;
    word-break: break-all;
  }
}

//   > * + * {
//     margin-top: 0.75em;
//   }
//   ul,
//   ol {
//     padding: 0 1rem;
//   }
//   h1,
//   h2,
//   h3,
//   h4,
//   h5,
//   h6 {
//     line-height: 1.1;
//   }
//   code {
//     background-color: rgba(#616161, 0.1);
//     color: #616161;
//   }
//   pre {
//     background: #0d0d0d;
//     color: #fff;
//     font-family: 'JetBrainsMono', monospace;
//     padding: 0.75rem 1rem;
//     border-radius: 0.5rem;
//     code {
//       color: inherit;
//       padding: 0;
//       background: none;
//       font-size: 0.8rem;
//     }
//   }
//   img {
//     max-width: 100%;
//     height: auto;
//   }
//   blockquote {
//     padding-left: 1rem;
//     border-left: 2px solid rgba(#0d0d0d, 0.1);
//   }
//   hr {
//     border: none;
//     border-top: 2px solid rgba(#0d0d0d, 0.1);
//     margin: 2rem 0;
//   }
// }</style>
