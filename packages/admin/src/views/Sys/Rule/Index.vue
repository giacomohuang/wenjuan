<template>
  <div class="rule-page">
    <h1>逻辑规则编辑器</h1>

    <a-card title="规则示例" style="margin-bottom: 20px">
      <a-form layout="vertical">
        <a-form-item label="规则名称">
          <a-input v-model:value="ruleName" placeholder="请输入规则名称" />
        </a-form-item>
      </a-form>

      <div class="rule-editor">
        <h3>条件设置</h3>
        <logic-editor v-model="ruleData" ref="logicEditor">
          <template #condition="{ condition, updateCondition }">
            <a-card size="small" title="条件配置">
              <a-form layout="vertical">
                <a-form-item label="字段">
                  <a-select v-model:value="condition.field" style="width: 100%" placeholder="请选择字段" @change="(val) => updateFieldCondition(condition, val, 'field', updateCondition)">
                    <a-select-option value="name">名称</a-select-option>
                    <a-select-option value="age">年龄</a-select-option>
                    <a-select-option value="gender">性别</a-select-option>
                    <a-select-option value="city">城市</a-select-option>
                  </a-select>
                </a-form-item>

                <a-form-item label="操作符" v-if="condition.field">
                  <a-select v-model:value="condition.operator" style="width: 100%" placeholder="请选择操作符" @change="(val) => updateFieldCondition(condition, val, 'operator', updateCondition)">
                    <a-select-option value="eq">等于</a-select-option>
                    <a-select-option value="ne">不等于</a-select-option>
                    <a-select-option value="gt">大于</a-select-option>
                    <a-select-option value="lt">小于</a-select-option>
                    <a-select-option value="in">包含于</a-select-option>
                    <a-select-option value="nin">不包含于</a-select-option>
                  </a-select>
                </a-form-item>

                <a-form-item label="值" v-if="condition.field && condition.operator">
                  <!-- 根据字段类型显示不同的输入控件 -->
                  <template v-if="condition.field === 'name' || condition.field === 'city'">
                    <a-input v-model:value="condition.value" placeholder="请输入值" @change="(e) => updateFieldCondition(condition, e.target.value, 'value', updateCondition)" />
                  </template>

                  <template v-else-if="condition.field === 'age'">
                    <a-input-number v-model:value="condition.value" style="width: 100%" placeholder="请输入年龄" @change="(val) => updateFieldCondition(condition, val, 'value', updateCondition)" />
                  </template>

                  <template v-else-if="condition.field === 'gender'">
                    <a-radio-group v-model:value="condition.value" @change="(e) => updateFieldCondition(condition, e.target.value, 'value', updateCondition)">
                      <a-radio value="male">男</a-radio>
                      <a-radio value="female">女</a-radio>
                    </a-radio-group>
                  </template>
                </a-form-item>
              </a-form>
            </a-card>
          </template>
        </logic-editor>
      </div>

      <div class="rule-actions">
        <a-space>
          <a-button type="primary" @click="saveRule">保存规则</a-button>
          <a-button @click="resetRule">重置</a-button>
        </a-space>
      </div>
    </a-card>

    <a-card title="规则数据预览">
      <pre>{{ JSON.stringify(ruleData, null, 2) }}</pre>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LogicEditor from '../../../components/LogicEditor.vue'

// 规则名称
const ruleName = ref('')

// 规则逻辑数据
const ruleData = ref({
  operator: 'and',
  children: []
})

// 逻辑编辑器引用
const logicEditor = ref(null)

// 更新条件字段
const updateFieldCondition = (condition, value, field, updateFn) => {
  const newCondition = { ...condition }
  newCondition[field] = value
  updateFn(newCondition)
}

// 保存规则
const saveRule = () => {
  console.log('保存规则:', {
    name: ruleName.value,
    condition: ruleData.value
  })
}

// 重置规则
const resetRule = () => {
  ruleName.value = ''
  ruleData.value = {
    operator: 'and',
    children: []
  }
}
</script>

<style scoped lang="scss">
.rule-page {
  padding: 20px;

  h1 {
    margin-bottom: 20px;
  }

  .rule-editor {
    margin-bottom: 20px;
  }

  .rule-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
