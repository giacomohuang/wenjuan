<template>
  <div :style="{ height: props.height, width: props.width }">
    <!-- 图片预览区域 -->
    <div v-if="modelValue" class="preview-container">
      <img :src="prefixURL + modelValue" class="preview-image" @click.stop="handleSelectFiles" />
    </div>

    <!-- 上传区域 -->
    <div v-else class="dragarea" :class="{ over: state.dragover }" @click.stop="handleSelectFiles" @dragover.prevent @dragover.native="state.dragover = true" @dragleave.native="state.dragover = false" @drop="handleDropFiles">
      <div v-if="!modelValue">拖拽文件到此处或点击上传</div>

      <div class="progress" v-if="uploading">
        <a-progress type="line" :percent="files[0]?.percent" :width="20" :status="files[0]?.status" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CryptoJS from 'crypto-js'
import API from '../api/API'
import pLimit from 'p-limit'

const props = defineProps({
  // 允许的文件类型数组，例如 ['.jpg', '.png']
  type: {
    type: Array,
    default: () => ['jpg', 'png', 'jpeg', 'gif', 'bmp', 'webp']
  },
  modelValue: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '100px'
  },
  height: {
    type: String,
    default: '100px'
  }
})

const prefixURL = import.meta.env.VITE_UPLOAD_URL_PREFIX

const emit = defineEmits(['update:modelValue', 'uploaded'])

const state = reactive({
  dragover: false
})
const files = ref([])
const uploading = ref(false)

const calculatePartSize = (size) => {
  // 最大单个文件5TB
  const MAX_OBJECT_SIZE = 5 * 1024 * 1024 * 1024 * 1024
  // 默认分片64MB
  const DEFAULT_PARTSIZE = 64 * 1024 * 1024
  if (typeof size !== 'number') {
    throw new TypeError('size should be of type "number"')
  }
  if (size > MAX_OBJECT_SIZE) {
    throw new TypeError(`size should not be more than ${MAX_OBJECT_SIZE}`)
  }
  let partSize = DEFAULT_PARTSIZE
  for (;;) {
    // while(true) {...} throws linting error.
    // If partSize is big enough to accomodate the object size, then use it.
    if (partSize * 10000 > size) {
      return partSize
    }
    // Try part sizes as 64MB, 80MB, 96MB etc.
    partSize += 16 * 1024 * 1024
  }
}

const handleDropFiles = async (e) => {
  e.preventDefault()
  state.dragover = false

  const items = [...e.dataTransfer.items].filter((item) => item.kind === 'file')

  // 检查文件类型
  if (props.type.length > 0) {
    const invalidFiles = items.filter((item) => {
      const fileType = item.type.toLowerCase()
      const fileName = item.getAsFile().name.toLowerCase()
      return !props.type.some((type) => {
        const allowedType = type.toLowerCase()
        // 检查文件类型或文件扩展名
        return fileType.endsWith(allowedType.replace('.', '')) || fileName.endsWith(allowedType)
      })
    })
    if (invalidFiles.length > 0) {
      alert('存在不支持的文件类型')
      return
    }
  }

  // 检查文件数量
  if (items.length > props.max) {
    alert(`最多只能上传${props.max}个文件`)
    return
  }

  const fileHandlesPromises = items.map((item) => item.getAsFileSystemHandle())
  const handles = []
  for await (const handle of fileHandlesPromises) {
    if (handle.kind === 'file') {
      handles.push(handle)
    }
  }

  if (handles.length > 0) {
    await uploadFiles(handles)
  }
}

const handleSelectFiles = async () => {
  try {
    const pickerOptions = {
      multiple: false,
      types: [
        {
          description: 'Images',
          accept: {
            'image/*': ['.jpg', '.png', '.jpeg', '.gif', '.bmp', '.webp']
          }
        }
      ],
      excludeAcceptAllOption: true
    }

    const handles = await window.showOpenFilePicker(pickerOptions)

    await uploadFiles(handles)
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('文件选择错误:', err)
    }
  }
}

const uploadFiles = async (handles) => {
  files.value = []
  uploading.value = true
  const tasks = []
  const limit = pLimit(3)
  for (const [index, handle] of handles.entries()) {
    const file = await handle.getFile()
    const upload = await API.oss.initNewMultipartUpload(file.name)
    const { uploadId, newFilename, oldTags } = upload
    files.value.push({ originalName: file.name, name: newFilename, totalSize: file.size, percent: 0 })
    let chunkSize = calculatePartSize(file.size)
    const chunks = await chunkFile(file, chunkSize)
    const task = limit(async () => {
      await checksumSHA1(file, (loaded, total) => (files.value[index].checksumPercent = Math.round((loaded / total) * 100)))
      const result = await uploadParts(chunks, index, uploadId, oldTags)
      if (result) {
        // 上传成功后更新modelValue和触发事件
        emit('update:modelValue', newFilename)
        emit('uploaded', {
          originalName: file.name,
          name: newFilename,
          url: import.meta.env.VITE_UPLOAD_URL_PREFIX + newFilename
        })
      }
    })
    tasks.push(task)
  }
  await Promise.all(tasks).finally(() => {
    uploading.value = false
  })
}

const checksumSHA1 = async (file, onProgress, chunkSize = 5 * 1024 * 1024) => {
  let loaded = 0
  let sha256 = CryptoJS.algo.SHA1.create()
  const total = file.size
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    let partNumber = 0
    // 使用requestIdleCallback来确保UI线程不会被阻塞
    const processNextChunk = () => {
      if (loaded >= total) {
        resolve(sha256.finalize().toString())
        return
      }
      const start = loaded
      const end = Math.min(start + chunkSize, total)
      const chunk = file.slice(start, end)
      reader.onloadend = () => {
        const wordArray = CryptoJS.lib.WordArray.create(reader.result)
        sha256.update(wordArray)
        partNumber++
        loaded = end
        onProgress(loaded, total)
        requestIdleCallback(processNextChunk)
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(chunk)
    }
    requestIdleCallback(processNextChunk)
  })
}

const chunkFile = async (file, chunkSize = 5 * 1024 * 1024) => {
  const chunks = []
  let partNumber = 1
  let loaded = 0
  const total = file.size

  while (true) {
    const start = loaded
    const end = Math.min(start + chunkSize, total)
    const chunk = file.slice(start, end)
    chunks.push({ file: chunk, partNumber })
    partNumber++
    loaded = end
    if (loaded >= total) {
      return chunks
    }
  }
}

const uploadParts = async (chunks, fileIndex, uploadId, oldTags) => {
  console.log(chunks, fileIndex, uploadId, oldTags)
  let etags = new Array(chunks.length).fill(null)
  let uploaded = 0
  let chunksProgress = new Array(chunks.length).fill(0)

  const tasks = []
  const limit = pLimit(3)
  for (const [i, chunk] of chunks.entries()) {
    const formData = new FormData()
    const partNumber = chunk.partNumber
    if (i <= oldTags?.length) {
      etags[i] = matchingTag[i]
    } else {
      formData.append('file', chunk.file)
      formData.append('filename', encodeURIComponent(files.value[fileIndex].name))
      formData.append('uploadId', uploadId)
      formData.append('partNumber', partNumber)
      const task = limit(async () => {
        const etag = await API.oss
          .uploadPart(formData, (progress) => {
            chunksProgress[i] = progress
            uploaded = calcProgress(chunksProgress)
            if (uploaded > files.value[fileIndex].totalSize) uploaded = files.value[fileIndex].totalSize
            const percent = parseFloat(((uploaded / files.value[fileIndex].totalSize) * 100).toFixed())
            if (percent > files.value[fileIndex].percent) files.value[fileIndex].percent = percent
            console.log('fileidx', fileIndex, 'partNumber', partNumber, 'loaded:', uploaded, 'total:', files.value[fileIndex].totalSize, 'percent:', files.value[fileIndex].percent)
          })
          .catch((err) => {
            console.log(err)
            files.value[fileIndex].status = 'exception'
          })
        etags[i] = etag
      })
      tasks.push(task)
    }
  }
  await Promise.all(tasks)

  files.value[fileIndex].percent = 100
  console.log('100%', files.value[fileIndex].originalName)
  // console.log('&&&etags', JSON.stringify(etags));
  const resp = await API.oss.completeMultipartUpload(files.value[fileIndex].name, uploadId, etags).catch((err) => {
    console.log(err)
    files.value[fileIndex].status = 'exception'
  })
  return resp
  // console.log(resp);
}

const calcProgress = (chunksProgress) => {
  return chunksProgress.reduce((acc, val) => acc + val, 0)
}

// 处理移除图片
const handleRemove = () => {
  emit('update:modelValue', '')
}
</script>
<style lang="scss" scoped>
.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 4px;
  overflow: hidden;

  &:hover .preview-mask {
    opacity: 1;
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dragarea {
  height: 100%;
  width: 100%;
  // border-radius: 4px;
  padding: 12px;
  display: flex;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.main-wrap {
  padding: 20px 0 0 20px;
  display: block;
}
.dragarea {
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploadlist {
  list-style-type: none;
  color: var(--text-primary);
  li {
    padding: 12px;
  }
  li:nth-child(even) {
    background: var(--bg-main);
  }
}

.progress {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-label {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
