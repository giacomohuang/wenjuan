const roles = [
  {
    id: 1,
    name: {
      'zh-CN': '超级管理员',
      'zh-HK': '超級管理員',
      en: 'Super Admin',
      ja: 'スーパー管理者',
      ko: '슈퍼 관리자',
      ar: 'مشرف متميز'
    },
    description: {
      'zh-CN': '超级管理员',
      'zh-HK': '超級管理員',
      en: 'Super Administrator',
      ja: 'スーパー管理者',
      ko: '슈퍼 관리자',
      ar: 'مشرف متميز'
    },
    resources: [1, 2, 3, 4, 5, 6],
    pid: null,
    path: '1',
    order: 1,
    status: 1
  },
  {
    id: 2,
    name: {
      'zh-CN': '普通用户',
      'zh-HK': '普通用戶',
      en: 'Regular User',
      ja: '一般ユーザー',
      ko: '일반 사용자',
      ar: 'مستخدم عادي'
    },
    description: {
      'zh-CN': '普通用户',
      'zh-HK': '普通用戶',
      en: 'Regular User',
      ja: '一般ユーザー',
      ko: '일반 사용자',
      ar: 'مستخدم عادي'
    },
    resources: [1, 2],
    pid: null,
    path: '2',
    order: 2,
    status: 1
  },
  {
    id: 3,
    name: {
      'zh-CN': '内容管理员',
      'zh-HK': '內容管理員',
      en: 'Content Manager',
      ja: 'コンテンツマネージャー',
      ko: '콘텐츠 관리자',
      ar: 'مدير المحتوى'
    },
    description: {
      'zh-CN': '负责管理所有内容相关事务',
      'zh-HK': '負責管理所有內容相關事務',
      en: 'Responsible for managing all content-related affairs',
      ja: 'コンテンツに関連するすべての事務を管理する',
      ko: '모든 콘텐츠 관련 사무를 관리하는 책임',
      ar: 'مسؤول عن إدارة جميع الأمور المتعلقة بالمحتوى'
    },
    resources: [1, 2, 3, 4],
    pid: null,
    path: '3',
    order: 3,
    status: 1
  },
  {
    id: 4,
    name: {
      'zh-CN': '高级编辑',
      'zh-HK': '高級編輯',
      en: 'Senior Editor',
      ja: 'シニアエディター',
      ko: '고급 편집자',
      ar: 'محرر عالي'
    },
    description: {
      'zh-CN': '负责审核和管理内容',
      'zh-HK': '負責審核和管理內容',
      en: 'Responsible for reviewing and managing content',
      ja: 'コンテンツをレビューし、管理する',
      ko: '콘텐츠를 검토하고 관리하는 책임',
      ar: 'مسؤول عن مراجعة وإدارة المحتوى'
    },
    resources: [1, 2, 3, 4],
    path: '3-4',
    pid: 3,
    order: 4,
    status: 1
  },
  {
    id: 5,
    name: {
      'zh-CN': '初级编辑',
      'zh-HK': '初級編輯',
      en: 'Junior Editor',
      ja: 'ジュニアエディター',
      ko: '초급 편집자',
      ar: 'محرر جديد'
    },
    description: {
      'zh-CN': '负责创建和编辑内容',
      'zh-HK': '負責創建和編輯內容',
      en: 'Responsible for creating and editing content',
      ja: 'コンテンツを作成し、編集する',
      ko: '콘텐츠를 만들고 편집하는 책임',
      ar: 'مسؤول عن إنشاء وتحرير المحتوى'
    },
    resources: [1, 2, 3],
    pid: 3,
    path: '3-5',
    order: 1,
    status: 1
  },
  {
    id: 6,
    name: {
      'zh-CN': '财务主管',
      'zh-HK': '財務主管',
      en: 'Financial Manager',
      ja: '財務管理責任者',
      ko: '재무 관리 책임자',
      ar: 'مدير المالي'
    },
    description: {
      'zh-CN': '负责所有财务相关操作',
      'zh-HK': '負責所有財務相關操作',
      en: 'Responsible for all financial-related operations',
      ja: 'すべての財務に関連する操作を管理する',
      ko: '모든 재무 관련 작업을 관리하는 책임',
      ar: 'مسؤول عن جميع العمليات المالية المتعلقة'
    },
    resources: [1, 2, 3, 4, 5],
    pid: null,
    path: '6',
    order: 4,
    status: 1
  },
  {
    id: 7,
    name: {
      'zh-CN': '会计',
      'zh-HK': '會計',
      en: 'Accountant',
      ja: '会計',
      ko: '회계',
      ar: 'محاسب'
    },
    description: {
      'zh-CN': '负责日常财务记录和报告',
      'zh-HK': '負責日常財務記錄和報告',
      en: 'Responsible for daily financial recording and reporting',
      ja: '日常的な財務記錄と報告を管理する',
      ko: '일일 재무 기록과 보고를 관리하는 책임',
      ar: 'مسؤول عن تسجيل المالي اليومي وإعداد التقارير'
    },
    resources: [1, 2, 3, 4],
    pid: 6,
    path: '6-7',
    order: 1,
    status: 1
  },
  {
    id: 8,
    name: {
      'zh-CN': '客户服务经理',
      'zh-HK': '客戶服務經理',
      en: 'Customer Service Manager',
      ja: 'カスタマーサービスマネージャー',
      ko: '고객 서비스 관리자',
      ar: 'مدير خدمة العملاء'
    },
    description: {
      'zh-CN': '管理客户服务团队',
      'zh-HK': '管理客戶服務團隊',
      en: 'Responsible for managing the customer service team',
      ja: 'カスタマーサービスチームを管理する',
      ko: '고객 서비스 팀을 관리하는 책임',
      ar: 'مسؤول عن إدارة فريق خدمة العملاء'
    },
    resources: [1, 2],
    pid: null,
    path: '8',
    order: 5,
    status: 1
  },
  {
    id: 9,
    name: {
      'zh-CN': '客户服务代表',
      'zh-HK': '客戶服務代表',
      en: 'Customer Service Representative',
      ja: 'カスタマーサービスレポート',
      ko: '고객 서비스 대표',
      ar: 'ممثل خدمة العملاء'
    },
    description: {
      'zh-CN': '处理客户查询和问题',
      'zh-HK': '處理客戶查詢和問題',
      en: 'Responsible for handling customer queries and issues',
      ja: 'カスタマーサービスに関する顧客の質問と問題を処理する',
      ko: '고객의 문의와 문제를 처리하는 책임',
      ar: 'مسؤول عن معالجة الأسئلة والمشاكل التي تتعلق بخدمة العملاء'
    },
    resources: [1, 2],
    pid: 8,
    path: '8-9',
    order: 1,
    status: 1
  },
  {
    id: 10,
    name: {
      'zh-CN': '市场总监',
      'zh-HK': '市場總監',
      en: 'Marketing Director',
      ja: 'マーケティングディレクター',
      ko: '마케팅 디렉터',
      ar: 'مدير التسويق'
    },
    description: {
      'zh-CN': '负责整体市场营销策略',
      'zh-HK': '負責整體市場營銷策略',
      en: 'Responsible for overall market marketing strategy',
      ja: '全体的な市場マーケティング戦略を管理する',
      ko: '전체 시장 마케팅 전략을 관리하는 책임',
      ar: 'مسؤول عن الاستراتيجية المتكاملة للتسويق'
    },
    resources: [1, 2, 3, 4],
    pid: null,
    path: '10',
    order: 10,
    status: 1
  },
  {
    id: 11,
    name: {
      'zh-CN': '市场专员',
      'zh-HK': '市場專員',
      en: 'Marketing Specialist',
      ja: 'マーケティングスペシャリスト',
      ko: '마케팅 전문가',
      ar: 'متخصص في التسويق'
    },
    description: {
      'zh-CN': '执行市场营销计划',
      'zh-HK': '執行市場營銷計劃',
      en: 'Responsible for executing market marketing plans',
      ja: '市場マーケティング計画を実行する',
      ko: '시장 마케팅 계획을 실행하는 책임',
      ar: 'مسؤول عن تنفيذ خطط التسويق'
    },
    resources: [1, 2, 3, 4],
    pid: 10,
    path: '10-11',
    order: 1,
    status: 1
  },
  {
    id: 15,
    name: {
      'zh-CN': '小市场专员',
      'zh-HK': '小市場專員',
      en: 'Small Market Specialist',
      ja: '小規模マーケティングスペシャリスト',
      ko: '소규모 마케팅 전문가',
      ar: 'متخصص في التسويق الصغير'
    },
    description: {
      'zh-CN': '执行小小市场营销计划',
      'zh-HK': '執行小小市場營銷計劃',
      en: 'Responsible for executing small market marketing plans',
      ja: '小規模のマーケティング計画を実行する',
      ko: '소규모 시장 마케팅 계획을 실행하는 책임',
      ar: 'مسؤول عن تنفيذ خطط التسويق الصغير'
    },
    resources: [1, 2, 3, 4],
    pid: 11,
    path: '10-11-15',
    order: 1,
    status: 1
  },
  {
    id: 12,
    name: {
      'zh-CN': '人力资源总监',
      'zh-HK': '人力資源總監',
      en: 'Human Resources Director',
      ja: '人材資源ディレクター',
      ko: '인력 자원 디렉터',
      ar: 'مدير الموارد البشرية'
    },
    description: {
      'zh-CN': '负责整体人力资源管理',
      'zh-HK': '負責整體人力資源管理',
      en: 'Responsible for overall human resources management',
      ja: '全体的な人材資源を管理する',
      ko: '전체 인력 자원을 관리하는 책임',
      ar: 'مسؤول عن إدارة الموارد البشرية'
    },
    resources: [1, 2, 3, 4, 5, 6],
    pid: null,
    path: '12',
    order: 12,
    status: 1
  },
  {
    id: 13,
    name: {
      'zh-CN': '招聘专员',
      'zh-HK': '招聘專員',
      en: 'Recruitment Specialist',
      ja: '採用スペシャリスト',
      ko: '채용 전문가',
      ar: 'متخصص في التوظيف'
    },
    description: {
      'zh-CN': '负责招聘相关事务',
      'zh-HK': '負責招聘相關事務',
      en: 'Responsible for recruitment-related affairs',
      ja: '採用に関連するすべての事務を管理する',
      ko: '채용과 관련된 모든 사무를 관리하는 책임',
      ar: 'مسؤول عن إدارة التوظيف'
    },
    resources: [1, 2, 3],
    pid: 12,
    path: '12-13',
    order: 1,
    status: 1
  },
  {
    id: 14,
    name: {
      'zh-CN': '培训专员',
      'zh-HK': '培訓專員',
      en: 'Training Specialist',
      ja: 'トレーニングスペシャリスト',
      ko: '교육 전문가',
      ar: 'متخصص في التدريب'
    },
    description: {
      'zh-CN': '负责员工培训和发展',
      'zh-HK': '負責員工培訓和發展',
      en: 'Responsible for employee training and development',
      ja: '従業員のトレーニングと発展を管理する',
      ko: '직원의 교육과 발전을 관리하는 책임',
      ar: 'مسؤول عن تدريب الموظفين وتطويرهم'
    },
    resources: [1, 2, 3, 4],
    pid: 12,
    path: '12-14',
    order: 2,
    status: 1
  }
]

const database = 'mpadmin'
use(database)

db.roles.deleteMany({})
db.roles.insertMany(roles)
console.log(roles.length)
db.counters.findAndModify({
  query: { _id: 'roleid' },
  update: { $set: { seq: roles.length } },
  new: true,
  upsert: true
})
