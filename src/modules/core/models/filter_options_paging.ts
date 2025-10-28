export class FilterOptionsPaging {
  enabled      : boolean = false;
  start        : number  = 0;
  length       : number  = 7;
  current_page: number   = 1;
  page_limit   : number  = 0;
  total_items : number   = 0;
  excluded    : number   = 0;

  constructor() {}

  filter<T>(list: T[]): T[] {
    let visible_items = list.filter((a, i) => i < this.length * this.current_page && i > this.length * this.current_page - this.length);

    this.total_items = list.length;

    if (list.length != visible_items.length) {
      this.excluded = list.length - visible_items.length;
      this.page_limit = Math.ceil(list.length / this.length);
    } else {
      this.excluded = 0;
    }

    return visible_items;
  }

  prevResults() {
    if (this.current_page != 1) {
      this.current_page = this.current_page - 1;
    }
  }

  nextResults() {
    this.page_limit = Math.ceil(this.total_items / this.length);

    if (this.current_page < this.page_limit) {
      this.current_page = this.current_page + 1;
    }
  }
}
