import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GalleryComponent } from './gallery/gallery.component';
import { HomePage } from './home.page';
import { MessageComponent } from './message/message.component';
import { ProductComponent } from './product/product.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [
    {
        path: '',
        component: HomePage
    }
];

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
    declarations: [HomePage, UpdateComponent, GalleryComponent, ProductComponent, MessageComponent]
})
export class HomePageModule {}
