/**
 * @file 计时器
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.1.2
 * @licence MIT
 */

import validation from '@~lisfan/validation'
import Logger from '@~lisfan/logger'

import FormatDate from './format-date'
import MODE_TYPE from './enums/mode-type'

/**
 * 私有行为
 * @private
 */
const _actions = {
  /**
   * 返回向下取整后的时间戳
   *
   * @since 1.1.0
   *
   * @param {number} [timeStamp=Date.now()] - 时间戳
   *
   * @returns {number}
   */
  timeStamp(timeStamp = Date.now()) {
    return Math.floor(timeStamp / 1000) * 1000
  },
  /**
   * 格式化时间，返回formatDate实例
   *
   * @since 1.1.0
   *
   * @param {Timer} self - timer实例
   *
   * @returns {FormatDate}
   */
  formatDate(self) {
    const date = self.$mode === '+'
      ? (self.$options.timeStamp - self.$remainTimeStamp) + self.$timeZoneTimeStamp
      : self.$remainTimeStamp + self.$timeZoneTimeStamp

    return new FormatDate({
      name: self._logger.$name,
      debug: self._logger.$debug,
      date,
      format: self.$format
    })
  }
}

/**
 * @classdesc
 * 计时类
 *
 * @class
 */
class Timer {
  /**
   * 默认配置选项
   *
   * @since 1.0.0
   *
   * @static
   * @readonly
   * @memberOf Timer
   *
   * @type {object}
   * @property {string} name='timer' - 日志器命名空间
   * @property {boolean} debug=false - 调试模式
   * @property {string} format='mm:ss' -
   *   日期时间格式化字符串，支持使用字母占位符匹配对应的年月日时分秒：Y=年、M=月、D=日、h=时、m=分、s=秒、ms=毫秒，年和毫秒字母占位符可以使用1-4个，其他占位符可以使用1-2个，如果实际结果值长度大于占位符的长度，则显示值实际结果值，如果小于，则前置用0补足
   * @property {string} mode='-' - 计时模式类型，可选值请参考 {@link MODE_TYPE}
   */
  static options = {
    // timeStamp: undefined, // 必须
    name: 'timer',
    debug: false, // 开启调试模式
    format: 'mm:ss', // 日期时间格式化字符串
    mode: '-', // 计时模式
  }

  /**
   * 更新默认配置选项
   *
   * @since 1.0.0
   *
   * @see Timer.options
   *
   * @param {object} options - 其他配置选项见{@link Timer.options}
   *
   * @returns {Timer}
   */
  static config(options) {
    Timer.options = {
      ...Timer.options,
      ...options
    }

    return this
  }

  /**
   * 构造函数
   *
   * @see Timer.options
   *
   * @param {object} options - 其他配置选项见{@link Timer.options}
   * @param {number} options.timeStamp - 剩余计时时间戳，毫秒单位，且毫秒数必须为1000单位，不能是1234这样，超出时会自动向下取整
   */
  constructor(options) {
    this.$options = {
      ...Timer.options,
      ...options
    }

    this._logger = new Logger({
      name: this.$options.name,
      debug: this.$options.debug
    })

    if (!this.$options.timeStamp) {
      return this._logger.error('require timeStamp option param, please check!')
    }

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
   * 日志打印器，方便调试
   *
   * @since 1.0.0
   *
   * @private
   */
  _logger = undefined

  /**
   * 日期时间格式化实例
   *
   * @since 1.0.0
   *
   * @private
   */
  _formatDate = undefined

  /**
   * 延迟计时器ID
   *
   * @since 1.0.0
   *
   * @private
   */
  _timeouter = undefined

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
   * 实例状态，可能处于以下状态：prepare=准备创段、processing=进行中、finished=已完成、stoped=暂停中
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {string}
   */
  $status = undefined

  /**
   * 当前地区的偏移时区时间戳
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {number}
   */
  $timeZoneTimeStamp = new Date().getTimezoneOffset() * 1000 * 60
  /**
   * 剩余计时时间戳
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {number}
   */
  $remainTimeStamp = undefined
  /**
   * 已经过的时间戳
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {number}
   */
  $throughTimeStamp = undefined

  /**
   * 开始计时时间戳
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {number}
   */
  $startTimeStamp = undefined

  /**
   * 暂停计时时间戳
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {number}
   */
  $stopTimeStamp = undefined

  /**
   * 计时器开始计时起 => 计时器完成时的一轮周期计时时间戳
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {number}
   */
  $endTimeStamp = undefined
  /**
   * 当前时间的时间戳，用于修正计时器在空间维度中出现异常流逝的时间戳
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {number}
   */
  $currentTimeStamp = undefined

  /**
   * 计时器每次记录的妙表功能
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {string[]}
   */
  $stopwatch = []

  /**
   * 获取实例的计时时间戳配置项
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {number}
   */
  get $timeStamp() {
    return this.$options.timeStamp
  }

  /**
   * 获取实例的日期时间格式化配置项
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
   * 获取实例的计时模式配置项
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {string}
   */
  get $mode() {
    return MODE_TYPE[this.$options.mode]
  }

  /**
   * 获取实例的日期时间字符串值
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {string}
   */
  get $datetime() {
    return this._formatDate.toString()
  }

  /**
   * 获取实例的日期时间数据片断
   *
   * @since 1.1.0
   *
   * @getter
   * @readonly
   *
   * @type {object}
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
   * 计时器开始计时
   * 计时器结束后进入resolved状态
   * 若在未结束前中途造成暂停，会触发rejectd状态
   *
   * @since 1.0.0
   *
   * @async
   *
   * @param {function} callback - 每秒执行的回调函数
   *
   * @returns {Promise}
   */
  start(callback) {
    return new Promise((resolve, reject) => {
      this.$status = 'processing'

      // 记录启动时间时间戳
      this.$startTimeStamp = _actions.timeStamp()

      // 设置结束时间戳
      this.$endTimeStamp = this.$startTimeStamp + this.$remainTimeStamp

      // 计时函数
      const ticktick = () => {
        // 如果当前已暂停，则停止倒计时
        if (this.$status !== 'processing') {
          return reject(this.$status)
        }

        // 当前的超时时间戳（当currentTimeStamp不在startTimeStamp和endTmeStamp内时，说明已超时）
        // 倒计时也可能在一些途中超时挂起，导致倒计时没有再走下去，所以每次需要重新捕获
        this.$currentTimeStamp = _actions.timeStamp()

        this.$remainTimeStamp -= 1000
        this.$throughTimeStamp += 1000

        this._logger.log('tick tick...', ((this.$throughTimeStamp / 1000) ) + 's')

        if (this.$currentTimeStamp > (this.$startTimeStamp + this.$throughTimeStamp)) {
          this._logger.log('超过时间流速，自动修正!')
          // 超过的时间流速
          const lostTime = this.$currentTimeStamp - this.$startTimeStamp
          this.$remainTimeStamp = this.$options.timeStamp - lostTime - 1000
          this.$throughTimeStamp = lostTime + 1000
        }

        // 计时时间已到达
        if (this.$remainTimeStamp < 0) {
          this.$remainTimeStamp = 0
          this.$throughTimeStamp = this.$endTimeStamp - this.$startTimeStamp
        }

        this._formatDate = _actions.formatDate(this)

        // 优先执行回调
        validation.isFunction(callback) && callback.call(this)

        /* eslint-enable max-len*/
        if (this._timeouter && this.$currentTimeStamp >= this.$endTimeStamp) {
          clearTimeout(this._timeouter)
          this._timeouter = undefined

          this.$status = 'finished'
          resolve(this.$status)
        } else {
          this._timeouter = setTimeout(() => {
            ticktick()
          }, 1000)
        }
      }

      this._timeouter = setTimeout(() => {
        ticktick()
      }, 1000)
    })
  }

  /**
   * 秒表：记录触发该操作的计时结果，保存结果的值将根据当前实例的format格式化
   *
   * @since 1.1.0
   *
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
   *
   * @returns {Timer}
   */
  stop() {
    clearTimeout(this._timeouter)
    this._timeouter = undefined

    this.$status = 'stoped'
    this.$stopTimeStamp = _actions.timeStamp()

    return this
  }

  /**
   * 计时器复位
   *
   * @since 1.0.0
   *
   * @returns {Timer}
   */
  reset() {
    clearTimeout(this._timeouter)
    this._timeouter = undefined

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