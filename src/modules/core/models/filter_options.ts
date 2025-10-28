import { FilterOptionsPaging } from "./filter_options_paging";
import { FilterOptionsRange } from "./filter_options_range";
import { Sort, SortDirection } from "./sort";

export class FilterOptions {
  preset: string = "";
  search: string = "";
  sort: Sort = new Sort(0, SortDirection.Desc);
  range: FilterOptionsRange | undefined;
  page: FilterOptionsPaging;

  constructor() {
    this.page = new FilterOptionsPaging();
  }

  setPreset(preset: string): FilterOptions {
    this.preset = preset;
    return this;
  }

  setSearch(term: string): FilterOptions {
    this.search = term;
    return this;
  }

  setSort(sort: Sort): FilterOptions {
    this.sort = sort;
    return this;
  }

  setRange(range: FilterOptionsRange) {
    this.range = range;
    return this;
  }

  searchList<T>(list: T[]): T[] {
    if (this.search == "") return list;
    
    // Split comma-separated search terms
    const terms = this.search.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    
    if (terms.length === 0) return list;
    
    // Filter items that match ALL search terms
    return list.filter((item) => {
      const itemString = JSON.stringify(item).toLowerCase();
      return terms.every(term => itemString.indexOf(term) > -1);
    });
  }

  sortList<T>(list: T[]): T[] {
    console.log('sortList called with sort object:', this.sort);
    console.log('Direct property access:', {
      enumList: this.sort.enumList,
      active: this.sort.active,
      direction: this.sort.direction,
      columns: this.sort.columns,
      activeColumn: this.sort.activeColumn
    });
    
    if (!this.sort || !this.sort.enumList || this.sort.active === undefined) {
      return list;
    }

    // Get the field name from the enum
    const cols = this.sort.enumList;
    const fieldName = Object.keys(cols).find(
      key => cols[key] === this.sort.active && isNaN(Number(key))
    );


    if (!fieldName) {
      console.warn('Sort field not found for column:', this.sort.active);
      return list;
    }

    // Sort the list
    const sorted = [...list].sort((a: any, b: any) => {
      const aVal = a[fieldName];
      const bVal = b[fieldName];

      // Handle null/undefined values
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Compare based on type
      let comparison = 0;
      
      switch (typeof aVal) {
        case "string":
          comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
          break;

        case "object":
          // Handle Date objects
          if (aVal instanceof Date && bVal instanceof Date) {
            comparison = aVal.getTime() - bVal.getTime();
          } else {
            comparison = aVal > bVal ? 1 : -1;
          }
          break;

        default:
          // Handle numbers and other types
          comparison = aVal - bVal;
          break;
      }

      // Apply direction
      return this.sort.direction === SortDirection.Asc ? comparison : -comparison;
    });
    
    return sorted;
  }

  filterDateRange<T>(list: T[], sortFieldName: string): T[] {
    if (!this.range || !this.range.active) return list;

    return list.filter((item: any) => {
      //  Get Date Field By Name
      let d = item[sortFieldName];
      // console.log("D: ", d);
      // let entryTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      let entryTime = d.getTime();

      //  Get Limits
      let start = new Date(this.range?.start == undefined ? "" : this.range.start).getTime();
      let end = new Date(this.range?.end == undefined ? "" : this.range.end).getTime();

      // console.log(`${start} ${entryTime} ${end}`)

      //  Compare & Return
      return entryTime >= start && entryTime <= end;
    });
  }

  // Angular Pipe Workarounds
  toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  displayPreset(): string {
    return this.toTitleCase(this.preset);
  }

  displayActiveSort(): string {
    return this.toTitleCase(this.sort.enumList[this.sort.active]);
  }

  displayDate(date: Date): string {
    if (!this.range) {
      return `Invalid Start Date`;
    }

    // console.log(date.getDate());

    // let y = date.getFullYear();
    // let m = date.getMonth() + 1 <= 9 
    //   ? "0" + (date.getMonth() + 1) 
    //   : date.getMonth() + 1;
    // let d = date.getDate() + 1 <= 9 
    //   ? "0" + date.getDate() + 1
    //   : date.getDate() + 1;

    // // return `${y}-${m}-${d}`;
    return `${date.toISOString().substring(0, 10)}`;
  }

  displaySearchTerm(): string {
    return this.toTitleCase(this.search);
  }
}