<template>
  <a-spin size="small" :spinning="loading" class="loading" />
  <div v-for="(group, index) in permissions">
    <div class="group-title">
      <div class="title">{{ group.groupName }}</div>
      <a-checkbox v-model:checked="group.checkAll" :indeterminate="group.indeterminate" @change="onCheckAll($event, index)"> Check all </a-checkbox>
    </div>
    <a-checkbox-group v-model:value="group.checkedList" class="group" @change="onCheckOne(index)" :options="group.data">
      <template #label="{ label }">
        <span class="checkbox-item">{{ label }}</span>
      </template>
    </a-checkbox-group>
  </div>
  <a-button v-if="!loading" @click="calcPermissionBits">计算</a-button>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { ref, onMounted } from 'vue'
import API from '../../api/API'
// import { permission } from '../../api/permission'

let permissions = ref([])
const loading = ref(true)
let userPermissionBits = {}
const groupNames = { 1: '分组1', 2: '分组2', 3: '分组3' }

onMounted(async () => {
  // 获取用户拥有的所有权限，
  // 返回格式：{p1: '12123,p2:'1231231'}
  const uid = 1
  const userPData = await API.account.getPermissions(uid)
  const userPlist = getPermissionValues(userPData)
  console.log(userPlist)

  // 读所有权限点，重新组装成checkbox要求的格式
  const pData = await API.permission.getList()
  let index = -1
  let g = 0
  pData.forEach((item) => {
    if (item.groupId != g) {
      if (index >= 0) onCheckOne(index)
      permissions.value.push({ checkAll: false, indeterminate: false, checkedList: [], groupId: item.groupId, groupName: groupNames[item.groupId], data: [] })
      index++
      g = item.groupId
    }
    if (userPlist.has(BigInt(item.id))) {
      permissions.value[index].checkedList.push(item.id)
    }
    permissions.value[index].data.push({ value: item.id, label: item.name })
  })
  onCheckOne(index)
  loading.value = false
  // console.log(permissions.value)
})

const getAllPermissionId = (obj) => {
  let idValues = []
  function traverse(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'value') {
          idValues.push(obj[key])
        }
        if (typeof obj[key] === 'object') {
          traverse(obj[key])
        }
      }
    }
  }
  traverse(obj)
  return idValues
}

// const group = '1'
// userPermissionBits[group] = 1
// 全选
const onCheckAll = (e, index) => {
  permissions.value[index].checkedList = e.target.checked ? keyToArray(permissions.value[index].data, 'value') : []
  permissions.value[index].indeterminate = false
  permissions.value[index].checkAll = e.target.checked
}
// 选一个
const onCheckOne = (index) => {
  permissions.value[index].indeterminate = permissions.value[index].checkedList.length > 0 && permissions.value[index].checkedList.length < permissions.value[index].data.length
  permissions.value[index].checkAll = permissions.value[index].checkedList.length === permissions.value[index].data.length
}
// 获取某一组权限值对应的所有权限id
const getPermissionValues = (userPlist) => {
  let arr = new Set()
  for (const [key, value] of Object.entries(userPlist)) {
    let group = key.substring(1)

    let a = BigInt(value)
    let i = BigInt(0)

    while (true) {
      if (a >> i) {
        const result = (a >> i) & 1n
        if (result) arr.add(i + 1n + BigInt(group - 1) * 63n)
      } else {
        break
      }
      i++
    }
    console.log('i:', i)
  }
  console.log('arr', arr)
  return arr
}
// 根据勾选的权限计算位值
const calcPermissionBits = () => {
  let allChecked = []
  // 合并每个分组的checkedList
  permissions.value.forEach((data) => {
    allChecked = [...allChecked, ...data.checkedList]
  })
  // 遍历所有勾选的权限，进行位值计算
  userPermissionBits = {}
  allChecked.forEach((id) => {
    const idx = `p${Math.floor((id - 1) / 63) + 1}`
    let place = ((id - 1) % 63) + 1
    if (userPermissionBits[idx]) {
      userPermissionBits[idx] = userPermissionBits[idx] | (BigInt(1) << (BigInt(place) - BigInt(1)))
    } else {
      userPermissionBits[idx] = BigInt(1) << BigInt(place - 1)
    }
  })
  console.log(userPermissionBits)
}

// 获取json中指定键的值
const keyToArray = (json, key) => {
  return Object.keys(json).map((k) => json[k][key])
}
</script>

<style lang="scss" scoped>
.loading {
  position: absolute;
  margin: 20px;
}

.group-title {
  display: flex;
  align-items: center;
  margin: 12px 0 0 20px;
  .title {
    font-size: 16px;
    font-weight: 600;
    margin-right: 12px;
  }
}
.group {
  display: flex;
  margin: 10px 20px 20px 20px;
  :where(label) {
    width: 180px;
  }
}
</style>
