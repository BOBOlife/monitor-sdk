let host = "cn-shanghai.log.aliyuncs.com"; // 主机
let project = "monitor-sdk"; // 项目名
let logstore = "monitor-store"; // 存储名
let userAgent = require("user-agent");

function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent).name,
  };
}

class SendTracker {
  constructor() {
    this.url = `http://${project}.${host}/logstores/${logstore}/track`; // 上报的路径
    this.xhr = new XMLHttpRequest();
  }
  send(data = {}) {
    let extraData = getExtraData();
    let log = { ...data, ...extraData };
    // 阿里云要求值不能为数字
    for (const key in log) {
      if (typeof log[key] === "number") {
        log[key] = `${log[key]}`;
      }
    }
    console.log("log", log);
    // 接入日志系统，此处以阿里云为例
    let body = JSON.stringify({
      __logs__: [log],
    });
    this.xhr.open("POST", this.url, true);
    this.xhr.setRequestHeader("Content-Type", "application/json"); // 请求体类型
    this.xhr.setRequestHeader("x-log-apiversion", "0.6.0"); // 版本号
    this.xhr.setRequestHeader("x-log-bodyrawsize", body.length); // 请求体的大小
    this.xhr.onload = function () {
      // console.log(this.xhr.response);
    };
    this.xhr.onerror = function (error) {
      console.log(error);
    };
    this.xhr.send(body);
  }
}

export default new SendTracker();
