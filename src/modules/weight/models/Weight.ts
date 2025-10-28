export class Weight {
  id: string;
  date: Date;
  pounds: number;

  constructor(id: string, date: Date, pounds: number) {
    this.id     = id;
    this.date   = new Date(date);
    this.pounds = pounds;
  }
}