import { EventActions } from "../enums/event_actions";
import { MatColor } from "../enums/mat_color";
import { Button } from "./icon_button";
import { SortDirection } from "./sort";

export class SortOption {
  field_name: string;
  buttons: Button[] = [];
  direction: SortDirection = SortDirection.None;

  asc         = new Button(EventActions.sortAsc, MatColor.transparent, "chevron-up", MatColor.primary);
  asc_active  = new Button(EventActions.sortAsc, MatColor.accent, "chevron-up", MatColor.light);
  desc        = new Button(EventActions.sortDesc, MatColor.transparent, "chevron-down", MatColor.primary);
  desc_active = new Button(EventActions.sortDesc, MatColor.warn, "chevron-down", MatColor.light);

  constructor(name: string) {
    this.field_name = name;
    this.setDirection(SortDirection.None);
    this.setButtons();
  }

  setButtons(): SortOption {
    switch (this.direction) {
      case SortDirection.Asc:
        this.buttons = [this.asc_active, this.desc];
        break;

      case SortDirection.Desc:
        this.buttons = [this.asc, this.desc_active];
        break;

      case SortDirection.None:
        this.buttons = [this.asc, this.desc];
        break;
    }
    return this;
  }

  setDirection(direc: SortDirection): SortOption {
    this.direction = direc;
    this.setButtons();
    return this;
  }

  toggleDirection() {
    switch (this.direction) {
      case SortDirection.Asc:
        this.setDirection(SortDirection.Desc);
        break;
      case SortDirection.Desc:
        this.setDirection(SortDirection.None);
        break;
      case SortDirection.None:
        this.setDirection(SortDirection.Asc);
        break;
    }
  }
}
