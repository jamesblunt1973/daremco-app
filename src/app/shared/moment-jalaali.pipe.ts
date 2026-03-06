import { Pipe, PipeTransform } from '@angular/core';
import { PersianDateAdapter } from './persian-date.adapter';

@Pipe({
    name: 'momentJalaali',
    standalone: false
})
export class MomentJalaaliPipe implements PipeTransform {
    private readonly adapter = new PersianDateAdapter();

    public transform(value: unknown, format = 'jYYYY/jMM/jDD'): string {
        const date = this.adapter.deserialize(value);

        if (!date) {
            return '';
        }

        return this.adapter.format(date, format);
    }
}
