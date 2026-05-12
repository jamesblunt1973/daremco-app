/**
 * A single tie unit produced by parsing the flat `data` array of a weave plan.
 *
 * `position` is the index in the raw `data` array of the unit's *end* tie
 * (i.e. the same value that gets persisted as `UserPlan.position`).
 */
export interface WeaveUnit {
    raj: number;
    color: number;
    tieStart: number;
    tieEnd: number;
    position: number;
    isInterval: boolean;
}

const MARK_RAJ = -1;
const MARK_COLOR = -2;
const MARK_INTERVAL = -3;

/**
 * Parses the flat weave data array into a list of `WeaveUnit`s and centralizes
 * navigation through the script so the rest of the app does not have to walk
 * the raw array (and re-implement its bound checks) over and over.
 *
 * The flat encoding uses three sentinel values:
 *   -1: the *next* item is a raj number (start of a new row).
 *   -2: the *next* item is a color number (start of a color block).
 *   -3: the *previous* item is the start of an interval, the *next* item is
 *       the end of that interval.
 *   anything else: a tie (gereh) position.
 *
 * Example: `[-1, 1, -2, 12, 231, 235, 250, -3, 255]`
 *   raj 1, color 12, ties at 231, 235, and the interval 250-255.
 */
export class WeaveScript {
    public readonly units: readonly WeaveUnit[];
    private readonly positionToIndex = new Map<number, number>();

    public constructor(public readonly data: readonly number[]) {
        this.units = WeaveScript.parse(data);
        this.units.forEach((u, i) => this.positionToIndex.set(u.position, i));
    }

    private static parse(data: readonly number[]): WeaveUnit[] {
        const units: WeaveUnit[] = [];
        let raj = 0;
        let color = 0;
        let i = 0;
        while (i < data.length) {
            const e = data[i];
            if (e === MARK_RAJ) {
                if (i + 1 < data.length) {
                    raj = data[i + 1];
                    color = 0;
                }
                i += 2;
            } else if (e === MARK_COLOR) {
                if (i + 1 < data.length) {
                    color = data[i + 1];
                }
                i += 2;
            } else {
                let tieEnd = e;
                let position = i;
                if (data[i + 1] === MARK_INTERVAL && i + 2 < data.length) {
                    tieEnd = data[i + 2];
                    position = i + 2;
                    i += 3;
                } else {
                    i += 1;
                }
                units.push({
                    raj,
                    color,
                    tieStart: e,
                    tieEnd,
                    position,
                    isInterval: e !== tieEnd
                });
            }
        }
        return units;
    }

    public unitAt(index: number): WeaveUnit | null {
        if (index < 0 || index >= this.units.length) {
            return null;
        }
        return this.units[index];
    }

    public indexOfPosition(position: number): number {
        return this.positionToIndex.get(position) ?? -1;
    }

    /** First unit of the next raj after `index`, or null at end of script. */
    public nextRaj(index: number): WeaveUnit | null {
        const cur = this.unitAt(index);
        if (!cur) {
            return this.unitAt(0);
        }
        for (let i = index + 1; i < this.units.length; i++) {
            if (this.units[i].raj !== cur.raj) {
                return this.units[i];
            }
        }
        return null;
    }

    /** First unit of the previous raj relative to `index`, or null at start. */
    public prevRaj(index: number): WeaveUnit | null {
        const cur = this.unitAt(index);
        if (!cur) {
            return null;
        }
        let i = index - 1;
        while (i >= 0 && this.units[i].raj === cur.raj) {
            i--;
        }
        if (i < 0) {
            return null;
        }
        const targetRaj = this.units[i].raj;
        while (i > 0 && this.units[i - 1].raj === targetRaj) {
            i--;
        }
        return this.units[i];
    }

    /** First unit of the next color block within the current raj. */
    public nextColor(index: number): WeaveUnit | null {
        const cur = this.unitAt(index);
        if (!cur) {
            return null;
        }
        for (let i = index + 1; i < this.units.length; i++) {
            const u = this.units[i];
            if (u.raj !== cur.raj) {
                return null;
            }
            if (u.color !== cur.color) {
                return u;
            }
        }
        return null;
    }

    /** First unit of the previous color block within the current raj. */
    public prevColor(index: number): WeaveUnit | null {
        const cur = this.unitAt(index);
        if (!cur) {
            return null;
        }
        let i = index - 1;
        while (i >= 0 && this.units[i].raj === cur.raj && this.units[i].color === cur.color) {
            i--;
        }
        if (i < 0 || this.units[i].raj !== cur.raj) {
            return null;
        }
        const targetColor = this.units[i].color;
        while (
            i > 0 &&
            this.units[i - 1].raj === cur.raj &&
            this.units[i - 1].color === targetColor
        ) {
            i--;
        }
        return this.units[i];
    }

    public findRaj(raj: number): WeaveUnit | null {
        return this.units.find(u => u.raj === raj) ?? null;
    }

    public findColorInRaj(raj: number, color: number): WeaveUnit | null {
        return this.units.find(u => u.raj === raj && u.color === color) ?? null;
    }

    public findTieInRaj(raj: number, tie: number): WeaveUnit | null {
        return this.units.find(u => u.raj === raj && tie >= u.tieStart && tie <= u.tieEnd) ?? null;
    }
}
