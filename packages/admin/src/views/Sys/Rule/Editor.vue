<template>
  <div class="rule-editor">
    <Rule v-model="ruleData" is-root />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Rule from './Rule.vue'
const ruleData = ref({
  operator: 'and',
  children: [
    {
      exp: {
        id: 1,
        field: 'name',
        operator: 'eq',
        value: '张三<br/>李四<br/>王五\nasdasd'
      }
    },
    {
      exp: {
        id: 2,
        field: 'age',
        operator: 'gt',
        value: 18
      }
    },
    {
      operator: 'or',
      children: [
        {
          exp: {
            id: 3,
            field: 'name',
            operator: 'eq',
            value: '张三'
          }
        },
        {
          exp: {
            id: 4,
            field: 'age',
            operator: 'gt',
            value: 18
          }
        },
        {
          operator: 'or',
          children: [
            {
              exp: {
                id: 3,
                field: 'name',
                operator: 'eq',
                value: '张三'
              }
            },
            {
              exp: {
                id: 4,
                field: 'age',
                operator: 'gt',
                value: 18
              }
            },
            {
              exp: {
                id: 4,
                field: 'age',
                operator: 'gt',
                value: 18
              }
            },
            {
              exp: {
                id: 4,
                field: 'age',
                operator: 'gt',
                value: 18
              }
            },
            {
              exp: {
                id: 4,
                field: 'age',
                operator: 'gt',
                value: 18
              }
            },
            {
              exp: {
                id: 4,
                field: 'age',
                operator: 'gt',
                value: 18
              }
            },
            {
              exp: {
                id: 4,
                field: 'age',
                operator: 'gt',
                value: ''
              }
            },
            {
              exp: {
                id: 4,
                field: 'age',
                operator: '',
                value: ''
              }
            }
          ]
        }
      ]
    }
  ]
})
</script>

<style scoped lang="scss">
.rule-editor {
  margin: 50px;
}
</style>
