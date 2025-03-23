const category = [
  { code: 'R1001', name: '零售', parent_id: 0 },
  { code: 'R100101', name: '时尚服饰', parent_id: 'R1001' },
  { code: 'R10010101', name: '女装', parent_id: 'R100101' },
  { code: 'R10010102', name: '男装', parent_id: 'R100101' },
  { code: 'R100102', name: '美妆个护', parent_id: 'R1001' },

  { code: 'R10010201', name: '国际美妆', parent_id: 'R100102' },
  { code: 'R100103', name: '运动户外', parent_id: 'R1001' },
  { code: 'R100104', name: '电子产品', parent_id: 'R1001' },
  { code: 'R100105', name: '内衣', parent_id: 'R1001' },
  { code: 'R100106', name: '珠宝首饰', parent_id: 'R1001' },
  { code: 'R100107', name: '鞋类', parent_id: 'R1001' },
  { code: 'F2001', name: '餐饮', parent_id: 0 },
  { code: 'F200101', name: '中式餐饮', parent_id: 'F2001' },
  { code: 'F20010101', name: '川湘菜系', parent_id: 'F200101' },
  { code: 'F20010102', name: '酸菜鱼', parent_id: 'F200101' },
  { code: 'F20010103', name: '火锅', parent_id: 'F200101' },
  { code: 'F200102', name: '西式餐饮', parent_id: 'F2001' },
  { code: 'F20010201', name: '意式餐厅', parent_id: 'F200102' },
  { code: 'F200103', name: '甜品饮品', parent_id: 'F2001' },
  { code: 'F20010301', name: '咖啡茶饮', parent_id: 'F200103' },
  { code: 'F20010302', name: '甜品饮品', parent_id: 'F200103' },

  { code: 'E3001', name: '休闲娱乐', parent_id: 0 },
  { code: 'E300101', name: '影院', parent_id: 'E3001' },
  { code: 'E300102', name: '健身中心', parent_id: 'E3001' },
  { code: 'E300103', name: '电玩城', parent_id: 'E3001' },

  { code: 'K4001', name: '儿童亲子', parent_id: 0 },
  { code: 'K400101', name: '儿童教育', parent_id: 'K4001' },
  { code: 'K400102', name: '儿童游乐', parent_id: 'K4001' },

  { code: 'S5001', name: '生活服务', parent_id: 0 },
  { code: 'S500101', name: '金融服务', parent_id: 'S5001' },
  { code: 'S500102', name: '生活服务A', parent_id: 'S5001' },
  { code: 'S500103', name: '生活服务B', parent_id: 'S5001' },
  { code: 'S500104', name: '照相', parent_id: 'S5001' }
]

const merchants = [
  {
    id: 'M001',
    name: 'ZARA女装旗舰店',
    category: 'R10010101',
    floor: 'L1'
  },
  {
    id: 'M015',
    name: '海底捞火锅',
    category: 'F20010101',
    floor: 'L5'
  },
  {
    id: 'M023',
    name: '万达影城IMAX',
    category: 'E300101',
    floor: ['L5', 'L6']
  },
  {
    id: 'M037',
    name: '乐高教育中心',
    category: 'K400101',
    floor: 'L3'
  },
  {
    id: 'M044',
    name: '星巴克臻选店',
    category: 'F20010201',
    floor: 'L1'
  },
  {
    id: 'M062',
    name: '迪卡侬运动超市',
    category: 'R100103',
    floor: 'L2'
  },
  {
    id: 'M078',
    name: '招商银行网点',
    category: 'S500101',
    floor: 'B1'
  },
  {
    id: 'M083',
    name: '汤姆熊电玩城',
    category: 'E300103',
    floor: 'L4'
  },
  {
    id: 'M091',
    name: '孩子王母婴店',
    category: 'K400102',
    floor: 'L3'
  },
  {
    id: 'M100',
    name: '华为智能生活馆',
    category: 'R100103',
    floor: 'L1'
  },
  {
    id: 'M101',
    name: '雅诗兰黛专柜',
    category: 'R10010201',
    floor: 'L1'
  },
  {
    id: 'M102',
    name: '优衣库旗舰店',
    category: 'R10010102',
    floor: 'L2'
  },
  {
    id: 'M103',
    name: '西西弗书店',
    category: 'S500102',
    floor: 'L3'
  },
  {
    id: 'M104',
    name: '喜茶LAB店',
    category: 'F20010301',
    floor: 'L5'
  },
  {
    id: 'M105',
    name: '金宝贝早教中心',
    category: 'K400101',
    floor: 'L3'
  },
  {
    id: 'M106',
    name: '大疆体验店',
    category: 'R100104',
    floor: 'L1'
  },
  {
    id: 'M107',
    name: '全棉时代',
    category: 'R100105',
    floor: 'B1'
  },
  {
    id: 'M108',
    name: '海底捞智慧餐厅',
    category: 'F20010101',
    floor: 'L6'
  },
  {
    id: 'M109',
    name: '乐刻运动24H',
    category: 'E300102',
    floor: 'L4'
  },
  {
    id: 'M110',
    name: '盒马鲜生',
    category: 'S500103',
    floor: 'B1'
  },
  {
    id: 'M111',
    name: '泡泡玛特主题店',
    category: 'R100106',
    floor: 'L2'
  },
  {
    id: 'M112',
    name: '太二酸菜鱼',
    category: 'F20010102',
    floor: 'L5'
  },
  {
    id: 'M113',
    name: '星际传奇电玩',
    category: 'E300103',
    floor: 'L4'
  },
  {
    id: 'M114',
    name: '周大福传承馆',
    category: 'R100107',
    floor: 'L1'
  },
  {
    id: 'M115',
    name: '美吉姆国际早教',
    category: 'K400101',
    floor: 'L3'
  },
  {
    id: 'M116',
    name: '苹果授权店',
    category: 'R100104',
    floor: 'L1'
  },
  {
    id: 'M117',
    name: '西西弗矢量咖啡',
    category: 'F20010302',
    floor: 'L3'
  },
  {
    id: 'M118',
    name: '海马体照相馆',
    category: 'S500104',
    floor: 'L2'
  },
  {
    id: 'M119',
    name: '超级猩猩健身',
    category: 'E300102',
    floor: 'L4'
  },
  {
    id: 'M120',
    name: '小米之家',
    category: 'R100104',
    floor: 'L2'
  },
  {
    id: 'M121',
    name: '奈雪の茶PRO',
    category: 'F20010301',
    floor: 'L5'
  },
  {
    id: 'M122',
    name: '孩子王儿童乐园',
    category: 'K400102',
    floor: 'L3'
  },
  {
    id: 'M123',
    name: '顺电脉体验店',
    category: 'R100104',
    floor: 'L1'
  },
  {
    id: 'M124',
    name: '钟书阁书店',
    category: 'S500102',
    floor: 'L3'
  },
  {
    id: 'M125',
    name: '捞王锅物料理',
    category: 'F20010103',
    floor: 'L5'
  },
  {
    id: 'M126',
    name: '星际传奇VR体验馆',
    category: 'E300103',
    floor: 'L4'
  },
  {
    id: 'M127',
    name: '完美日记体验店',
    category: 'R10010201',
    floor: 'L1'
  },
  {
    id: 'M128',
    name: '中信银行网点',
    category: 'S500101',
    floor: 'B1'
  },
  {
    id: 'M129',
    name: 'Meland儿童乐园',
    category: 'K400102',
    floor: 'L3'
  },
  {
    id: 'M130',
    name: '华为智能家居馆',
    category: 'R100104',
    floor: 'L1'
  }
]

const floors = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'B1']

export { category, merchants, floors }
