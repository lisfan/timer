# Timer 计时器

## Feature 特性
- 可检测到时间流速不正常，如待机、休眠、或者切换了浏览器标签，造成进程挂起，计时不准确时，自动修正时间流速错误，调整回正确的时间
- 支持不同两种计时模式，：递增计时和递减计时（倒计时），默认为倒计时
- 计时时间戳选项接收值单位为毫秒，且是除以1000弃余后的整数，即超出时会向下取整
- 提供妙表记录功能
- 暂不支持毫秒计时

## 安装

```bash
npm install -S @~lisfan/timer
```

## Usage 起步

``` js
import Timer from '@~lisfan/timer'

const timer = new Timer({
   timeStamp: 1 * 10 * 1000, // 创建一个10秒的计时器
})

// 开始计时
timer.start((timer) => {
    console.log('每秒执行一次该回调',timer.$datetime)
}).then(() => {
    console.log('计时结束')
}).catch(() => {
    console.log('中途造成计时中断')
})

// 计时暂停并开始
timer.stop()
// 计时继续
timer.start().then(...).catch(...)

// 计时复位并开始
timer.reset()
// 计时开始
timer.start().then(...).catch(...)

// 计时当前值记录
timer.record()

```