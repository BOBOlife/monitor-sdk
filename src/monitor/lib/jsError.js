import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";
import tracker from "../utils/tracker";

export function injectJsError() {
  console.log("----------injectJsError----------");
  // 监听全局未捕获的错误
  window.addEventListener("error", (event) => {
    const lastEvent = getLastEvent(); // 最后一个交互事件
    console.log("errorEvent:>>", lastEvent.composedPath(), lastEvent.path);
    console.log("lastEvent:", lastEvent);
    // 创建一个 报错信息对象存放需要的值
    const log = {
      kind: "stability", // 监控指标的大类
      type: "error", //小类
      errorType: "jsError", // js执行错误
      url: "", // 访问的哪个路径报错
      message: event.message, // 报错信息
      filename: event.filename, // 哪个文件保错
      position: `${event.lineno}:${event.colno}`, //报错行列 位置
      stack: getLines(event.error.stack), // 错误的堆栈
      selector: lastEvent ? getSelector(lastEvent.composedPath()) : "", // 代表最后一个操作的元素
    };
    console.log("errorInfo:>>", log);
    tracker.send(log);
  });
}

function getLines(stack) {
  return stack
    .split("\n")
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ""))
    .join("^");
}
