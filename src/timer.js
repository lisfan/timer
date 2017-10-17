/* eslint-disable require-jsdoc */
/**
 * 计时器
 *
 * 模块性质：工具模块
 * 作用范围：pc、mobile
 * 依赖模块：utils/format-date，utils/logger
 * 来源项目：扫码点单H5
 * 初始发布日期：2017-05-24 20:00
 * 最后更新日期：2017-05-25 20:00
 *
 * ## 特性
 * - 可检测到时间流速不正常时（如休眠），会自动调整理回正确的时间
 * - 计时器每秒都会可执行一个回调（但不包括最后执行完成时的一个回调，需要通过resolve触发），执行不同的业务逻辑
 * - 返回Promise对象用于操作计时器结束时的回调
 * - 支持递增计时和倒计时（默认）
 * - 时间戳接收值单位为毫秒数，且是1000/单位的整，超出时会向下取整
 * - 会自动抵减时区（比如除了的毫秒数是0，北京时间即08:00:00，会抵减8小时，成00:00:00）
 * - 提供类似码表保存每次触发stop()的时间戳的功能
 *
 * ## Changelog
 * ### 2017.05.29
 * - [feature] 增加递增计时功能
 * - [fix] 修复计时器开始时，回调延迟一秒触发的bug
 *
 * ### 2017.05.28
 * - 某些情况下创建的vue实例未绑定$route属性时的路由名称取值
 *
 * ## Usage
 * ``` js
 * import Timer from 'utils/timer'
 *
 * // 实例化
 * const timer = new Timer({
 *    timeStamp:10*1000
 * })
 *
 * // 倒计时开始
 * timer.start((timerInstance) => {
 *     global.log('每秒执行一次该回调',timerInstance.$datetime)
 * }).then(() => {
 *     global.log('倒计时结束')
 * }).catch(() => {
 *     global.log('中途造成计时中断')
 * })
 *
 * // 倒计时暂停
 * timer.stop().then((timerInstance) => {
 *     global.log('倒计时已暂停')
 * })
 *
 * // 倒计时重置
 * timer.reset().then((timerInstance) => {
 *     global.log('倒计时已重置')
 * })
 * ```
 * @since 3.0.0
 * @version 1.1.0
 */

import formatDate from './format-date'
import Logger from '@~lisfan/logger'

/**
 * 计时器类
 * @class Timer
 */
export default class Timer {
  // 实例配置参数，取默认值
  $options = undefined // 计时器配置选项
  $status = undefined // 计时器当前状态
  $datetime = undefined  // 计时器文本
  $timeouter = undefined // 计时器延迟ID
  $timeZone = undefined // 用户所在时区
  $remainTimeStamp = undefined // 计时器剩余计时时间戳
  $throughTimeStamp = undefined // 计时器已经过的时间戳
  $startTimeStamp = undefined // 计时器开始计时时间戳
  $endTimeStamp = undefined // 计时器开始计时起=>计时器完成时的一轮周期计时时间戳
  $currentTimeStamp = undefined // 当前时间空间维度中正常流逝的时间戳，用于板正流逝的时间
  $stopwatch = [] // 计时器暂停的码表功能
  _logger = undefined // 日志打印器，方便调试

  /**
   * 构造函数
   * @param {object} options - 计时器配置参数
   * @param {number|string} options.timeStamp - 计时时间戳，毫秒旱位，且必须毫秒数为1000单位，不能是1234这样，超出时会自动向下取整
   * @param {boolean} [options.debug] - 是否开启日志调试模式，默认关闭
   * @param {string} [options.format='HH:mm'] - 日期时间格式
   * @param {boolean} [options.isIncrease=false] - 是否为正计时模式，false表示倒计时
   */
  constructor(options) {
    this.$status = 'prepare'
    this.$options = Object.assign({}, Timer.options, options)

    this._logger = new Logger({
      name: 'timer',
      debug: this.$options.debug
    })

    if (!this.$options.timeStamp) {
      this._logger.error('require timeStamp option param, please check!')
    }

    // 当前时间戳
    this.$remainTimeStamp = Math.floor(Number(this.$options.timeStamp) / 1000) * 1000
    // 当前倒计时过去的时间戳
    this.$throughTimeStamp = 0
    // 当前地区的偏移时区
    this.$timeZone = new Date().getTimezoneOffset() * 1000 * 60

    // 当前倒计时间字符串
    // 如果是倒计时，则将当前的时间设置为最大值
    if (this.$options.isIncrease) {
      this.$datetime = formatDate(0, this.$options.format)
    } else {
      this.$datetime = formatDate(this.$remainTimeStamp - this.$timeZone, this.$options.format)
    }
  }

  /**
   * 配置参数
   * @static
   * @enum
   */
  static options = {
    debug: false, // 是否开启调试模式
    timeStamp: undefined,
    format: 'mm:ss',
    isIncrease: false
  }

  /**
   * 更改默认配置参数
   * @static
   *
   * @param {object} [options={}] - 配置对象
   */
  static config(options = {}) {
    Object.assign(Timer.options, options)
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
      // 计时器开始走的这一刻记录当前时间戳
      this.$startTimeStamp = Math.floor(Date.now() / 1000) * 1000
      // 标记倒计时结束的时间戳
      this.$endTimeStamp = this.$startTimeStamp + this.$remainTimeStamp

      const dingdong = () => {
        // 优先执行回调
        if (typeof callback === 'function') {
          callback(this)
        }

        // 如果当前已暂停，则停止倒计时
        if (this.$status === 'stop') {
          return reject(this)
        }

        // 当前的超时时间戳（当currentTimeStamp不在startTimeStamp和endTmeStamp内时，说明已超时）
        // 倒计时也可能在一些途中超时挂起，导致倒计时没有再走下去，所以每次需要重新捕获
        this.$currentTimeStamp = Math.floor(Date.now() / 1000) * 1000

        this._logger.log('currentTimeStamp', new Date(this.$currentTimeStamp).toLocaleString())
        this._logger.log('startTimeStamp', new Date(this.$startTimeStamp).toLocaleString())
        this._logger.log('throughTimeStamp', this.$throughTimeStamp / 1000 + 's')

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

        // 时间已达到最大值，
        if (this.$remainTimeStamp < 0) {
          this.$remainTimeStamp = 0
          this.$throughTimeStamp = this.$endTimeStamp - this.$startTimeStamp
        }

        if (this.$options.isIncrease) {
          /* eslint-disable max-len*/
          this.$datetime = formatDate(this.$options.timeStamp - this.$remainTimeStamp - this.$timeZone, this.$options.format)
        } else {
          const a = this.$remainTimeStamp + this.$timeZone
          console.log('1111', a)
          console.log('222', formatDate(a, this.$options.format))
          this.$datetime = formatDate(this.$remainTimeStamp - this.$timeZone, this.$options.format)
        }
        /* eslint-enable max-len*/

        if (this.$timeouter && this.$currentTimeStamp >= this.$endTimeStamp - 1000) {
          clearTimeout(this.$timeouter)
          this.$timeouter = undefined

          this.$status = 'finished'
          resolve(this)
        } else {
          this.$timeouter = setTimeout(() => {
            dingdong()
          }, 1000)
        }
      }

      dingdong()
    })
  }

  /**
   * 计时器停止
   * @returns {Promise} 返回Promise对象
   */
  stop() {
    clearTimeout(this.$timeouter)
    this.$timeouter = undefined
    this.$status = 'stoped'

    // 记录秒表
    this.$stopwatch.push(this.$datetime)

    return Promise.resolve(this)
  }

  /**
   * 计时器复位
   * @returns {Promise} 返回Promise对象
   */
  reset() {
    clearTimeout(this.$timeouter)
    this.$timeouter = undefined

    this.$status = 'prepare'

    this.$remainTimeStamp = this.$options.timeStamp
    this.$startTimeStamp = Math.floor(Date.now() / 1000) * 1000

    if (this.$options.isIncrease) {
      this.$datetime = formatDate(1, this.$options.format)
    } else {
      this.$datetime = formatDate(this.$remainTimeStamp - this.$timeZone, this.$options.format)
    }

    return Promise.resolve(this)
  }
}
