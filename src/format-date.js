/**
 * 返回格式日期
 * @param {Number} date 日期
 * @return {Number} 返回详细的年月日的日期对象
 */
function getDateDetail(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  }
}
/**
 * 增加动态校验格式
 * @param {Number} o 日期
 * @param {Number} date 日期
 */
function addTemplateDate(o, date) {
  const dateDetail = getDateDetail(date)
  const nowDateDetail = getDateDetail(new Date())
  let dateString = ''
  // 是在当天
  if (JSON.stringify(dateDetail) === JSON.stringify(nowDateDetail)) {
    dateString = '今天'
  } else if (dateDetail.year === nowDateDetail.year && dateDetail.month === nowDateDetail.month) {
    // 在当月，判断是否为昨天
    if (nowDateDetail.day === dateDetail.day + 1) {
      dateString = '昨天'
    } else {
      dateString = dateDetail.month + '月' + dateDetail.day + '号'
    }
  } else if (dateDetail.year === nowDateDetail.year) {
    dateString = dateDetail.month + '月' + dateDetail.day + '号'
  } else {
    dateString = dateDetail.year + '年' + dateDetail.month + '月' + dateDetail.day + '号'
  }
  o.T = dateString
}
/**
 * 将 Date 转化为指定格式的String * 月(M)、日(D)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(Q)
 * 可以用 1-2 个占位符 * 年(Y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 增加一种自定义格式化T，当日返回今天，昨天返回昨天，本月和本年返回MM月DD号，非本年返回YYYY年MM月DD号
 * 默认，不传fmt日期模板时返回：24进制小时：分钟：秒
 * @param {Number} date 日期
 * @param {String} fmt 格式化模板
 * @return {String} 返回格式化日期
 */
export default function formatData(date, fmt = 'T HH:mm') {
  // 判断date类型，转换为标准的Date格式
  if (!isNaN(date) && !(date instanceof Date)) {
    date = new Date(Number.parseInt(date, 10))
  } else if (/-|\//g.test(date)) {
    date = new Date(date.replace(/-/g, '/'))
  }
  if (!date) return ''
  let k
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'D+': date.getDate(), // 日
    'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'Q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  // 增加一种特殊的日期格式'T'
  addTemplateDate(o, date)
  const week = {
    '0': '/u65e5', // 日
    '1': '/u4e00', // 一
    '2': '/u4e8c', // 二
    '3': '/u4e09', // 三
    '4': '/u56db', // 四
    '5': '/u4e94', // 五
    '6': '/u516d' // 六
  }
  // 匹配年份
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  // 匹配周
  if (/(E+)/.test(fmt)) {
    const length = RegExp.$1.length
    const eString = length > 2 ? '/u661f/u671f' : '/u5468'
    fmt = fmt.replace(RegExp.$1, (length > 1 ? eString : '') + week[date.getDay() + ''])
  }
  // 匹配日期，但匹配到一个时，返回对应的值，匹配超过一个返回1位数前缀加0，2位数保持不变
  for (k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}
