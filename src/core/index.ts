import { DefaultOptons, Options, TrackerConfig } from "../types/index";
import { createHistoryEvent } from "../utils/pv";

export default class Tracker {
  public data: Options;
  constructor(options: Options) {
    this.data = Object.assign(this.initDef(), options);
    this.installTracker();
  }

  private initDef(): DefaultOptons {
    window.history["pushState"] = createHistoryEvent("pushState");
    window.history["replaceState"] = createHistoryEvent("replaceState");

    return <DefaultOptons>{
      sdkVersion: TrackerConfig.version,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
    };
  }

  public setUserId<T extends DefaultOptons["uuid"]>(uuid: T) {
    this.data.uuid = uuid;
  }

  public setExtra<T extends DefaultOptons["extra"]>(extra: T) {
    this.data.extra = extra;
  }

  public sendTracker<T>(data: T) {
    this.reportTracker(data);
  }

  private captureEvent<T>(
    mouseEventList: string[],
    targetKey: string,
    data?: T
  ) {
    mouseEventList.forEach((event) =>
      window.addEventListener(event, () => {
        this.reportTracker({ event, targetKey, data });
      })
    );
  }

  private installTracker() {
    if (this.data.historyTracker)
      this.captureEvent(
        ["pushState", "replaceState", "popstate"],
        "history-pv"
      );

    if (this.data.hashTracker) this.captureEvent(["hashchange"], "hash-pv");
  }

  private reportTracker<T>(data: T) {
    const params = Object.assign(this.data, data, {
      time: new Date().getTime(),
    });
    let headers = { type: "application/x-www-form-urlencoded" };
    let blob = new Blob([JSON.stringify(params)], headers);
    navigator.sendBeacon(this.data.requestUrl, blob);
  }
}
