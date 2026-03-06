import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoadingComponent } from './components/loading/loading.component';
import { MomentJalaaliPipe } from './moment-jalaali.pipe';

const declarations = [LoadingComponent, MomentJalaaliPipe, MomentJalaaliPipe];

@NgModule({
    declarations,
    imports: [CommonModule, FormsModule, IonicModule],
    exports: [CommonModule, FormsModule, IonicModule, ...declarations]
})
export class SharedModule {}
