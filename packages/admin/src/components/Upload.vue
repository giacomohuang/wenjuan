<template>
  <div class="main-wrap">
    <div>
      <div class="dragarea" :class="{ over: state.dragover }" @click="handleSelectFiles" @dragover.prevent @dragover.native="state.dragover = true" @dragleave.native="state.dragover = false" @drop="handleDropFiles">
        <div class="dd" v-if="files.length === 0">
          <slot>拖拽文件到此处或点击上传</slot>
        </div>
        <ul class="uploadlist">
          <li v-for="file in files" :key="file.name">
            <div class="filename">{{ file.originalName }}</div>
            <div style="display: flex; flex-direction: row; align-items: center">
              <div style="font-size: 12px; padding-right: 8px">SHA1:</div>
              <div class="progress"><a-progress :percent="file.checksumPercent" size="small" :steps="10" /></div>
              <div class="progress" style="width: 60%"><a-progress :percent="file.percent" size="small" :status="file.status" /></div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import CryptoJS from 'crypto-js'
import API from '../api/API'
import pLimit from 'p-limit'

const props = defineProps({
  // 允许的文件类型数组，例如 ['.jpg', '.png']
  type: {
    type: Array,
    default: () => []
  },
  // 是否允许多文件上传
  multiple: {
    type: Boolean,
    default: false
  },
  // 最大上传数量
  max: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['uploaded'])

const state = reactive({
  dragover: false
})
const files = ref([])

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
      multiple: props.multiple
    }

    // 如果��置了文件类型限制
    if (props.type.length > 0) {
      // 根据文件扩展名推断MIME类型
      const mimeTypes = {
        // 图片
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        // 文档
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // 文本
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.xml': 'application/xml',
        // 压缩文件
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.7z': 'application/x-7z-compressed',
        // 音频
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        // 视频
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.avi': 'video/x-msvideo'
      }

      // 根据扩展名分组文件类型
      const typeGroups = {}
      props.type.forEach((ext) => {
        const mime = mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
        const baseType = mime.split('/')[0]
        if (!typeGroups[baseType]) {
          typeGroups[baseType] = {
            extensions: [],
            mimes: new Set()
          }
        }
        typeGroups[baseType].extensions.push(ext)
        typeGroups[baseType].mimes.add(mime)
      })

      // 构建文件选择器的类型配置
      pickerOptions.types = Object.entries(typeGroups).map(([baseType, group]) => {
        const accept = {}
        Array.from(group.mimes).forEach((mime) => {
          accept[mime] = group.extensions
        })
        return {
          description: `${baseType.charAt(0).toUpperCase() + baseType.slice(1)} files`,
          accept
        }
      })

      pickerOptions.excludeAcceptAllOption = true
    }

    const handles = await window.showOpenFilePicker(pickerOptions)

    // 检查文件数量限制
    if (handles.length > props.max) {
      alert(`最多只能上传${props.max}个文件`)
      return
    }

    await uploadFiles(handles)
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('文件选择错误:', err)
    }
  }
}

const uploadFiles = async (handles) => {
  files.value = []
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
      // 上传完成后触发事件
      if (result) {
        emit('uploaded', {
          originalName: file.name,
          name: newFilename
        })
      }
    })
    tasks.push(task)
  }
  await Promise.all(tasks)
}

const checksumSHA1 = async (file, onProgress, chunkSize = 5 * 1024 * 1024) => {
  const chunks = []
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

// function hexToBase64(hexStr) {
//   const bytes = new Uint8Array(hexStr.length / 2)
//   for (let i = 0; i < hexStr.length; i += 2) {
//     bytes[i / 2] = parseInt(hexStr.substr(i, 2), 16)
//   }
//   return btoa(String.fromCharCode.apply(null, bytes))
// }

// async function chunkFileMD5(file, chunkSize = 5 * 1024 * 1024, updateProgress) {
//   const chunks = []
//   const spark = new SparkMD5.ArrayBuffer()
//   let loaded = 0
//   const total = file.size
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     let partNumber = 0
//     // 使用requestIdleCallback来确保UI线程不会被阻塞
//     const processNextChunk = () => {
//       if (loaded >= total) {
//         resolve(chunks)
//         return
//       }

//       const start = loaded
//       const end = Math.min(start + chunkSize, total)
//       const chunk = file.slice(start, end)

//       reader.onloadend = () => {
//         spark.append(reader.result)
//         const hash = hexToBase64(spark.end())
//         chunks.push({ file: chunk, hash, partNumber })
//         partNumber++
//         loaded = end
//         updateProgress(loaded / total)
//         requestIdleCallback(processNextChunk)
//       }

//       reader.onerror = reject
//       reader.readAsArrayBuffer(chunk)
//     }
//     requestIdleCallback(processNextChunk)
//   })
// }
</script>
<style lang="scss" scoped>
.main-wrap {
  padding: 20px 0 0 20px;
  display: block;
}
.dragarea {
  // background-color: var(--bg-list-striped);
  height: fit-content;
  width: 400px;
  // padding: 20px;
  border-radius: 5px;
  border: 1px solid var(--border-medium);
  margin-top: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
  cursor: pointer;
}
.dd {
  margin: 20px;
  cursor: pointer;
}

.over {
  background-color: var(--bg-main);
  border: 1px dashed var(--border-medium);
  transition: all 0.2s;
  color: var(--text-primary);
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
</style>
