import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";
import tracker from "../utils/tracker";

export function injectJsError() {
  console.log("----------injectJsError----------");
  // 监听全局未捕获的错误
  window.addEventListener(
    "error",
    (event) => {
      console.log("xxxxsocket error", event);
      const lastEvent = getLastEvent(); // 最后一个交互事件
      // console.log("errorEvent:>>", lastEvent.composedPath());
      console.log("lastEvent:", lastEvent);
      // 创建一个 报错信息对象存放需要的值
      if (event.target && (event.target.src || event.target.href)) {
        tracker.send({
          kind: "stability", // 监控指标的大类
          type: "error", // 小类型，这是一个错误
          errorType: "resourceError", // js或css 资源加载错误
          filename: event.target.src || event.target.href, // 哪个文件报错了
          tagName: event.target.tagName, // script  link
          selector: getSelector(event.target), // 代表最后一个操作的元素
        });
      } else {
        const log = {
          kind: "stability", // 监控指标的大类
          type: "error", //小类
          errorType: "jsError", // js执行错误
          message: event.message, // 报错信息
          filename: event.filename, // 哪个文件保错
          position: `${event.lineno}:${event.colno}`, //报错行列 位置
          stack: getLines(event.error.stack), // 错误的堆栈
          selector: lastEvent ? getSelector(lastEvent.composedPath()) : "", // 代表最后一个操作的元素
        };
        tracker.send(log);
      }
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      console.log("unhandledrejection-------- ", event);
      let lastEvent = getLastEvent(); // 获取到最后一个交互事件
      let message, filename;
      let line = 0;
      let column = 0;
      let stack = "";
      let reason = event.reason;
      if (typeof reason === "string") {
        // reject 的时候
        message = reason;
      } else if (typeof reason === "object") {
        // 不是reject的时候
        message = reason.message;
        if (reason.stack) {
          let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
          filename = matchResult[1];
          line = matchResult[2];
          column = matchResult[3];
        }
        stack = getLines(reason.stack);
      }
      tracker.send({
        kind: "stability", // 监控指标的大类，稳定性
        type: "error", // 小类型，这是一个错误
        errorType: "promiseError", // promise执行错误
        message, // 报错信息
        filename, // 哪个文件报错了
        position: `${line}:${column}`, // 报错的行列位置
        stack,
        selector: lastEvent ? getSelector(lastEvent.composedPath()) : "", // 代表最后一个操作的元素
      });
    },
    true
  );
}

function getLines(stack) {
  return stack
    .split("\n")
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ""))
    .join("^");
}
