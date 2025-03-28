<template>
  <div class="main-wrap">
    <div class="rule-editor">
      <a-button type="primary" @click="addRule" style="width: 100px">添加规则</a-button>
      <div v-for="(rule, index) in ruleData" :key="rule.id" class="rule-item">
        <a-select class="card-select" v-model:value="rule.cardFrom" :options="cardOptions" :dropdownMatchSelectWidth="false" />
        <span> - </span>
        <a-select class="card-select" v-model:value="rule.cardTo" :options="cardOptions.filter((item) => item.value !== rule.cardFrom)" :dropdownMatchSelectWidth="false" />
        <Rule :model-value="rule.rules" @update:model-value="updateRule(index, $event)" is-root />
        <icon name="add" class="ico-add-prev" @click="addRule(index, 'prev')"></icon>
        <icon name="add" class="ico-add-next" @click="addRule(index, 'next')"></icon>
        <icon name="remove" class="ico-remove" @click="deleteRule(index)"></icon>
      </div>
    </div>
    <div class="data-preview">
      <pre><code class="json">{{ ruleData }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Rule from './Rule.vue'
import { nanoid } from 'nanoid'
import '@/assets/icons.scss'

const cardOptions = [
  { label: '任意卡级', value: '-1' },
  { label: '普卡', value: '1' },
  { label: '金卡', value: '2' },
  { label: '白金卡', value: '3' },
  { label: '钻石卡', value: '4' },
  { label: '黑卡', value: '5' },
  { label: '至尊卡', value: '6' }
]

const ruleData = ref([
  {
    id: nanoid(),
    cardFrom: '-1',
    cardTo: '1',
    rules: {
      exp: {
        id: nanoid(),
        type: 'Consumption',
        field: 'daily_consumption',
        merchantRange: 'Include',
        operator: 'gt',
        floors: ['a700', 'a600'],
        categories: ['R1001', 'F2001'],
        merchants: ['M100', 'M101', 'M023', 'M110'],
        value: 100
      }
    }
  },
  {
    id: nanoid(),
    cardFrom: '-1',
    cardTo: '2',
    rules: {
      exp: {
        id: nanoid(),
        type: 'Consumption',
        merchantRange: 'Include',
        field: 'daily_consumption',
        operator: 'gt',
        floors: ['a700', 'a600'],
        categories: ['R1001', 'F2001'],
        merchants: ['M100', 'M101', 'M023', 'M110', 'M078', 'M107', 'M118', 'M128', 'M127', 'M044', 'M001', 'M111', 'M114'],
        value: 100
      }
    }
  }
])

const addRule = (index, type) => {
  const defaultRule = {
    id: nanoid(),
    cardFrom: '-1',
    cardTo: '2',
    rules: {
      exp: {
        id: nanoid(),
        type: 'Consumption',
        field: 'daily_consumption',
        operator: 'gt',
        floors: [],
        categories: [],
        merchants: [],
        value: null
      }
    }
  }
  if (index === undefined || type === undefined) {
    ruleData.value.push(defaultRule)
  } else {
    if (type === 'prev') {
      ruleData.value.splice(index, 0, defaultRule)
    } else {
      ruleData.value.splice(index + 1, 0, defaultRule)
    }
  }
}

const deleteRule = (index) => {
  ruleData.value.splice(index, 1)
}

const updateRule = (index, newValue) => {
  ruleData.value[index].rules = newValue
  console.log(ruleData.value)
}
</script>

<style scoped lang="scss">
.main-wrap {
  padding: 20px;
  display: flex;
  flex-direction: row;
  gap: 30px;
}
.rule-editor {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 30px;
}

.rule-item {
  position: relative;
  border: 1px solid var(--border-medium);
  padding: 20px;
  background-color: var(--bg-primary);
  border-radius: 10px;
  &:hover {
    .ico-remove,
    .ico-add-prev,
    .ico-add-next {
      opacity: 1;
    }
  }
}
.data-preview {
  width: 500px;
  background-color: var(--bg-primary);
  padding: 20px;
  border: 1px solid var(--border-medium);
  border-radius: 10px;
}

.ico-remove,
.ico-add-prev,
.ico-add-next {
  opacity: 0;
  position: absolute;
  height: 25px;
  width: 25px;
  padding: 2px;
  background: var(--bg-primary);
  border: 1px solid var(--c-brand);
  border-radius: 50%;
  cursor: pointer;
  color: var(--c-brand);
  transform: scale(0.8);
  transition: all 0.15s ease;
  &:hover {
    border-color: var(--c-red);
    color: var(--c-red);
    transform: scale(1.1) !important;
  }
}

.ico-add-prev {
  top: -11px;
  left: 25px;
}

.ico-add-next {
  bottom: -11px;
  left: 25px;
}
.ico-remove {
  top: calc(50% - 12.5px);
  right: -25px;
}
</style>
