import { ServerRequest } from "@/modules/core/data/server_request";
import { Weight } from "../models/Weight";

export class WeightService extends ServerRequest {
  //  Data
  list: Weight[] = [];
  detail: Weight = new Weight("create", new Date(), 0);

  getListFromServer(start = 0, count = 25): Promise<Weight[]> {
    this.requestOptions.body = JSON.stringify({
      action: "list",
      type  : "Weight",
      start : 0,
      count : 25
    });

    return (
      this.sendRequest()
        .then((r) => r.map((j: any) => new Weight(j.id, j.date, j.pounds)))
        .then((r) => (this.list = r))
        .then((r) => Promise.resolve(r))
    );
  }

  getByID(id: string): Promise<Weight> {
    if (this.list.length <= 0) {
      return this.getFromServerByID(id);
    }

    let Weight = this.list.find((f: Weight) => f.id == id);
    if (Weight == undefined) {
      return this.getFromServerByID(id);
    }

    return Promise.resolve(Weight);
  }

  getFromServerByID(id: string): Promise<Weight> {
    this.requestOptions.body = JSON.stringify({
      action: "detail",
      type  : "Weight",
      object: { id: id },
    });

    return this.sendRequest()
      .then((r) => r.map((j: any) => new Weight(j.id, j.date, j.pounds)))
      .then((r) => Promise.resolve(r[0]));
  }


  create(): Promise<Weight> {
    this.requestOptions.body = JSON.stringify({
      action: "create",
      type  : "Weight",
      object: this.detail,
    });

    return this.sendRequest()
      .then((r) => r.map((j: any) => new Weight(j.id, j.date, j.pounds)))
      .then((r) => Promise.resolve(r[0]));
  }

  update(): Promise<Weight> {
    this.requestOptions.body = JSON.stringify({
      action: "update",
      type  : "Weight",
      object: this.detail,
    });

    return this.sendRequest()
      .then((r) => r.map((j: any) => new Weight(j.id, j.date, j.pounds)))
      .then((r) => Promise.resolve(r[0]));
  }

  delete() {
    this.requestOptions.body = JSON.stringify({
      action: "delete",
      type  : "Weight",
      object: { id: this.detail.id },
    });

    return this.sendRequest()
      .then((r) => Promise.resolve(r));
  }
}
