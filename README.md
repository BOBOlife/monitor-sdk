### 概述

> - 为什么要做前端监控
> - 前端监控目标
> - 前端监控流程
> - 编写采集脚本
>   - 日志系统监控
>   - 错误监控
>   - 接口异常
>   - 白屏监控
>   - 加载时间
>   - 性能指标
>   - 卡顿
>   - pv
> - 拓展问题
>   1. 性能监控指标
>   1. 前端怎么做性能监控
>   1. 线上错误监控怎么做
>   1. 导致内存泄漏的方法，怎么监控内存泄漏
>   1. Node 怎么做性能监控

## 1. 为什么要做前端监控

- 更快的发现问题和解决问题
- 做产品的决策依据
- 为业务扩展提供了更多可能性
- 提升前端工程师的技术深度和广度，打造简历亮点

## 2. 前端监控目标

### 2.1 稳定性 stability

- js 错误：js 执行错误、promise 异常
- 资源错误：js、css 资源加载异常
- 接口错误：ajax、fetch 请求接口异常
- 白屏：页面空白

### 2.2 用户体验 experience （根据性能指标 做对应的优化）

- 资源加载速度
- 页面流畅度

### 2.3 业务 business

- pv：页面浏览量和点击量
- uv：访问某个站点的不同 ip 的人数
- 用户在每一个页面的停留时间

## 3. 前端监控流程

1. 前端埋点
2. 数据上报
3. 加工汇总
4. 可视化展示
5. 监控报警

### 3.1 常见的埋点方案

#### 3.1.1 代码埋点

- 嵌入代码的形式
- 优点：精确（任意时刻，数据量全面）
- 缺点：代码工作量点

#### 3.1.2 可视化埋点

- 通过可视化交互的手段，代替代码埋点
- 将业务代码和埋点代码分离，提供一个可视化交互的页面，输入为业务代码，通过这个系统，可以在业务代码中自定义的增加埋点事件等等，最后输出的代码耦合了业务代码和埋点代码
- 用系统来代替手工插入埋点代码

#### 3.1.3 无痕埋点

- 前端的任意一个事件被绑定一个标识，所有的事件都被记录下来
- 通过定期上传记录文件，配合文件解析，解析出来我们想要的数据，并生成可视化报告供专业人员分析
- 无痕埋点的优点是采集全量数据，不会出现漏埋和误埋等现象
- 缺点是给数据传输和服务器增加压力，也无法灵活定制数据结构

---

各公司一般都有自己的日志系统，接收数据上报，例如：阿里云

- navigationStart 初始化页面，在同一个浏览器上下文中前一个页面 unload 的时间戳，如果没有前一个页面的 unload,则与 fetchStart 值相等 |
- redirectStart 第一个 HTTP 重定向发生的时间,有跳转且是同域的重定向,否则为 0
- redirectEnd 最后一个重定向完成时的时间,否则为 0
- fetchStart 浏览器准备好使用 http 请求获取文档的时间,这发生在检查缓存之前
- domainLookupStart DNS 域名开始查询的时间,如果有本地的缓存或 keep-alive 则时间为 0
- domainLookupEnd DNS 域名结束查询的时间
- connectStart TCP 开始建立连接的时间,如果是持久连接,则与`fetchStart`值相等
- secureConnectionStart https 连接开始的时间,如果不是安全连接则为 0
- connectEnd TCP 完成握手的时间，如果是持久连接则与`fetchStart`值相等
- requestStart HTTP 请求读取真实文档开始的时间,包括从本地缓存读取
- requestEnd HTTP 请求读取真实文档结束的时间,包括从本地缓存读取
- responseStart 返回浏览器从服务器收到（或从本地缓存读取）第一个字节时的 Unix 毫秒时间戳
- responseEnd 返回浏览器从服务器收到（或从本地缓存读取，或从本地资源读取）最后一个字节时的 Unix 毫秒时间戳
- unloadEventStart 前一个页面的 unload 的时间戳 如果没有则为 0
- unloadEventEnd 与`unloadEventStart`相对应，返回的是`unload`函数执行完成的时间戳
- domLoading 返回当前网页 DOM 结构开始解析时的时间戳,此时`document.readyState`变成 loading,并将抛出`readyStateChange`事件
- domInteractive 返回当前网页 DOM 结构结束解析、开始加载内嵌资源时时间戳,`document.readyState`  变成`interactive`，并将抛出`readyStateChange`事件(注意只是 DOM 树解析完成,这时候并没有开始加载网页内的资源)
- domContentLoadedEventStart 网页 domContentLoaded 事件发生的时间
- domContentLoadedEventEnd 网页 domContentLoaded 事件脚本执行完毕的时间,domReady 的时间
- domComplete DOM 树解析完成,且资源也准备就绪的时间,`document.readyState`变成`complete`.并将抛出`readystatechange`事件
- loadEventStart load 事件发送给文档，也即 load 回调函数开始执行的时间
- loadEventEnd load 回调函数执行完成的时间

---

| 字段             | 描述                                 | 计算方式                                              | 意义                                                                                                      |
| ---------------- | ------------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| unload           | 前一个页面卸载耗时                   | unloadEventEnd – unloadEventStart                     | -                                                                                                         |
| redirect         | 重定向耗时                           | redirectEnd – redirectStart                           | 重定向的时间                                                                                              |
| appCache         | 缓存耗时                             | domainLookupStart – fetchStart                        | 读取缓存的时间                                                                                            |
| dns              | DNS 解析耗时                         | domainLookupEnd – domainLookupStart                   | 可观察域名解析服务是否正常                                                                                |
| tcp              | TCP 连接耗时                         | connectEnd – connectStart                             | 建立连接的耗时                                                                                            |
| ssl              | SSL 安全连接耗时                     | connectEnd – secureConnectionStart                    | 反映数据安全连接建立耗时                                                                                  |
| ttfb             | Time to First Byte(TTFB)网络请求耗时 | responseStart – requestStart                          | TTFB 是发出页面请求到接收到应答数据第一个字节所花费的毫秒数                                               |
| response         | 响应数据传输耗时                     | responseEnd – responseStart                           | 观察网络是否正常                                                                                          |
| dom              | DOM 解析耗时                         | domInteractive – responseEnd                          | 观察 DOM 结构是否合理，是否有 JS 阻塞页面解析                                                             |
| dcl              | DOMContentLoaded 事件耗时            | domContentLoadedEventEnd – domContentLoadedEventStart | 当 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，无需等待样式表、图像和子框架的完成加载 |
| resources        | 资源加载耗时                         | domComplete – domContentLoadedEventEnd                | 可观察文档流是否过大                                                                                      |
| domReady         | DOM 阶段渲染耗时                     | domContentLoadedEventEnd – fetchStart                 | DOM 树和页面资源加载完成时间，会触发`domContentLoaded`事件                                                |
| 首次渲染耗时     | 首次渲染耗时                         | responseEnd-fetchStart                                | 加载文档到看到第一帧非空图像的时间，也叫白屏时间                                                          |
| 首次可交互时间   | 首次可交互时间                       | domInteractive - fetchStart                           | DOM 树解析完成时间，此时 document.readyState 为 interactive                                               |
| 首包时间耗时     | 首包时间                             | responseStart - domainLookupStart                     | DNS 解析到响应返回给浏览器第一个字节的时间                                                                |
| 页面完全加载时间 | 页面完全加载时间                     | loadEventStart - fetchStart                           | -                                                                                                         |
| onLoad           | onLoad 事件耗时                      | loadEventEnd – loadEventStart                         |

PS： 以上搜集从各大网站收录
