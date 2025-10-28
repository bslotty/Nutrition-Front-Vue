export class Sort {
  enumList: any; //   Generic Enum List
  active: number; //  Enum Index
  direction: SortDirection;
  
  // Aliases for FilterBar compatibility
  get columns(): any {
    return this.enumList;
  }
  
  set columns(value: any) {
    this.enumList = value;
  }
  
  get activeColumn(): number {
    return this.active;
  }
  
  set activeColumn(value: number) {
    this.active = value;
  }

  constructor(active: number, direction: SortDirection, enumList?: any) {
    this.enumList  = enumList == undefined ? SortDefaultEnum : enumList;
    this.active    = active;
    this.direction = direction;
  }

  setDirection(direc: SortDirection): Sort {
    this.direction = direc;
    return this;
  }

  toggleDirection() {
    switch (this.direction) {
      case SortDirection.Asc:
        this.setDirection(SortDirection.Desc);
        break;
      case SortDirection.Desc:
        this.setDirection(SortDirection.Asc);
        break;
      case SortDirection.None:
        this.setDirection(SortDirection.Asc);
        break;
    }
  }

  directionToString(): "" | "asc" | "desc" {
    return this.direction == SortDirection.Asc ? "asc" : "desc";
  }
}

export enum SortDirection {
  None,
  Asc,
  Desc,
}

export enum SortDefaultEnum {
  Created,
}