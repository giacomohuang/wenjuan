const areaCode = [
  {
    code: '86',
    'zh-CN': '中国大陆',
    en: 'China',
    ar: 'الصين'
  },
  {
    code: '852',
    'zh-CN': '中国香港',
    en: 'HongKong',
    ar: 'هونغ كونغ'
  },
  {
    code: '853',
    'zh-CN': '中国澳门',
    en: 'Macao',
    ar: 'ماكاو'
  },
  {
    code: '886',
    'zh-CN': '中国台湾',
    en: 'Taiwan',
    ar: 'تايوان'
  },
  {
    code: '1',
    'zh-CN': '美国/加拿大',
    en: 'United States / Canada',
    ar: 'الولايات المتحدة / كندا'
  },
  {
    code: '7',
    'zh-CN': '俄罗斯',
    en: 'Russia',
    ar: 'روسيا'
  },
  {
    code: '33',
    'zh-CN': '法国',
    en: 'France',
    ar: 'فرنسا'
  },
  {
    code: '39',
    'zh-CN': '意大利',
    en: 'Italy',
    ar: 'إيطاليا'
  },
  {
    code: '44',
    'zh-CN': '英国',
    en: 'United Kingdom',
    ar: 'المملكة المتحدة'
  },
  {
    code: '49',
    'zh-CN': '德国',
    en: 'Germany',
    ar: 'ألمانيا'
  },
  {
    code: '60',
    'zh-CN': '马来西亚',
    en: 'Malaysia',
    ar: 'ماليزيا'
  },
  {
    code: '61',
    'zh-CN': '澳大利亚',
    en: 'Australia',
    ar: 'أستراليا'
  },
  {
    code: '62',
    'zh-CN': '印度尼西亚',
    en: 'Indonesia',
    ar: 'إندونيسيا'
  },
  {
    code: '63',
    'zh-CN': '菲律宾',
    en: 'Philippines',
    ar: 'فيليبين'
  },
  {
    code: '64',
    'zh-CN': '新西兰',
    en: 'New Zealand',
    ar: 'نيوزيلندا'
  },
  {
    code: '65',
    'zh-CN': '新加坡',
    en: 'Singapore',
    ar: 'سنغافورة'
  },
  {
    code: '66',
    'zh-CN': '泰国',
    en: 'Thailand',
    ar: 'تايلند'
  },
  {
    code: '81',
    'zh-CN': '日本',
    en: 'Japan',
    ar: 'اليابان'
  },
  {
    code: '82',
    'zh-CN': '韩国',
    en: 'Republic of Korea',
    ar: 'كوريا الجنوبية'
  },
  {
    code: '84',
    'zh-CN': '越南',
    en: 'Viet Nam',
    ar: 'فيتنام'
  },
  {
    code: '91',
    'zh-CN': '印度',
    en: 'India',
    ar: 'الهند'
  },
  {
    code: '855',
    'zh-CN': '柬埔寨',
    en: 'Cambodia',
    ar: 'كمبوديا'
  },
  {
    code: '355',
    'zh-CN': '阿尔巴尼亚',
    en: 'Albania',
    ar: 'ألبانيا'
  },
  {
    code: '213',
    'zh-CN': '阿尔及利亚',
    en: 'Algeria',
    ar: 'الجزائر'
  },
  {
    code: '93',
    'zh-CN': '阿富汗',
    en: 'Afghanistan',
    ar: 'أفغانستان'
  },
  {
    code: '54',
    'zh-CN': '阿根廷',
    en: 'Argentina',
    ar: 'أرجنتين'
  },
  {
    code: '971',
    'zh-CN': '阿联酋',
    en: 'United Arab Emirates',
    ar: 'الإمارات العربية المتحدة'
  },
  {
    code: '297',
    'zh-CN': '阿鲁巴',
    en: 'Aruba',
    ar: 'أروبا'
  },
  {
    code: '968',
    'zh-CN': '阿曼',
    en: 'Oman',
    ar: 'عمان'
  },
  {
    code: '994',
    'zh-CN': '阿塞拜疆',
    en: 'Azerbaijan',
    ar: 'أذربيجان'
  },
  {
    code: '247',
    'zh-CN': '阿森松',
    en: 'Ascension',
    ar: 'أسكنسيون'
  },
  {
    code: '20',
    'zh-CN': '埃及',
    en: 'Egypt',
    ar: 'مصر'
  },
  {
    code: '251',
    'zh-CN': '埃塞俄比亚',
    en: 'Ethiopia',
    ar: 'إثيوبيا'
  },
  {
    code: '353',
    'zh-CN': '爱尔兰',
    en: 'Ireland',
    ar: 'أيرلندا'
  },
  {
    code: '372',
    'zh-CN': '爱沙尼亚',
    en: 'Estonia',
    ar: 'إستونيا'
  },
  {
    code: '376',
    'zh-CN': '安道尔',
    en: 'Andorra',
    ar: 'أندورا'
  },
  {
    code: '244',
    'zh-CN': '安哥拉',
    en: 'Angola',
    ar: 'أنغولا'
  },
  {
    code: '1264',
    'zh-CN': '安圭拉',
    en: 'Anguilla',
    ar: 'أنغويلا'
  },
  {
    code: '1268',
    'zh-CN': '安提瓜和巴布达',
    en: 'Antigua and barbuda',
    ar: 'أنتيغا وبربودا'
  },
  {
    code: '43',
    'zh-CN': '奥地利',
    en: 'Austria',
    ar: 'النمسا'
  },
  {
    code: '1246',
    'zh-CN': '巴巴多斯',
    en: 'Barbados',
    ar: 'باربادوس'
  },
  {
    code: '675',
    'zh-CN': '巴布亚新几内亚',
    en: 'Papua New Guinea',
    ar: 'بابوا نيو غينيا'
  },
  {
    code: '1242',
    'zh-CN': '巴哈马',
    en: 'Bahamas',
    ar: 'باهاماس'
  },
  {
    code: '92',
    'zh-CN': '巴基斯坦',
    en: 'Pakistan',
    ar: 'باكستان'
  },
  {
    code: '595',
    'zh-CN': '巴拉圭',
    en: 'Paraguay',
    ar: 'باراجواي'
  },
  {
    code: '970',
    'zh-CN': '巴勒斯坦',
    en: 'Palestine',
    ar: 'فلسطين'
  },
  {
    code: '973',
    'zh-CN': '巴林',
    en: 'Bahrain',
    ar: 'البحرين'
  },
  {
    code: '507',
    'zh-CN': '巴拿马',
    en: 'Panama',
    ar: 'بنما'
  },
  {
    code: '55',
    'zh-CN': '巴西',
    en: 'Brazil',
    ar: 'برازيل'
  },
  {
    code: '375',
    'zh-CN': '白俄罗斯',
    en: 'Belarus',
    ar: 'روسيا البيضاء'
  },
  {
    code: '1441',
    'zh-CN': '百慕大',
    en: 'Bermuda',
    ar: 'برمودا'
  },
  {
    code: '359',
    'zh-CN': '保加利亚',
    en: 'Bulgaria',
    ar: 'بلغاريا'
  },
  {
    code: '229',
    'zh-CN': '贝宁',
    en: 'Benin',
    ar: 'بنين'
  },
  {
    code: '32',
    'zh-CN': '比利时',
    en: 'Belgium',
    ar: 'بلجيكا'
  },
  {
    code: '354',
    'zh-CN': '冰岛',
    en: 'Iceland',
    ar: 'آيسلندا'
  },
  {
    code: '1787',
    'zh-CN': '波多黎各',
    en: 'Puerto Rico',
    ar: 'بورتوريكو'
  },
  {
    code: '48',
    'zh-CN': '波兰',
    en: 'Poland',
    ar: 'بولندا'
  },
  {
    code: '387',
    'zh-CN': '波斯尼亚和黑塞哥维那',
    en: 'Bosnia and Herzegovina',
    ar: 'بوسنيا وهيرزيغوفينا'
  },
  {
    code: '591',
    'zh-CN': '玻利维亚',
    en: 'Bolivia',
    ar: 'بوليفيا'
  },
  {
    code: '501',
    'zh-CN': '伯利兹',
    en: 'Belize',
    ar: 'بليز'
  },
  {
    code: '267',
    'zh-CN': '博茨瓦纳',
    en: 'Botswana',
    ar: 'بوتسوانا'
  },
  {
    code: '975',
    'zh-CN': '不丹',
    en: 'Bhutan',
    ar: 'بوتان'
  },
  {
    code: '226',
    'zh-CN': '布基纳法索',
    en: 'Burkina Faso',
    ar: 'بوركينا فاسو'
  },
  {
    code: '257',
    'zh-CN': '布隆迪',
    en: 'Burundi',
    ar: 'بوروندي'
  },
  {
    code: '850',
    'zh-CN': '朝鲜',
    en: 'DPR of Korea',
    ar: 'كوريا الشمالية'
  },
  {
    code: '240',
    'zh-CN': '赤道几内亚',
    en: 'Equatorial Guinea',
    ar: 'غينيا الاستوائية'
  },
  {
    code: '45',
    'zh-CN': '丹麦',
    en: 'Denmark',
    ar: 'دنمارك'
  },
  {
    code: '670',
    'zh-CN': '东帝汶',
    en: 'East Timor',
    ar: 'تيمور الشرقية'
  },
  {
    code: '684',
    'zh-CN': '东萨摩亚(美)',
    en: 'Samoa Eastern',
    ar: 'ساموا الشرقية'
  },
  {
    code: '228',
    'zh-CN': '多哥',
    en: 'Togo',
    ar: 'توغو'
  },
  {
    code: '1809',
    'zh-CN': '多米尼加共和国',
    en: 'Dominican Republic',
    ar: 'الجمهورية الدومينيكية'
  },
  {
    code: '593',
    'zh-CN': '厄瓜多尔',
    en: 'Ecuador',
    ar: 'إكوادور'
  },
  {
    code: '291',
    'zh-CN': '厄立特里亚',
    en: 'Eritrea',
    ar: 'إريتريا'
  },
  {
    code: '298',
    'zh-CN': '法罗群岛',
    en: 'Faroe Islands',
    ar: 'جزر فارو'
  },
  {
    code: '689',
    'zh-CN': '法属波利尼西亚',
    en: 'French Polynesia',
    ar: 'بولينيزيا الفرنسية'
  },
  {
    code: '594',
    'zh-CN': '法属圭亚那',
    en: 'French Guiana',
    ar: 'غيانا الفرنسية'
  },
  {
    code: '379',
    'zh-CN': '梵蒂冈',
    en: 'Vatican',
    ar: 'فانتيكان'
  },
  {
    code: '679',
    'zh-CN': '斐济',
    en: 'Fiji',
    ar: 'فيجي'
  },
  {
    code: '358',
    'zh-CN': '芬兰',
    en: 'Finland',
    ar: 'فنلندا'
  },
  {
    code: '238',
    'zh-CN': '佛得角',
    en: 'Cape Verde',
    ar: 'كابو فيردي'
  },
  {
    code: '500',
    'zh-CN': '福克兰群岛',
    en: 'Falkland Islands',
    ar: 'جزر فالكلاند'
  },
  {
    code: '220',
    'zh-CN': '冈比亚',
    en: 'Gambia',
    ar: 'غامبيا'
  },
  {
    code: '242',
    'zh-CN': '刚果共和国',
    en: 'Congo',
    ar: 'جمهورية الكونغو'
  },
  {
    code: '57',
    'zh-CN': '哥伦比亚',
    en: 'Colombia',
    ar: 'كولومبيا'
  },
  {
    code: '506',
    'zh-CN': '哥斯达黎加',
    en: 'Costa Rica',
    ar: 'كوستا ريكا'
  },
  {
    code: '1473',
    'zh-CN': '格林纳达',
    en: 'Grenada',
    ar: 'غرينادا'
  },
  {
    code: '299',
    'zh-CN': '格陵兰',
    en: 'Greenland',
    ar: 'غرينلاند'
  },
  {
    code: '995',
    'zh-CN': '格鲁吉亚',
    en: 'Georgia',
    ar: 'جورجيا'
  },
  {
    code: '53',
    'zh-CN': '古巴',
    en: 'Cuba',
    ar: 'كوبا'
  },
  {
    code: '1671',
    'zh-CN': '关岛',
    en: 'Guam',
    ar: 'جوام'
  },
  {
    code: '592',
    'zh-CN': '圭亚那',
    en: 'Guyana',
    ar: 'غيانا'
  },
  {
    code: '7',
    'zh-CN': '哈萨克斯坦',
    en: 'Kazakhstan',
    ar: 'كازاخستان'
  },
  {
    code: '509',
    'zh-CN': '海地',
    en: 'Haiti',
    ar: 'هايتي'
  },
  {
    code: '31',
    'zh-CN': '荷兰',
    en: 'Netherlands',
    ar: 'هولندا'
  },
  {
    code: '599',
    'zh-CN': '荷属安第列斯',
    en: 'Netherlands Antilles',
    ar: 'الأنتيل الهولندية'
  },
  {
    code: '382',
    'zh-CN': '黑山',
    en: 'Montenegro',
    ar: 'الجبل الأسود'
  },
  {
    code: '504',
    'zh-CN': '洪都拉斯',
    en: 'Honduras',
    ar: 'هوندوراس'
  },
  {
    code: '686',
    'zh-CN': '基里巴斯',
    en: 'Kiribati',
    ar: 'كيريباتي'
  },
  {
    code: '253',
    'zh-CN': '吉布提',
    en: 'Djibouti',
    ar: 'جيبوتي'
  },
  {
    code: '996',
    'zh-CN': '吉尔吉斯斯坦',
    en: 'Kirgizstan',
    ar: 'كيرغيزستان'
  },
  {
    code: '224',
    'zh-CN': '几内亚',
    en: 'Guinea',
    ar: 'غينيا'
  },
  {
    code: '245',
    'zh-CN': '几内亚比绍',
    en: 'Guinea-bissau',
    ar: 'غينيا بيساو'
  },
  {
    code: '233',
    'zh-CN': '加纳',
    en: 'Ghana',
    ar: 'غانا'
  },
  {
    code: '241',
    'zh-CN': '加蓬',
    en: 'Gabon',
    ar: 'غابون'
  },
  {
    code: '420',
    'zh-CN': '捷克',
    en: 'Czech',
    ar: 'تشيك'
  },
  {
    code: '263',
    'zh-CN': '津巴布韦',
    en: 'Zimbabwe',
    ar: 'زيمبابوي'
  },
  {
    code: '237',
    'zh-CN': '喀麦隆',
    en: 'Cameroon',
    ar: 'كاميرون'
  },
  {
    code: '974',
    'zh-CN': '卡塔尔',
    en: 'Qatar',
    ar: 'قطر'
  },
  {
    code: '1345',
    'zh-CN': '开曼群岛',
    en: 'Cayman Islands',
    ar: 'جزر كايمان'
  },
  {
    code: '269',
    'zh-CN': '科摩罗',
    en: 'Comoros',
    ar: 'كوموروس'
  },
  {
    code: '383',
    'zh-CN': '科索沃',
    en: 'Kosovo',
    ar: 'كوسوفو'
  },
  {
    code: '225',
    'zh-CN': '科特迪瓦',
    en: 'Coted Ivoire',
    ar: 'ساعة كوت ديفور'
  },
  {
    code: '965',
    'zh-CN': '科威特',
    en: 'Kuwait',
    ar: 'كويت'
  },
  {
    code: '385',
    'zh-CN': '克罗地亚',
    en: 'Croatia',
    ar: 'كرواسيا'
  },
  {
    code: '254',
    'zh-CN': '肯尼亚',
    en: 'Kenya',
    ar: 'كينيا'
  },
  {
    code: '682',
    'zh-CN': '库克群岛',
    en: 'Cook Islands',
    ar: 'جزر كوك'
  },
  {
    code: '371',
    'zh-CN': '拉脱维亚',
    en: 'Latvia',
    ar: 'لاتفيا'
  },
  {
    code: '266',
    'zh-CN': '莱索托',
    en: 'Lesotho',
    ar: 'ليسوتو'
  },
  {
    code: '856',
    'zh-CN': '老挝',
    en: 'Lao',
    ar: 'لاو'
  },
  {
    code: '961',
    'zh-CN': '黎巴嫩',
    en: 'Lebanon',
    ar: 'لبنان'
  },
  {
    code: '370',
    'zh-CN': '立陶宛',
    en: 'Lithuania',
    ar: 'ليتوانيا'
  },
  {
    code: '231',
    'zh-CN': '利比里亚',
    en: 'Liberia',
    ar: 'ليبيريا'
  },
  {
    code: '218',
    'zh-CN': '利比亚',
    en: 'Libya',
    ar: 'ليبيا'
  },
  {
    code: '423',
    'zh-CN': '列支敦士登',
    en: 'Liechtenstein',
    ar: 'ليشتنشتاين'
  },
  {
    code: '262',
    'zh-CN': '留尼汪（法属）',
    en: 'Reunion',
    ar: 'ريونيون'
  },
  {
    code: '352',
    'zh-CN': '卢森堡',
    en: 'Luxembourg',
    ar: 'لوكسمبورغ'
  },
  {
    code: '250',
    'zh-CN': '卢旺达',
    en: 'Rwanda',
    ar: 'رواندا'
  },
  {
    code: '40',
    'zh-CN': '罗马尼亚',
    en: 'Romania',
    ar: 'رومانيا'
  },
  {
    code: '261',
    'zh-CN': '马达加斯加',
    en: 'Madagascar',
    ar: 'مدغشقر'
  },
  {
    code: '960',
    'zh-CN': '马尔代夫',
    en: 'Maldives',
    ar: 'مالديف'
  },
  {
    code: '356',
    'zh-CN': '马耳他',
    en: 'Malta',
    ar: 'مالطا'
  },
  {
    code: '265',
    'zh-CN': '马拉维',
    en: 'Malawi',
    ar: 'مالاوي'
  },
  {
    code: '223',
    'zh-CN': '马里',
    en: 'Mali',
    ar: 'مالي'
  },
  {
    code: '1670',
    'zh-CN': '马里亚那群岛',
    en: 'Mariana Is',
    ar: 'جزر ماريانا'
  },
  {
    code: '389',
    'zh-CN': '马其顿共和国',
    en: 'Macedonia',
    ar: 'مقدونيا'
  },
  {
    code: '692',
    'zh-CN': '马绍尔群岛',
    en: 'Marshall Islands',
    ar: 'جزر مارشال'
  },
  {
    code: '596',
    'zh-CN': '马提尼克',
    en: 'Martinique',
    ar: 'مارتينيك'
  },
  {
    code: '262',
    'zh-CN': '马约特',
    en: 'Mayotte',
    ar: 'مايوت'
  },
  {
    code: '230',
    'zh-CN': '毛里求斯',
    en: 'Mauritius',
    ar: 'موريشيوس'
  },
  {
    code: '222',
    'zh-CN': '毛里塔尼亚',
    en: 'Mauritania',
    ar: 'موريتانيا'
  },
  {
    code: '976',
    'zh-CN': '蒙古',
    en: 'Mongolia',
    ar: 'منغوليا'
  },
  {
    code: '1664',
    'zh-CN': '蒙特塞拉特岛',
    en: 'Montserrat Is',
    ar: 'جزر مونتسيرات'
  },
  {
    code: '880',
    'zh-CN': '孟加拉国',
    en: 'Bangladesh',
    ar: 'بنغلاديش'
  },
  {
    code: '51',
    'zh-CN': '秘鲁',
    en: 'Peru',
    ar: 'بيرو'
  },
  {
    code: '691',
    'zh-CN': '密克罗尼西亚',
    en: 'Micronesia',
    ar: 'ميكرونيسيا'
  },
  {
    code: '95',
    'zh-CN': '缅甸',
    en: 'Myanmar',
    ar: 'ميانمار'
  },
  {
    code: '373',
    'zh-CN': '摩尔多瓦',
    en: 'Moldova',
    ar: 'مولدوفا'
  },
  {
    code: '212',
    'zh-CN': '摩洛哥',
    en: 'Morocco',
    ar: 'موريكو'
  },
  {
    code: '377',
    'zh-CN': '摩纳哥',
    en: 'Monaco',
    ar: 'موناكو'
  },
  {
    code: '258',
    'zh-CN': '莫桑比克',
    en: 'Mozambique',
    ar: 'موزامبيك'
  },
  {
    code: '52',
    'zh-CN': '墨西哥',
    en: 'Mexico',
    ar: 'مكسيكو'
  },
  {
    code: '264',
    'zh-CN': '纳米比亚',
    en: 'Namibia',
    ar: 'ناميبيا'
  },
  {
    code: '27',
    'zh-CN': '南非',
    en: 'South Africa',
    ar: 'جنوب أفريقيا'
  },
  {
    code: '672',
    'zh-CN': '南极',
    en: 'South Pole',
    ar: 'جنوب القطب'
  },
  {
    code: '381',
    'zh-CN': '南斯拉夫',
    en: 'Yugoslavia',
    ar: 'يوغوسلافيا'
  },
  {
    code: '211',
    'zh-CN': '南苏丹',
    en: 'SOUTH SUDAN',
    ar: 'جنوب السودان'
  },
  {
    code: '674',
    'zh-CN': '瑙鲁',
    en: 'Nauru',
    ar: 'ناورو'
  },
  {
    code: '977',
    'zh-CN': '尼泊尔',
    en: 'Nepal',
    ar: 'नेपाल'
  },
  {
    code: '505',
    'zh-CN': '尼加拉瓜',
    en: 'Nicaragua',
    ar: 'نيكاراغوا'
  },
  {
    code: '227',
    'zh-CN': '尼日尔',
    en: 'Niger',
    ar: 'نيجر'
  },
  {
    code: '234',
    'zh-CN': '尼日利亚',
    en: 'Nigeria',
    ar: 'نيجيريا'
  },
  {
    code: '683',
    'zh-CN': '纽埃（新西兰属）',
    en: 'Niue',
    ar: 'نيوي'
  },
  {
    code: '47',
    'zh-CN': '挪威',
    en: 'Norway',
    ar: 'نرويج'
  },
  {
    code: '680',
    'zh-CN': '帕劳群岛',
    en: 'Palau',
    ar: 'بالاو'
  },
  {
    code: '64',
    'zh-CN': '皮特肯群岛',
    en: 'Pitcairn',
    ar: 'جزر بيتكيرن'
  },
  {
    code: '351',
    'zh-CN': '葡萄牙',
    en: 'Portugal',
    ar: 'برتغال'
  },
  {
    code: '46',
    'zh-CN': '瑞典',
    en: 'Sweden',
    ar: 'السويد'
  },
  {
    code: '41',
    'zh-CN': '瑞士',
    en: 'Switzerland',
    ar: 'سويسرا'
  },
  {
    code: '503',
    'zh-CN': '萨尔瓦多',
    en: 'El Salvador',
    ar: 'السالفادور'
  },
  {
    code: '381',
    'zh-CN': '塞尔维亚',
    en: 'Serbia',
    ar: 'صربيا'
  },
  {
    code: '232',
    'zh-CN': '塞拉利昂',
    en: 'Sierra Leone',
    ar: 'سيراليون'
  },
  {
    code: '221',
    'zh-CN': '塞内加尔',
    en: 'Senegal',
    ar: 'سنغال'
  },
  {
    code: '357',
    'zh-CN': '塞浦路斯',
    en: 'Cyprus',
    ar: 'قبرص'
  },
  {
    code: '248',
    'zh-CN': '塞舌尔',
    en: 'Seychelles',
    ar: 'سيشيل'
  },
  {
    code: '966',
    'zh-CN': '沙特阿拉伯',
    en: 'Saudi Arabia',
    ar: 'المملكة العربية السعودية'
  },
  {
    code: '260',
    'zh-CN': '尚比亚',
    en: 'Zambia',
    ar: 'زامبيا'
  },
  {
    code: '590',
    'zh-CN': '圣巴泰勒米',
    en: 'Saint Barthelemy',
    ar: 'سان بارتيمي'
  },
  {
    code: '239',
    'zh-CN': '圣多美和普林西比',
    en: 'Sao Tome and Principe',
    ar: 'سانتومي وبرنسيبي'
  },
  {
    code: '1758',
    'zh-CN': '圣卢西亚',
    en: 'Saint Lucia',
    ar: 'سانت لوسيا'
  },
  {
    code: '590',
    'zh-CN': '圣马丁岛',
    en: 'Saint Martin',
    ar: 'سانت مارتين'
  },
  {
    code: '378',
    'zh-CN': '圣马力诺',
    en: 'San Marino',
    ar: 'سان مارينو'
  },
  {
    code: '508',
    'zh-CN': '圣皮埃尔和密克隆岛',
    en: 'Saint Pierre and Miq',
    ar: 'سان بيير وميكلون'
  },
  {
    code: '1784',
    'zh-CN': '圣文森特和格林纳丁斯',
    en: 'Saint Vincent and the Grenadines',
    ar: 'سان فينسنت وغرينادينز'
  },
  {
    code: '94',
    'zh-CN': '斯里兰卡',
    en: 'Sri Lanka',
    ar: 'سري لانكا'
  },
  {
    code: '421',
    'zh-CN': '斯洛伐克',
    en: 'Slovakia',
    ar: 'سلوفاكيا'
  },
  {
    code: '386',
    'zh-CN': '斯洛文尼亚',
    en: 'Slovenia',
    ar: 'سلوفينيا'
  },
  {
    code: '268',
    'zh-CN': '斯威士兰',
    en: 'Swaziland',
    ar: 'سوازيلاند'
  },
  {
    code: '249',
    'zh-CN': '苏丹',
    en: 'Sudan',
    ar: 'سودان'
  },
  {
    code: '597',
    'zh-CN': '苏里南',
    en: 'Suriname',
    ar: 'سورينام'
  },
  {
    code: '677',
    'zh-CN': '所罗门群岛',
    en: 'Solomon Islands',
    ar: 'جزر سولومون'
  },
  {
    code: '252',
    'zh-CN': '索马里',
    en: 'Somalia',
    ar: 'سوماليا'
  },
  {
    code: '992',
    'zh-CN': '塔吉克斯坦',
    en: 'Tajikistan',
    ar: 'تاجيكستان'
  },
  {
    code: '255',
    'zh-CN': '坦桑尼亚',
    en: 'Tanzania',
    ar: 'تانزانيا'
  },
  {
    code: '676',
    'zh-CN': '汤加',
    en: 'Tonga',
    ar: 'تونغا'
  },
  {
    code: '1868',
    'zh-CN': '特立尼达和多巴哥',
    en: 'Trinidad and Tobago',
    ar: 'ترينيداد وتوباغو'
  },
  {
    code: '216',
    'zh-CN': '突尼斯',
    en: 'Tunisia',
    ar: 'تونس'
  },
  {
    code: '688',
    'zh-CN': '图瓦卢',
    en: 'Tuvalu',
    ar: 'توفالو'
  },
  {
    code: '90',
    'zh-CN': '土耳其',
    en: 'Turkey',
    ar: 'تركيا'
  },
  {
    code: '993',
    'zh-CN': '土库曼斯坦',
    en: 'Turkmenstan',
    ar: 'تركمانستان'
  },
  {
    code: '690',
    'zh-CN': '托克劳群岛',
    en: 'Tokelau',
    ar: 'جزر توكيلاو'
  },
  {
    code: '681',
    'zh-CN': '瓦利斯和富图纳群岛',
    en: 'Wallis And Futuna Is',
    ar: 'جزر واليس وفوتونا'
  },
  {
    code: '678',
    'zh-CN': '瓦努阿图',
    en: 'Vanuatu',
    ar: 'فانواتو'
  },
  {
    code: '502',
    'zh-CN': '危地马拉',
    en: 'Guatemala',
    ar: 'غواتيمالا'
  },
  {
    code: '58',
    'zh-CN': '委内瑞拉',
    en: 'Venezuela',
    ar: 'فنزويلا'
  },
  {
    code: '673',
    'zh-CN': '文莱',
    en: 'Brunei',
    ar: 'بروني'
  },
  {
    code: '256',
    'zh-CN': '乌干达',
    en: 'Uganda',
    ar: 'أوغندا'
  },
  {
    code: '380',
    'zh-CN': '乌克兰',
    en: 'Ukraine',
    ar: 'أوكرانيا'
  },
  {
    code: '598',
    'zh-CN': '乌拉圭',
    en: 'Uruguay',
    ar: 'أوروغواي'
  },
  {
    code: '998',
    'zh-CN': '乌兹别克斯坦',
    en: 'Uzbekistan',
    ar: 'أوزبكستان'
  },
  {
    code: '34',
    'zh-CN': '西班牙',
    en: 'Spain',
    ar: 'إسبانيا'
  },
  {
    code: '212',
    'zh-CN': '西撒哈拉国',
    en: 'Western Sahara',
    ar: 'الصحراء الغربية'
  },
  {
    code: '685',
    'zh-CN': '西萨摩亚',
    en: 'Samoa Western',
    ar: 'ساموا الغربية'
  },
  {
    code: '30',
    'zh-CN': '希腊',
    en: 'Greece',
    ar: 'اليونان'
  },
  {
    code: '687',
    'zh-CN': '新喀里多尼亚',
    en: 'New Caledonia',
    ar: 'كاليدونيا الجديدة'
  },
  {
    code: '36',
    'zh-CN': '匈牙利',
    en: 'Hungary',
    ar: 'هنغاريا'
  },
  {
    code: '963',
    'zh-CN': '叙利亚',
    en: 'Syria',
    ar: 'سوريا'
  },
  {
    code: '1876',
    'zh-CN': '牙买加',
    en: 'Jamaica',
    ar: 'جامايكا'
  },
  {
    code: '374',
    'zh-CN': '亚美尼亚',
    en: 'Armenia',
    ar: 'أرمينيا'
  },
  {
    code: '967',
    'zh-CN': '也门',
    en: 'Yemen',
    ar: 'اليمن'
  },
  {
    code: '964',
    'zh-CN': '伊拉克',
    en: 'Iraq',
    ar: 'العراق'
  },
  {
    code: '98',
    'zh-CN': '伊朗',
    en: 'Iran',
    ar: 'إيران'
  },
  {
    code: '972',
    'zh-CN': '以色列',
    en: 'Israel',
    ar: 'إسرائيل'
  },
  {
    code: '962',
    'zh-CN': '约旦',
    en: 'Jordan',
    ar: 'الأردن'
  },
  {
    code: '243',
    'zh-CN': '扎伊尔',
    en: 'Zaire',
    ar: 'زائر'
  },
  {
    code: '235',
    'zh-CN': '乍得',
    en: 'Chad',
    ar: 'تشاد'
  },
  {
    code: '350',
    'zh-CN': '直布罗陀',
    en: 'Gibraltar',
    ar: 'جبل طارق'
  },
  {
    code: '56',
    'zh-CN': '智利',
    en: 'Chile',
    ar: 'شيلي'
  },
  {
    code: '236',
    'zh-CN': '中非共和国',
    en: 'Central Africa Republic',
    ar: 'جمهورية أفريقيا الوسطى'
  }
]

export default areaCode
