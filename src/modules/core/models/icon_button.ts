
import { MatColor } from "../enums/mat_color";
import { EventActions } from "../enums/event_actions";

export class Button {

  name : EventActions;
  color: MatColor = MatColor.primary;
  icon : Icon = new Icon("bug", MatColor.primary, 24);
  label: string = "";

  currentColors : IconColors = new IconColors(MatColor.transparent, MatColor.transparent);
  initialColors: IconColors = new IconColors(MatColor.transparent, MatColor.transparent);
  disabled      : boolean;


  activateDurationMs: number = 0;

  constructor(name: EventActions) {
    this.name          = name;
    this.currentColors = new IconColors(MatColor.warn, MatColor.warn);
    this.disabled      = false;
  }

  setColor(color: MatColor) {
    this.currentColors.background = color;
    return this;
  }

  setIcon(name: string, color: MatColor, size: number = 24) {
    this.currentColors.text = color;
    this.icon               = new Icon(name, color, size);
    return this;
  }

  disable(): Button {
    if (this.initialColors == undefined){
      this.initialColors = new IconColors(this.currentColors.background, this.currentColors.text)
    }

    this.currentColors.background = MatColor.transparent;
    this.currentColors.text       = MatColor.disabled;
    return this;
  }

  enable(): Button {
    this.currentColors.background = this.initialColors.background;
    this.currentColors.text       = this.initialColors.text;
    return this;
  }

  enableHold(activateDurationMs: number){
    this.activateDurationMs = activateDurationMs;
    return this;
  }

}



export class IconColors {
  background: MatColor;
  text      : MatColor;

  constructor(background: MatColor, text: MatColor) {
    this.background = background;
    this.text       = text;
  }
}





export class Icon {
  name : string   = "bug";
  color: MatColor = MatColor.warn;
  size : number   = 24;

  constructor(name: string, color: MatColor, size: number = 24) {
    this.name  = name;
    this.color = color;
    this.size  = size;
  }

  setName(name: string): Icon {
    this.name = name;
    return this;
  }

  setColor(color: MatColor): Icon {
    this.color = color;
    return this;
  }
}