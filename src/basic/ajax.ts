export function xhrRequest(
  url: string,
  data?: any,
  option?: {
    method: string;
  },
) {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    const method = option?.method ?? "GET";
    xhr.open(method, url, true);
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        // console.log(this.response);
        res(this.response);
      } else {
        // console.error(this.statusText);
        rej(this.statusText);
      }
    };
    xhr.onerror = function () {
      rej(this.statusText);
    };
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json"); // 设置 Content-Type
    xhr.setRequestHeader("Accept", "application/json");
    if(data){
      data=JSON.stringify(data)
    }
    xhr.send(data);

  });
}
