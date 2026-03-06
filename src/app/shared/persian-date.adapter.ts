import { Injectable } from '@angular/core';

export const PERSIAN_DATE_FORMATS = {
    parse: {
        dateInput: 'jYYYY/jMM/jDD'
    },
    display: {
        dateInput: 'jYYYY/jMM/jDD',
        monthYearLabel: 'jYYYY jMMMM',
        dateA11yLabel: 'jYYYY/jMM/jDD',
        monthYearA11yLabel: 'jYYYY jMMMM'
    }
};

export interface PersianDateParts {
    year: number;
    month: number;
    day: number;
}

const PERSIAN_MONTHS_LONG = [
    '\u0641\u0631\u0648\u0631\u062f\u06cc\u0646',
    '\u0627\u0631\u062f\u06cc\u0628\u0647\u0634\u062a',
    '\u062e\u0631\u062f\u0627\u062f',
    '\u062a\u06cc\u0631',
    '\u0645\u0631\u062f\u0627\u062f',
    '\u0634\u0647\u0631\u06cc\u0648\u0631',
    '\u0645\u0647\u0631',
    '\u0622\u0628\u0627\u0646',
    '\u0622\u0630\u0631',
    '\u062f\u06cc',
    '\u0628\u0647\u0645\u0646',
    '\u0627\u0633\u0641\u0646\u062f'
];

const PERSIAN_MONTHS_SHORT = [...PERSIAN_MONTHS_LONG];

const WEEK_DAYS_LONG = [
    '\u06cc\u06a9\u0634\u0646\u0628\u0647',
    '\u062f\u0648\u0634\u0646\u0628\u0647',
    '\u0633\u0647\u200c\u0634\u0646\u0628\u0647',
    '\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647',
    '\u067e\u0646\u062c\u0634\u0646\u0628\u0647',
    '\u062c\u0645\u0639\u0647',
    '\u0634\u0646\u0628\u0647'
];

const WEEK_DAYS_SHORT = [
    '\u06cc\u06a9\u200c\u0634',
    '\u062f\u0648\u0634',
    '\u0633\u0647\u200c\u0634',
    '\u0686\u0647\u0627\u0631\u0634',
    '\u067e\u0646\u062c\u200c\u0634',
    '\u062c\u0645\u0639\u0647',
    '\u0634\u0646\u0628\u0647'
];

const WEEK_DAYS_NARROW = ['\u06cc', '\u062f', '\u0633', '\u0686', '\u067e', '\u062c', '\u0634'];

interface GregorianDate {
    gy: number;
    gm: number;
    gd: number;
}

@Injectable({ providedIn: 'root' })
export class PersianDateAdapter {
    private readonly locale = 'fa-IR-u-ca-persian';

    public getYear(date: Date): number {
        return this.getParts(date).year;
    }

    public getMonth(date: Date): number {
        return this.getParts(date).month - 1;
    }

    public getDate(date: Date): number {
        return this.getParts(date).day;
    }

    public getDayOfWeek(date: Date): number {
        return date.getDay();
    }

    public getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        switch (style) {
            case 'long':
                return [...PERSIAN_MONTHS_LONG];
            case 'short':
                return [...PERSIAN_MONTHS_SHORT];
            case 'narrow':
                return PERSIAN_MONTHS_LONG.map(monthName => monthName[0]);
            default:
                return [...PERSIAN_MONTHS_LONG];
        }
    }

    public getDateNames(): string[] {
        return Array.from({ length: 31 }, (_, i) => `${i + 1}`);
    }

    public getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        switch (style) {
            case 'long':
                return [...WEEK_DAYS_LONG];
            case 'short':
                return [...WEEK_DAYS_SHORT];
            case 'narrow':
                return [...WEEK_DAYS_NARROW];
            default:
                return [...WEEK_DAYS_LONG];
        }
    }

    public getYearName(date: Date): string {
        return `${this.getYear(date)}`;
    }

    public getFirstDayOfWeek(): number {
        return 6;
    }

    public getNumDaysInMonth(date: Date): number {
        const { year, month } = this.getParts(date);
        return this.jalaaliMonthLength(year, month);
    }

    public clone(date: Date): Date {
        return new Date(date.getTime());
    }

    public createDate(year: number, month: number, date: number): Date {
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }

        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }

        const maxDay = this.jalaaliMonthLength(year, month + 1);
        if (date > maxDay) {
            throw Error(`Invalid date ${date} for month with index ${month}.`);
        }

        const result = this.jalaliToGregorianDate(year, month + 1, date);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    public today(): Date {
        return new Date();
    }

    public parse(value: unknown, parseFormat: string | string[] = PERSIAN_DATE_FORMATS.parse.dateInput): Date | null {
        if (!value) {
            return null;
        }

        if (value instanceof Date) {
            return this.isValid(value) ? this.clone(value) : null;
        }

        if (typeof value === 'number') {
            const date = new Date(value);
            return this.isValid(date) ? date : null;
        }

        if (typeof value !== 'string') {
            return null;
        }

        const formats = Array.isArray(parseFormat) ? parseFormat : [parseFormat];
        const rawValue = value.trim();

        for (const format of formats) {
            const parsed = this.parseJalaliString(rawValue, format.trim());
            if (parsed) {
                return parsed;
            }
        }

        const fallback = new Date(rawValue);
        return this.isValid(fallback) ? fallback : null;
    }

    public format(date: Date, displayFormat: string): string {
        const clonedDate = this.clone(date);
        if (!this.isValid(clonedDate)) {
            throw Error('PersianDateAdapter: Cannot format invalid date.');
        }

        return this.formatWithPattern(clonedDate, displayFormat);
    }

    public addCalendarYears(date: Date, years: number): Date {
        const { year, month, day } = this.getParts(date);
        const targetYear = year + years;
        const clampedDay = Math.min(day, this.jalaaliMonthLength(targetYear, month));
        return this.jalaliToGregorianDate(targetYear, month, clampedDay);
    }

    public addCalendarMonths(date: Date, months: number): Date {
        const { year, month, day } = this.getParts(date);
        const monthOffset = month - 1 + months;
        const targetYear = year + Math.floor(monthOffset / 12);
        let targetMonth = monthOffset % 12;

        if (targetMonth < 0) {
            targetMonth += 12;
        }

        const targetMonthOneBased = targetMonth + 1;
        const clampedDay = Math.min(day, this.jalaaliMonthLength(targetYear, targetMonthOneBased));
        return this.jalaliToGregorianDate(targetYear, targetMonthOneBased, clampedDay);
    }

    public addCalendarDays(date: Date, days: number): Date {
        const clonedDate = this.clone(date);
        clonedDate.setDate(clonedDate.getDate() + days);
        return clonedDate;
    }

    public toIso8601(date: Date): string {
        return this.clone(date).toISOString();
    }

    public isDateInstance(obj: unknown): boolean {
        return obj instanceof Date;
    }

    public isValid(date: Date): boolean {
        return !Number.isNaN(date.getTime());
    }

    public invalid(): Date {
        return new Date(Number.NaN);
    }

    public deserialize(value: unknown): Date | null {
        if (!value) {
            return null;
        }

        if (value instanceof Date) {
            return this.isValid(value) ? this.clone(value) : null;
        }

        if (typeof value === 'number') {
            const date = new Date(value);
            return this.isValid(date) ? date : null;
        }

        if (typeof value === 'string') {
            return this.parse(value);
        }

        return null;
    }

    private getParts(date: Date): PersianDateParts {
        const formatter = new Intl.DateTimeFormat(this.locale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            numberingSystem: 'latn'
        });

        const parts = formatter.formatToParts(date);
        const yearPart = parts.find(part => part.type === 'year')?.value;
        const monthPart = parts.find(part => part.type === 'month')?.value;
        const dayPart = parts.find(part => part.type === 'day')?.value;

        if (!yearPart || !monthPart || !dayPart) {
            throw Error('Cannot extract Persian date parts.');
        }

        return {
            year: Number(yearPart),
            month: Number(monthPart),
            day: Number(dayPart)
        };
    }

    private parseJalaliString(value: string, format: string): Date | null {
        if (format !== 'jYYYY/jMM/jDD' && format !== 'jYYYY-jMM-jDD') {
            return null;
        }

        const separator = format.includes('/') ? '/' : '-';
        const segments = value.split(separator).map(segment => segment.trim());

        if (segments.length !== 3) {
            return null;
        }

        const jy = Number(segments[0]);
        const jm = Number(segments[1]);
        const jd = Number(segments[2]);

        if (!Number.isInteger(jy) || !Number.isInteger(jm) || !Number.isInteger(jd)) {
            return null;
        }

        if (jm < 1 || jm > 12) {
            return null;
        }

        const maxDay = this.jalaaliMonthLength(jy, jm);
        if (jd < 1 || jd > maxDay) {
            return null;
        }

        return this.jalaliToGregorianDate(jy, jm, jd);
    }

    private formatWithPattern(date: Date, pattern: string): string {
        const { year, month, day } = this.getParts(date);

        const map: Record<string, string> = {
            jYYYY: String(year),
            jYY: String(year).slice(-2),
            jMMMM: PERSIAN_MONTHS_LONG[month - 1],
            jMM: String(month).padStart(2, '0'),
            jM: String(month),
            jDD: String(day).padStart(2, '0'),
            jD: String(day)
        };

        return pattern.replace(/jYYYY|jYY|jMMMM|jMM|jM|jDD|jD/g, token => map[token]);
    }

    private jalaaliMonthLength(jy: number, jm: number): number {
        if (jm <= 6) {
            return 31;
        }

        if (jm <= 11) {
            return 30;
        }

        return this.isLeapJalaaliYear(jy) ? 30 : 29;
    }

    private isLeapJalaaliYear(jy: number): boolean {
        return this.jalCal(jy).leap === 0;
    }

    private jalaliToGregorianDate(jy: number, jm: number, jd: number): Date {
        const { gy, gm, gd } = this.d2g(this.j2d(jy, jm, jd));
        return new Date(gy, gm - 1, gd);
    }

    private jalCal(jy: number): { leap: number; gy: number; march: number } {
        const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
        const bl = breaks.length;
        const gy = jy + 621;
        let leapJ = -14;
        let jp = breaks[0];
        let jm = 0;
        let jump = 0;

        if (jy < jp || jy >= breaks[bl - 1]) {
            throw new Error(`Invalid Jalaali year ${jy}`);
        }

        for (let i = 1; i < bl; i += 1) {
            jm = breaks[i];
            jump = jm - jp;
            if (jy < jm) {
                break;
            }
            leapJ += this.div(jump, 33) * 8 + this.div(this.mod(jump, 33), 4);
            jp = jm;
        }

        let n = jy - jp;
        leapJ += this.div(n, 33) * 8 + this.div(this.mod(n, 33) + 3, 4);
        if (this.mod(jump, 33) === 4 && jump - n === 4) {
            leapJ += 1;
        }

        const leapG = this.div(gy, 4) - this.div((this.div(gy, 100) + 1) * 3, 4) - 150;
        const march = 20 + leapJ - leapG;

        if (jump - n < 6) {
            n = n - jump + this.div(jump + 4, 33) * 33;
        }

        let leap = this.mod(this.mod(n + 1, 33) - 1, 4);
        if (leap === -1) {
            leap = 4;
        }

        return { leap, gy, march };
    }

    private j2d(jy: number, jm: number, jd: number): number {
        const r = this.jalCal(jy);
        return this.g2d(r.gy, 3, r.march) + (jm - 1) * 31 - this.div(jm, 7) * (jm - 7) + jd - 1;
    }

    private d2g(jdn: number): GregorianDate {
        let j = 4 * jdn + 139361631;
        j += this.div(this.div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
        const i = this.div(this.mod(j, 1461), 4) * 5 + 308;
        const gd = this.div(this.mod(i, 153), 5) + 1;
        const gm = this.mod(this.div(i, 153), 12) + 1;
        const gy = this.div(j, 1461) - 100100 + this.div(8 - gm, 6);
        return { gy, gm, gd };
    }

    private g2d(gy: number, gm: number, gd: number): number {
        const d = this.div((gy + this.div(gm - 8, 6) + 100100) * 1461, 4);
        const d2 = this.div(153 * this.mod(gm + 9, 12) + 2, 5) + gd - 34840408;
        const d3 = this.div(this.div(gy + 100100 + this.div(gm - 8, 6), 100) * 3, 4) + 752;
        return d + d2 - d3;
    }

    private div(a: number, b: number): number {
        return Math.floor(a / b);
    }

    private mod(a: number, b: number): number {
        return a - Math.floor(a / b) * b;
    }
}

// Backward-compat alias for existing imports.
export class MaterialPersianDateAdapter extends PersianDateAdapter {}
