import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoadingComponent } from './components/loading/loading.component';

const components = [LoadingComponent];

@NgModule({
    declarations: [...components],
    imports: [CommonModule, FormsModule, IonicModule],
    exports: [CommonModule, FormsModule, IonicModule, components]
})
export class SharedModule {}
