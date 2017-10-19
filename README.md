# Timer 计时器

## Feature 特性
- 可检测到时间流速不正常时（如待机、休眠、或者切换了tab），造成进程挂起，计时不准确，该模块会自动修正时间流速的错误，将其调整回正确的时间
- 支持不同的计时模式，：递增计时和递减计时（倒计时），默认倒计时
- 计时时间戳选项接收值单位为毫秒，且是/1000后的整数，超出时会向下取整
- 提供妙表功能
- 暂不支持毫秒计时


## Usage 起步

``` js
import Timer from '@~lisfan/timer'

const timer = new Timer({
   timeStamp: 1 * 10 * 1000,
})

// 倒计时开始
timer.start((timerInstance) => {
    console.log('每秒执行一次该回调',timerInstance.$datetime)
}).then(() => {
    console.log('倒计时结束')
}).catch(() => {
    console.log('中途造成计时中断')
})
```