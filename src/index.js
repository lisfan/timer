/**
 * 计时器
 *
 * @version 1.1.0
 */

import validation from '@~lisfan/validation'
import Logger from '@~lisfan/logger'
import FormatDate from './utils/format-date'

// 计时模式类型可选值
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
   * 向下取整时间戳，调整指定时间的时间戳
   * @param {number} [timeStamp=Date.now()] - 时间戳
   * @returns {number} - 返回向下取整后的时间戳
   */
  timeStamp(timeStamp = Date.now()) {
    return Math.floor(timeStamp / 1000) * 1000
  },
  /**
   * 格式化时间
   * @param {Timer} self - timer实例
   * @returns {FormatDate} - formatDate实例
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
 * 计时器类
 * @class
 */
export default class Timer {
  /**
   * 构造函数
   * @param {object} options - 计时器配置参数
   * @param {number} options.timeStamp - 计时时间戳，毫秒旱位，且必须毫秒数为1000单位，不能是1234这样，超出时会自动向下取整
   * @param {boolean} [options.debug] - 是否开启日志调试模式，默认关闭
   * @param {string} [options.format='HH:mm'] - 日期时间格式
   * @param {boolean} [options.mode=false] - 是否为正计时模式，false表示倒计时
   */
  constructor(options) {
    this._logger = new Logger({
      name: 'timer',
      debug: options.debug
    })

    if (!options.timeStamp) {
      this._logger.error('require timeStamp option param, please check!')
    }

    const ctor = this.constructor

    this.$status = 'prepare'
    this.$options = {
      ...ctor.options,
      ...options
    }

    // 当前时间戳
    this.$remainTimeStamp = _actions.timeStamp(this.$options.timeStamp)

    // 当前倒计时过去的时间戳
    this.$throughTimeStamp = 0

    // 当前倒计时间字符串
    // 如果是倒计时，则将当前的时间设置为最大值
    this._formatDate = _actions.formatDate(this)
  }

  /**
   * 配置参数
   * @static
   * @enum
   */
  static options = {
    // timeStamp: undefined, // 必须
    debug: false, // 是否开启调试模式
    format: 'mm:ss', // 格式化匹配模式
    mode: '-', // 计时模式，代表倒计时的可选值请参考MODE_TYPE
  }

  /**
   * 更改默认配置参数
   * @static
   * @param {object} [options] - 配置对象
   */
  static config(options) {
    const ctor = this

    ctor.options = {
      ...ctor.options,
      ...options
    }
  }

  // 实例配置参数，取默认值
  $options = undefined // 计时器配置选项
  $status = undefined // 计时器当前状态
  $timeouter = undefined // 计时器延迟ID
  $timeZoneTimeStamp = new Date().getTimezoneOffset() * 1000 * 60 // 当前地区的偏移时区时间戳
  $remainTimeStamp = undefined // 计时器剩余计时时间戳
  $throughTimeStamp = undefined // 计时器已经过的时间戳
  $startTimeStamp = undefined // 计时器开始计时时间戳
  $stopTimeStamp = undefined // 计时器暂停计时时间戳
  $endTimeStamp = undefined // 计时器开始计时起 => 计时器完成时的一轮周期计时时间戳
  $currentTimeStamp = undefined // 当前时间的时间戳，用于修正计时器在空间维度中出现异常流逝的时间戳
  $stopwatch = [] // 计时器暂停的妙表功能
  _logger = undefined // 日志打印器，方便调试
  _formatDate = undefined // 日期时间格式化实例

  /**
   * 获取实例调式模式是否启用
   *
   * @returns {string} - 返回实例调式模式是否启用
   */
  get $debug() {
    return this._logger.$debug
  }

  /**
   * 设置实例调式模式是否启用
   *
   * @readonly
   */
  set $debug(value) {
    this._logger.$debug = value
  }

  /**
   * 获取计时时间戳
   *
   * @returns {string} - 返回计时时间戳
   */
  get $timeStamp() {
    return this.$options.timeStamp
  }

  /**
   * 设置计时时间戳
   *
   * @readonly
   */
  set $timeStamp(value) {
  }

  /**
   * 获取实例日期格式化格式
   *
   * @returns {string} - 返回实例日期格式化格式
   */
  get $format() {
    return this.$options.format
  }

  /**
   * 设置实例日期格式化格式
   *
   * @readonly
   */
  set $format(value) {
  }

  /**
   * 获取计时模式
   *
   * @returns {string} - 返回计时模式
   */
  get $mode() {
    return MODE_TYPE[this.$options.mode]
  }

  /**
   * 设置计时模式
   *
   * @readonly
   */
  set $mode(value) {
  }

  /**
   * 获取日期时间字符串
   *
   * @returns {string} - 返回日期时间字符串
   */
  get $datetime() {
    return this._formatDate.toString()
  }

  /**
   * 设置日期时间字符串
   *
   * @readonly
   */
  set $datetime(value) {
  }

  /**
   * 获取倒计时各具体的日期时间数据
   *
   * @returns {string} - 返回倒计时各具体的日期时间数据
   */
  get $fields() {
    return this._formatDate.$fields
  }

  /**
   * 获取倒计时各具体的日期时间数据
   *
   * @readonly
   */
  set $fields(value) {
  }

  /**
   * 倒计时开始
   * 倒计时结束后进入resolve，倒计时在未结束前中途造成暂停，会触发reject
   * @param {function} callback - 倒计时每秒执行的回调函数
   * @returns {Promise} 返回promise对象
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
   * 秒表记录停止（时间不会停目）
   * @returns {Timer} 返回实例自身
   */
  record() {
    // 秒表记录
    this.$stopwatch.push(this.$datetime)
    return this
  }

  /**
   * 计时器停止
   * @returns {Timer} 返回实例自身
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
   * @returns {Timer} 返回实例自身
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
