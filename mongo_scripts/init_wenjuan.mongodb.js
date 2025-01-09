const wenjuan = [
  {
    name: '手机品牌接受度调查问卷',
    version: 0,
    isPublish: false,
    draft: null,
    data: [
      {
        id: 'Kj8mN9pQ4rT2',
        type: 'SingleChoice',
        title: '您的年龄段是？',
        required: true,
        options: [
          { id: '7hL5kM3nP9xR', text: '18岁以下', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '2wX8cV4bN6mJ', text: '18-25岁', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '9tY5hG7fD3kL', text: '26-35岁', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '4qS8wP2mH6nB', text: '36-45岁', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '5jK9cL4vR8tX', text: '46岁以上', fill: { show: false, length: null, type: 'text', required: false } }
        ]
      },
      {
        id: 'Yw6hB2mV9nX4',
        type: 'MultiChoice',
        title: '您目前正在使用或曾经使用过哪些品牌的手机？（多选）',
        required: true,
        options: [
          { id: '3pQ7kR9mN5jH', text: '苹果 iPhone', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '8tL4wX6cB2vK', text: '华为', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '5nM9hG3fP7dR', text: '小米', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '2bJ6sW8qT4mX', text: 'OPPO', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '7vK3nL5pH9cR', text: 'vivo', fill: { show: false, length: null, type: 'text', required: false } },
          { id: '4tX8mB2wQ6jN', text: '其他', fill: { show: false, length: null, type: 'text', required: false } }
        ]
      },
      {
        id: 'Zx9cR4vT7mL2',
        type: 'ImageChoice',
        title: '以下新发布的手机外观设计，您最喜欢哪一款？',
        required: true,
        options: [
          { id: '6hN8pK4wM2xB', text: 'iPhone 15 Pro', image: 'phone1.jpg' },
          { id: '9qL5tR7bG3vX', text: '华为 Mate 60 Pro', image: 'phone2.jpg' },
          { id: '3jH6nP9cW4mK', text: '小米 14 Pro', image: 'phone3.jpg' }
        ]
      },
      {
        id: 'Hk7pL2nX5vB9',
        type: 'Rate',
        title: '您对目前使用的手机的整体满意度评分是？',
        required: true,
        minScore: 0,
        maxScore: 10,
        value: 0,
        step: 1,
        tips: [],
        customIcon: '',
        showLabels: true,
        minLabel: '不可能推荐',
        maxLabel: '一定推荐'
      },
      {
        id: 'Qw4mJ8tR6bN3',
        type: 'NPS',
        title: '您向朋友推荐您当前使用的手机品牌的可能性有多大？',
        required: true,
        minScore: 0,
        maxScore: 10,
        value: 0,
        tips: [],
        showLabels: true,
        minLabel: '不可能推荐',
        maxLabel: '一定推荐'
      },
      {
        id: 'Vp5kX2hL9cM7',
        type: 'FillBlank',
        title: '请分享一下您选择当前手机品牌的主要原因',
        multiMode: false,
        required: false,
        options: [{ id: '7mK4vF9pL23', required: false, placeholder: '请说出你的想法...' }]
      },
      {
        id: 'Bt3nR8wQ4jH6',
        type: 'FillBlank',
        title: '对于手机的以下几个方面，请分别说明您最看重的特点：',
        required: true,
        multiMode: true,
        options: [
          { id: '7mK4vX9pL2nB', text: '外观设计', required: true, placeholder: '请描述您期望的外观设计...' },
          { id: '5tG8cR3hW6qM', text: '性能配置', required: false, placeholder: '请描述您对性能的要求...' },
          { id: '2jN9bP5kT8xL', text: '拍照功能', required: false, placeholder: '请描述您对相机的需求...' }
        ]
      }
    ],
    settings: {
      showQuestionNumber: true,
      showProgress: true,
      showOnePerPage: true,
      allowMultiSubmit: false,
      timeLimit: 10,
      themeColor: '#1890ff',
      coverImage: '/c3/97/d9/c397d949-6028-4e98-9027-1b9ddf49ef0c.jpg',
      submitSuccessMessage: '感谢您参与本次手机品牌调查！',
      backgroundImage: '/a0/e8/3a/a0e83a2f-1b40-4b93-b325-89d68b496ef7.jpg'
    },
    logic: {
      conditions: [
        {
          fromLogicId: 'Yw6hB2mV9nX4',
          fromPortId: '3pQ7kR9mN5jH',
          toLogicId: 'Vp5kX2hL9cM7',
          toPortId: 'show',
          select: true
        }
      ]
    }
  }
]
const database = 'mpadmin'
use(database)

db.wenjuan.deleteMany({})
db.wenjuanVersion.deleteMany({})
db.wenjuan.insertMany(wenjuan)
