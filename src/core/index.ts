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

  private captureEvent<T>(
    mouseEventList: string[],
    targetKey: string,
    data?: T
  ) {
    mouseEventList.forEach((event) =>
      window.addEventListener(event, () => {
        console.log("Tracking!");
      })
    );
  }

  private installTracker() {
    if (this.data.historyTracker)
      this.captureEvent(
        ["pushState", "replaceState", "popstate"],
        "history-pv"
      );
  }
}
