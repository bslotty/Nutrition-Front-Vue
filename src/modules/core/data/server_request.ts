export class ServerRequest {
  //  Request Info
  requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json,text/plain" },
    body: "NOT SET",
  };

  async sendRequest(): Promise<any> {
    return fetch("http://brandonslotty.com/sites/nutrition/api/controller.php", this.requestOptions)
      .then((r) => r.json())
      .then((r) => r[0].data);
  }
}
