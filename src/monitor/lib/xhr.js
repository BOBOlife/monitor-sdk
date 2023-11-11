import tracker from "../utils/tracker";
export default function injectXHR() {
  const XMLHttpRequest = window.XMLHttpRequest;
  const oldOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, async) {
    // 把上报接口过滤掉
    if (!url.match(/logstores/)) {
      this.logData = { method, url, async };
    }
    return oldOpen.apply(this, arguments);
  };
  let oldSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (body) {
    if (this.logData) {
      let startTime = Date.now(); // 发送前记录一下开始的时间
      // XMLHttpRequest readyState 01234
      // status 2xx 304 成功 其它就是失败

      let handler = (type) => (event) => {
        // 持续时间
        let duration = Date.now() - startTime;
        let status = this.status;
        let statusText = this.statusText;
        tracker.send({
          kind: "stability",
          type: "xhr",
          eventType: type,
          pathname: this.logData.url, //请求路径
          status: status + "-" + statusText, // 状态码
          duration,
          response: this.response ? JSON.stringify(this.response) : "", // 响应体
          params: body || "", // 入参
        });
      };
      this.addEventListener("load", handler("load"), false);
      this.addEventListener("error", handler, false);
      this.addEventListener("abort", handler, false);
    }
    return oldSend.apply(this, arguments);
  };
}
