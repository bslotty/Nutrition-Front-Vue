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

    const terms = this.search.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);

    if (terms.length === 0) return list;

    const filtered = list.filter((item: any) => {
      // Search only in name and brand fields
      const searchableText = `${item.name || ''} ${item.brand || ''}`.toLowerCase();
      const matches = terms.every(term => searchableText.indexOf(term) > -1);
      return matches;
    });

    return filtered;
  }

  sortList<T>(list: T[]): T[] {
    if (!this.sort || !this.sort.enumList || this.sort.active === undefined) {
      return list;
    }

    const cols = this.sort.enumList;
    const fieldName = Object.keys(cols).find(
      key => cols[key] === this.sort.active && isNaN(Number(key))
    );

    if (!fieldName) {
      return list;
    }

    const sorted = [...list].sort((a: any, b: any) => {
      let aVal = a[fieldName];
      let bVal = b[fieldName];
      
      // If undefined, try nested property (nutrients.protein, serving.size, etc)
      if (aVal === undefined && a.nutrients && a.nutrients[fieldName] !== undefined) {
        aVal = a.nutrients[fieldName];
        bVal = b.nutrients[fieldName];
      }

      // Handle null/undefined values
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      
      switch (typeof aVal) {
        case "string":
          comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
          break;

        case "object":
          if (aVal instanceof Date && bVal instanceof Date) {
            comparison = aVal.getTime() - bVal.getTime();
          } else {
            comparison = aVal > bVal ? 1 : -1;
          }
          break;

        default:
          comparison = aVal - bVal;
          break;
      }

      return this.sort.direction === SortDirection.Asc ? comparison : -comparison;
    });
    
    return sorted;
  }

  filterDateRange<T>(list: T[], sortFieldName: string): T[] {
    if (!this.range || !this.range.active) return list;

    return list.filter((item: any) => {
      let d = item[sortFieldName];
      let entryTime = d.getTime();
      let start = new Date(this.range?.start == undefined ? "" : this.range.start).getTime();
      let end = new Date(this.range?.end == undefined ? "" : this.range.end).getTime();
      return entryTime >= start && entryTime <= end;
    });
  }

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
    return `${date.toISOString().substring(0, 10)}`;
  }

  displaySearchTerm(): string {
    return this.toTitleCase(this.search);
  }
}