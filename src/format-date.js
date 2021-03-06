/**
 * @file 计时器日期时间格式化工具
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.0.0
 * @licence MIT
 */

import validation from '@~lisfan/validation'
import Logger from '@~lisfan/logger'

// 日期时间格式化模式匹配数据片段映射
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
 *
 * @class
 * @ignore
 */
class FormatDate {
  /**
   * 默认配置选项
   *
   * @since 1.0.0
   *
   * @static
   * @readonly
   * @memberOf FormatDate
   *
   * @type {object}
   * @property {boolean} name='format-date' - 日志器命名空间
   * @property {boolean} debug=false - 调试模式
   * @property {number|string|Date} date - 可以被格式为时间的值
   * @property {string} format='mm:ss' -
   *   日期时间格式化字符串，支持使用字母占位符匹配对应的年月日时分秒：Y=年、M=月、D=日、h=时、m=分、s=秒、ms=毫秒，年和毫秒字母占位符可以使用1-4个，其他占位符可以使用1-2个，如果实际结果值长度大于占位符的长度，则显示值实际结果值，如果小于，则前置用0补足
   */
  static options = {
    name: 'format-date',
    debug: false,
    // date: Date.now(), //
    format: 'mm:ss'
  }

  /**
   * 构造函数
   *
   * @see FormatDate.options
   *
   * @param {object} options - 其他配置选项见{@link FormatDate.options}
   */
  constructor(options) {
    this.$options = {
      ...FormatDate.options,
      ...options
    }

    this._logger = new Logger({
      name: this.$options.name,
      debug: this.$options.debug
    })
  }

  /**
   * 获取日期时间格式化后的日期时间片断数据
   *
   * @since 1.0.0
   *
   * @param {number|string|Date} date - 可以被格式为时间的值
   * @param {string} [format='mm:ss'] - 日期时间格式化字符串
   *
   * @returns {object}
   */
  static getFields(date, format = FormatDate.options.format) {
    if (!validation.isNumber(date) && !validation.isString(date) && !validation.isDate(date)) {
      return this._logger.error('require date option param, please check')
    }

    const endDate = new Date(date) // 目标结束时间
    const startDate = new Date(0) // 计时器用于减去初始日期时间

    const fields = {
      'Y': endDate.getFullYear() - startDate.getFullYear(),
      'M': endDate.getMonth() - startDate.getMonth(),
      'D': endDate.getDate() - startDate.getDate(),
      'h': endDate.getHours(),
      'm': endDate.getMinutes(),
      's': endDate.getSeconds(),
      'S': endDate.getMilliseconds(),
    }

    let formatFields = {}

    Object.entries(DATETIME_PATTERN).forEach(([pattern, dateStr]) => {
      const regexp = new RegExp(pattern + '+')
      const matched = format.match(regexp)

      if (matched) {
        const value = fields[pattern] + ''
        const valueLen = value.length
        const patternLen = matched[0].length
        // 如果指定长度小于要值长度，则显示值长度
        // 如果不足，前置用0补足
        formatFields[dateStr] = patternLen >= valueLen
          ? '0'.repeat(patternLen - valueLen) + value
          : value
      }
    })

    return formatFields
  }

  /**
   * 获取日期时间格式化后的字符串
   *
   * @since 1.0.0
   *
   * @param {number|string|Date|object} dateOrFields - 可以被格式为时间的值，或者已经被提前的日期时间值片断
   * @param {string} [format='mm:ss'] - 日期时间格式化字符串
   *
   * @returns {string}
   */
  static toString(dateOrFields, format = FormatDate.options.format) {
    let data = validation.isPlainObject(dateOrFields)
      ? dateOrFields
      : FormatDate.getFields(dateOrFields, format)

    Object.entries(DATETIME_PATTERN).forEach(([pattern, dateStr]) => {
      const regexp = new RegExp((pattern + '+'))
      format = format.replace(regexp, data[dateStr])
    })

    return format
  }

  /**
   * 日志打印器，方便调试
   *
   * @since 1.0.0
   *
   * @private
   */
  _logger = undefined

  /**
   * 实例初始配置项
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {object}
   */
  $options = undefined

  /**
   * 获取实例的日期时间片断数据
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {object}
   */
  get $data() {
    return FormatDate.getFields(this.$date, this.$format)
  }

  /**
   * 获取实例的日期时间配置项
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {object}
   */
  get $date() {
    return this.$options.date
  }

  /**
   * 获取实例的日期时间格式化字符串配置项
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {string}
   */
  get $format() {
    return this.$options.format
  }

  /**
   * 日期时间数据转换成字符串
   *
   * @since 1.0.0
   *
   * @returns {string}
   */
  toString() {
    return FormatDate.toString(this.$data, this.$format)
  }
}

export default FormatDate