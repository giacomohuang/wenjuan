# 问卷系统数据结构说明

## qItems 数组结构

qItems 是一个数组，包含问卷中的所有题目。每个题目都是一个对象，具有以下基本属性：

```json
{
  "id": "string",         // 题目唯一标识
  "type": "string",       // 题目类型
  "title": "string",      // 题目标题
  "required": boolean,    // 是否必答
  "logic": {             // 逻辑跳转相关配置（可选）
    "x": number,         // 逻辑编辑器中的X坐标
    "y": number,         // 逻辑编辑器中的Y坐标
    "conditions": []     // 逻辑条件数组
  }
}
```

## 题目类型及特有属性

### 1. 填空题 (FillBlank)

```json
{
  "type": "FillBlank",
  "multiMode": boolean,      // 是否多项填空模式
  "options": [{
    "id": "string",
    "text": "string",       // 填空项说明文本（多项填空模式下）
    "placeholder": "string", // 填空框占位文本
    "required": boolean,     // 该项是否必填
    "maxLength": number,     // 最大字数限制（0表示不限制）
    "format": "string"       // 格式限制：text/number/email/url/idcard/phone
  }]
}
```

### 2. 单选题 (SingleChoice)

```json
{
  "type": "SingleChoice",
  "options": [{
    "id": "string",
    "text": "string",       // 选项文本
    "fill": {              // 选项后的填空配置（可选）
      "show": boolean,     // 是否显示填空
      "required": boolean, // 填空是否必填
      "length": number,    // 填空长度限制
      "type": "text"      // 填空类型
    }
  }]
}
```

### 3. 多选题 (MultiChoice)

```json
{
  "type": "MultiChoice",
  "minRange": number,       // 最少选择数量（0表示不限制）
  "maxRange": number,       // 最多选择数量（0表示不限制）
  "options": [{
    "id": "string",
    "text": "string",      // 选项文本
    "fill": {             // 选项后的填空配置（可选）
      "show": boolean,    // 是否显示填空
      "required": boolean,// 填空是否必填
      "length": number,   // 填空长度限制
      "type": "text"     // 填空类型
    }
  }]
}
```

### 4. 图片选择题 (ImageChoice)

```json
{
  "type": "ImageChoice",
  "options": [
    {
      "id": "string",
      "text": "string", // 选项文本
      "imageUrl": "string" // 图片URL
    }
  ]
}
```

### 5. 评分题 (Rate)

```json
{
  "type": "Rate",
  "minScore": number,      // 最低分值
  "maxScore": number,      // 最高分值
  "step": number,          // 评分步长（1或0.5）
  "showLabels": boolean,   // 是否显示极值标签
  "minLabel": "string",    // 最低分标签
  "maxLabel": "string",    // 最高分标签
  "customIcon": {          // 自定义图标（可选）
    "type": "string",
    "icon": "string"
  },
  "tips": [{              // 分值提示
    "score": number,
    "text": "string"
  }]
}
```

### 6. NPS题型 (NPS)

```json
{
  "type": "NPS",
  "minScore": number,      // 最低分值（通常为0）
  "maxScore": number,      // 最高分值（通常为10）
  "showLabels": boolean,   // 是否显示极值标签
  "minLabel": "string",    // 最低分标签
  "maxLabel": "string",    // 最高分标签
  "tips": [{              // 分值提示
    "score": number,
    "text": "string"
  }]
}
```

## 逻辑条件结构

用于定义题目间的逻辑关系：

```json
{
  "fromPortId": "string", // 源端口ID
  "toLogicId": "string", // 目标题目ID
  "toPortId": "string" // 目标端口ID
}
```

逻辑端口类型包括：

- 输入端口：jump（跳转）、show（显示）、hide（隐藏）
- 输出端口：show（显示时）、hide（隐藏时）、answered（已答）、unanswered（未答）
- 选项题的选项ID作为输出端口
- 评分题的分值范围ID作为输出端口

## 示例

一个包含填空题和单选题的简单问卷示例：

```json
{
  "qItems": [
    {
      "id": "q1",
      "type": "FillBlank",
      "title": "请输入您的姓名",
      "required": true,
      "multiMode": false,
      "options": [
        {
          "id": "f1",
          "placeholder": "请输入姓名",
          "maxLength": 20,
          "format": "text"
        }
      ]
    },
    {
      "id": "q2",
      "type": "SingleChoice",
      "title": "您的性别是？",
      "required": true,
      "options": [
        {
          "id": "opt1",
          "text": "男"
        },
        {
          "id": "opt2",
          "text": "女"
        }
      ],
      "logic": {
        "x": 100,
        "y": 200,
        "conditions": [
          {
            "fromPortId": "opt1",
            "toLogicId": "q3",
            "toPortId": "show"
          }
        ]
      }
    }
  ]
}
```
