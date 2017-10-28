/**
 * @file 计时器
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.1.0
 * @licence MIT
 */

import validation from '@~lisfan/validation'
import Logger from '@~lisfan/logger'
import FormatDate from './utils/format-date'

/**
 * 计时模式类型的可选值可以是如下几种
 *
 * @since 1.1.0
 * @readonly
 * @property {string} +='+' - 正序计时模式可选值
 * @property {string} inc='+' - 正序计时模式可选值
 * @property {string} increse='+' - 正序计时模式可选值
 * @property {string} plus='+' - 正序计时模式可选值
 * @property {string} asc='+' - 正序计时模式可选值
 * @property {string} \-='-' - 倒序计时模式可选值
 * @property {string} dec='-' - 倒序计时模式可选值
 * @property {string} decrese='-' - 倒序计时模式可选值
 * @property {string} reduce='-' - 倒序计时模式可选值
 * @property {string} desc='-' - 倒序计时模式可选值
 */
const MODE_TYPE = {
  '+': '+',
  'inc': '+',
  'increse': '+',
  'plus': '+',
  'asc': '+',
  '-': '-',
  'dec': '-',
  'decrese': '-',
  'reduce': '-',
  'desc': '-',
}

/**
 * 私有行为
 * @private
 */
const _actions = {
  /**
   * 返回向下取整后的时间戳
   * @param {number} [timeStamp=Date.now()] - 时间戳
   * @returns {number}
   */
  timeStamp(timeStamp = Date.now()) {
    return Math.floor(timeStamp / 1000) * 1000
  },
  /**
   * 格式化时间，返回formatDate实例
   * @param {Timer} self - timer实例
   * @returns {FormatDate}
   */
  formatDate(self) {
    const format = self.$options.format
    let date

    if (this.$mode === '+') {
      date = (self.$options.timeStamp - self.$remainTimeStamp) + self.$timeZoneTimeStamp
    } else {
      date = self.$remainTimeStamp + self.$timeZoneTimeStamp
    }

    return new FormatDate({
      date,
      format
    })
  }
}

/**
 * @classdesc 计时类
 * @class
 */
class Timer {
  /**
   * 默认配置选项
   *
   * @since 1.0.0
   * @static
   * @memberOf Timer
   * @property {boolean} debug=false - 调试模式
   * @property {string} format='mm:ss' - 日期时间格式化字符串
   * @property {string} mode=- - 计时模式类型，可选值请参考 {@link MODE_TYPE}
   */
  static options = {
    // timeStamp: undefined, // 必须
    debug: false, // 开启调试模式
    format: 'mm:ss', // 日期时间格式化字符串
    mode: '-', // 计时模式
  }

  /**
   * 更新默认配置选项
   *
   * @since 1.0.0
   * @static
   * @param {object} options - 配置选项
   * @param {boolean} [options.debug] - 调试模式
   * @param {string} [options.format] - 日期时间格式化字符串
   * @param {string} [options.mode] - 计时模式类型，可选值请参考 {@link MODE_TYPE}
   */
  static config(options) {
    const ctor = this

    ctor.options = {
      ...ctor.options,
      ...options
    }
  }

  /**
   * 构造函数
   *
   * @param {object} options - 配置选项
   * @param {number} options.timeStamp - 剩余计时时间戳，毫秒单位，且毫秒数必须为1000单位，不能是1234这样，超出时会自动向下取整
   * @param {boolean} [options.debug] - 调试模式
   * @param {string} [options.format] -
   *   日期时间格式化字符串，支持使用字母占位符匹配对应的年月日时分秒：Y=年、M=月、D=日、h=时、m=分、s=秒、ms=毫秒，年和毫秒字母占位符可以使用1-4个，其他占位符可以使用1-2个，如果实际结果值长度大于占位符的长度，则显示值实际结果值，如果小于，则前置用0补足
   * @param {string} [options.mode] - 计时模式类型，可选值请参考 {@link MODE_TYPE}
   */
  constructor(options) {
    if (!options.timeStamp) {
      throw new error('require timeStamp option param, please check!')
    }

    const ctor = this.constructor

    this.$options = {
      ...ctor.options,
      ...options
    }

    this._logger = new Logger({
      name: 'timer',
      debug: this.$options.debug
    })

    this.$status = 'prepare'

    // 当前时间戳
    this.$remainTimeStamp = _actions.timeStamp(this.$options.timeStamp)

    // 当前倒计时过去的时间戳
    this.$throughTimeStamp = 0

    // 当前倒计时间字符串
    // 如果是倒计时，则将当前的时间设置为最大值
    this._formatDate = _actions.formatDate(this)
  }

  /**
   * 实例配置项
   *
   * @since 1.0.0
   * @readonly
   */
  $options = undefined

  /**
   * 实例状态，可能处于以下状态：prepare=准备创段、processing=进行中、finished=已完成、stoped=暂停中
   *
   * @since 1.0.0
   * @readonly
   */
  $status = undefined
  /**
   * 延迟计时器ID
   *
   * @since 1.0.0
   * @readonly
   */
  $timeouter = undefined
  /**
   * 当前地区的偏移时区时间戳
   *
   * @since 1.0.0
   * @readonly
   */
  $timeZoneTimeStamp = new Date().getTimezoneOffset() * 1000 * 60
  /**
   * 剩余计时时间戳
   *
   * @since 1.0.0
   * @readonly
   */
  $remainTimeStamp = undefined
  /**
   * 已经过的时间戳
   *
   * @since 1.0.0
   * @readonly
   */
  $throughTimeStamp = undefined

  /**
   * 开始计时时间戳
   *
   * @since 1.0.0
   * @readonly
   */
  $startTimeStamp = undefined

  /**
   * 暂停计时时间戳
   *
   * @since 1.0.0
   * @readonly
   */
  $stopTimeStamp = undefined

  /**
   * 计时器开始计时起 => 计时器完成时的一轮周期计时时间戳
   *
   * @since 1.0.0
   * @readonly
   */
  $endTimeStamp = undefined
  /**
   * 当前时间的时间戳，用于修正计时器在空间维度中出现异常流逝的时间戳
   *
   * @since 1.0.0
   * @readonly
   */
  $currentTimeStamp = undefined

  /**
   * 计时器每次记录的妙表功能
   *
   * @since 1.0.0
   * @readonly
   */
  $stopwatch = []

  /**
   * 日志打印器，方便调试
   *
   * @since 1.0.0
   * @private
   */
  _logger = undefined

  /**
   * 日期时间格式化实例
   *
   * @since 1.0.0
   * @private
   */
  _formatDate = undefined

  /**
   * 获取实例的调试配置项
   *
   * @since 1.0.0
   * @getter
   * @returns {string}
   */
  get $debug() {
    return this._logger.$debug
  }

  /**
   * 设置实例的调试配置项
   *
   * @since 1.0.0
   * @setter
   * @param {boolean} value - 是否启用
   */
  set $debug(value) {
    this._logger.$debug = value
  }

  /**
   * 获取实例的计时时间戳配置项
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $timeStamp() {
    return this.$options.timeStamp
  }

  /**
   * 设置实例的计时时间戳配置项
   *
   * @since 1.0.0
   * @setter
   * @ignore
   */
  set $timeStamp(value) {
  }

  /**
   * 获取实例的日期时间格式化配置项
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $format() {
    return this.$options.format
  }

  /**
   * 设置实例的日期时间格式化配置项
   *
   * @since 1.0.0
   * @setter
   * @readonly
   * @ignore
   */
  set $format(value) {
  }

  /**
   * 获取实例的计时模式配置项
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $mode() {
    return MODE_TYPE[this.$options.mode]
  }

  /**
   * 设置实例的计时模式配置项
   *
   * @since 1.0.0
   * @setter
   * @ignore
   */
  set $mode(value) {
  }

  /**
   * 获取实例的日期时间字符串值
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $datetime() {
    return this._formatDate.toString()
  }

  /**
   * 设置实例的日期时间字符串值
   *
   * @since 1.0.0
   * @setter
   * @ignore
   */
  set $datetime(value) {
  }

  /**
   * 获取实例的日期时间数据片断
   *
   * @since 1.1.0
   * @getter
   * @readonly
   * @property {string} [year] - 剩余年数
   * @property {string} [month] - 剩余月数
   * @property {string} [date] - 剩余日数
   * @property {string} [hour] - 剩余时数
   * @property {string} [minute] - 剩余分数
   * @property {string} [second] - 剩余秒数
   * @property {string} [millisecond] - 剩余毫秒数
   */
  get $data() {
    return this._formatDate.$data
  }

  /**
   * 设置实例的日期时间数据片断
   *
   * @since 1.0.0
   * @setter
   * @ignore
   */
  set $data(value) {
  }

  /**
   * 计时器开始计时
   * 计时器结束后进入resolved状态
   * 若在未结束前中途造成暂停，会触发rejectd状态
   *
   * @since 1.0.0
   * @param {function} callback - 每秒执行的回调函数
   * @returns {Promise}
   */
  start(callback) {
    return new Promise((resolve, reject) => {
      this.$status = 'processing'

      // 记录启动时间时间戳
      this.$startTimeStamp = _actions.timeStamp() + 1000

      // 设置结束时间戳
      this.$endTimeStamp = this.$startTimeStamp + this.$remainTimeStamp

      // 计时函数
      const dingdong = () => {
        // 如果当前已暂停，则停止倒计时
        if (this.$status !== 'processing') {
          return reject(this.$status)
        }

        // 当前的超时时间戳（当currentTimeStamp不在startTimeStamp和endTmeStamp内时，说明已超时）
        // 倒计时也可能在一些途中超时挂起，导致倒计时没有再走下去，所以每次需要重新捕获
        this.$currentTimeStamp = _actions.timeStamp()

        // this._logger.log('currentTimeStamp', new Date(this.$currentTimeStamp).toLocaleString())
        // this._logger.log('startTimeStamp', new Date(this.$startTimeStamp).toLocaleString())
        this._logger.log('throughTimeStamp', ((this.$throughTimeStamp / 1000) + 1) + 's')

        if (this.$currentTimeStamp > (this.$startTimeStamp + this.$throughTimeStamp)) {
          this._logger.log('超过时间流速，自动修正!')
          // 超过的时间流速
          const lostTime = this.$currentTimeStamp - this.$startTimeStamp
          this.$remainTimeStamp = this.$options.timeStamp - lostTime - 1000
          this.$throughTimeStamp = lostTime + 1000
        } else {
          this.$remainTimeStamp -= 1000
          this.$throughTimeStamp += 1000
        }

        // 计时时间已到达
        if (this.$remainTimeStamp < 0) {
          this.$remainTimeStamp = 0
          this.$throughTimeStamp = this.$endTimeStamp - this.$startTimeStamp
        }

        this._formatDate = _actions.formatDate(this)

        // 优先执行回调
        if (validation.isFunction(callback)) {
          callback.call(this)
        }

        /* eslint-enable max-len*/
        if (this.$timeouter && this.$currentTimeStamp >= this.$endTimeStamp - 1000) {
          clearTimeout(this.$timeouter)
          this.$timeouter = undefined

          this.$status = 'finished'
          resolve(this.$status)
        } else {
          this.$timeouter = setTimeout(() => {
            dingdong()
          }, 1000)
        }
      }

      this.$timeouter = setTimeout(() => {
        dingdong()
      }, 1000)
    })
  }

  /**
   * 秒表：记录触发该操作的计时结果，保存结果的值将根据当前实例的format格式化
   *
   * @since 1.1.0
   * @returns {Timer}
   */
  record() {
    this.$stopwatch.push(this.$datetime)
    return this
  }

  /**
   * 计时器停止
   *
   * @since 1.0.0
   * @returns {Timer}
   */
  stop() {
    clearTimeout(this.$timeouter)
    this.$timeouter = undefined

    this.$status = 'stoped'
    this.$stopTimeStamp = _actions.timeStamp()

    return this
  }

  /**
   * 计时器复位
   *
   * @since 1.0.0
   * @returns {Timer}
   */
  reset() {
    clearTimeout(this.$timeouter)
    this.$timeouter = undefined

    // 秒表复位
    this.$stopwatch = []

    this.$status = 'prepare'

    this.$remainTimeStamp = _actions.timeStamp(this.$options.timeStamp)
    this.$startTimeStamp = undefined
    this.$stopTimeStamp = undefined
    this.$endTimeStamp = undefined
    this.$currentTimeStamp = undefined

    this.$throughTimeStamp = 0

    this._formatDate = _actions.formatDate(this)

    return this
  }
}

export default Timer