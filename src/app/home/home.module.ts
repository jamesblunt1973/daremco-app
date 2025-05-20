import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { GalleryComponent } from './gallery/gallery.component';
import { HomePage } from './home.page';
import { MaterialsChartComponent } from './materials-chart/materials-chart.component';
import { MessageComponent } from './message/message.component';
import { PaletteComponent } from './palette/palette.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { ProductComponent } from './product/product.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [
    {
        path: '',
        component: HomePage
    }
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [
        HomePage,
        UpdateComponent,
        GalleryComponent,
        ProductComponent,
        MessageComponent,
        PaletteComponent,
        MaterialsChartComponent,
        PieChartComponent
    ]
})
export class HomePageModule {}
