<template>
  <div class="rule-editor">
    <Rule v-model="ruleData" is-root />
  </div>
  <div>
    <pre>{{ ruleData }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Rule from './Rule.vue'
import { nanoid } from 'nanoid'
// const ruleData = ref({
//   exp: {
//     id: nanoid(),
//     type: 'MPSelect',
//     field: 'aaa',
//     operator: 'eq'
//   }
// })
const ruleData = ref({
  operator: 'and',
  children: [
    {
      exp: {
        id: nanoid(),
        type: 'MPSelect',
        field: 'aaa',
        operator: 'eq'
      }
    },
    {
      exp: {
        id: nanoid(),
        type: 'MPRange',
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
            id: nanoid(),
            type: 'MPSelect',
            field: 'name',
            operator: 'neq',
            value: '张三'
          }
        },
        {
          exp: {
            id: nanoid(),
            type: 'MPSelect'
          }
        },
        {
          operator: 'or',
          children: [
            {
              exp: {
                id: nanoid(),
                type: 'MPSelect'
              }
            },
            {
              exp: {
                type: 'MPRange',
                range: 'range1',
                id: nanoid(),
                field: 'age',
                operator: 'gt',
                value: 18
              }
            },
            {
              exp: {
                type: 'MPRange',
                range: null
              }
            },
            {
              exp: {
                id: nanoid(),
                type: 'MPSelect'
              }
            },
            {
              exp: {
                id: nanoid(),
                type: 'MPSelect'
              }
            },
            {
              exp: {
                id: nanoid(),
                type: 'MPSelect'
              }
            },
            {
              exp: {
                id: nanoid(),
                type: 'MPSelect'
              }
            },
            {
              exp: {
                id: nanoid(),
                type: 'MPSelect'
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
