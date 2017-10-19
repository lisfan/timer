/**
 * 计时器日期时间格式化工具
 */
import validation from '@~lisfan/validation'
import Logger from '@~lisfan/logger'

const logger = new Logger('format-date')

// 日期时间格式化模式匹配值
const DATETIME_PATTERN = {
  'Y': 'year',
  'M': 'month',
  'D': 'date',
  'h': 'hour',
  'm': 'minute',
  's': 'second',
  'S': 'millisecond',
}

/**
 * 计时器格式化类
 * @class
 */
export default class FormatDate {
  constructor(options) {
    // 判断是否存在
    if (!validation.isNumber(options.date) && !validation.isString(options.date) && !validation.isDate(options.date)) {
      logger.error('require date option param, please check')
    }

    this.$options = {
      ...FormatDate.options,
      ...options
    }

    // 值必须有
    this.$data = FormatDate.getFields(this.$date, this.$format)
  }

  static options = {
    // date: undefined, // 必须
    format: 'mm:ss'
  }

  /**
   * 获取日期时间格式化后的字段
   */
  static getFields(date, format) {
    const startDate = new Date(0) // 用于减去计时器初始日期时间
    date = new Date(date)

    const fields = {
      'Y': date.getFullYear() - startDate.getFullYear(),
      'M': date.getMonth() - startDate.getMonth(),
      'D': date.getDate() - startDate.getDate(),
      'h': date.getHours(),
      'm': date.getMinutes(),
      's': date.getSeconds(),
      'S': date.getMilliseconds(),
    }

    let formatFields = {}
    Object.entries(DATETIME_PATTERN).forEach(([pattern, dateStr]) => {
      const regexp = new RegExp(pattern + '+')
      const matched = format.match(regexp)

      if (matched) {
        const value = fields[pattern].toString()
        const valueLen = value.length
        const patternLen = matched[0].length
        // 如果指定长度小于要值长度，则显示值长度
        // 如果不足，前置用0补足
        if (patternLen >= valueLen) {
          formatFields[dateStr] = value.padStart(patternLen, '0')
        } else {
          formatFields[dateStr] = value
        }
      }
    })

    return formatFields
  }

  /**
   * 获取日期时间格式化后的字符串
   */
  static toString(dateOrFields, format) {
    let data
    if (validation.isPlainObject(dateOrFields)) {
      data = dateOrFields
    } else {
      data = FormatDate.getFields(dateOrFields, format)
    }

    Object.entries(DATETIME_PATTERN).forEach(([pattern, dateStr]) => {
      const regexp = new RegExp((pattern + '+'))
      format = format.replace(regexp, data[dateStr])
    })

    return format
  }

  $options = undefined
  $data = undefined

  get $date() {
    return this.$options.date
  }

  // readonly
  set $date(value) {
  }

  get $format() {
    return this.$options.format
  }

  // readonly
  set $format(value) {
  }

  toString() {
    return FormatDate.toString(this.$data, this.$format)
  }
}

