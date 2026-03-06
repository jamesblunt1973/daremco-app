import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { UserPlansComponent } from './user-plans/user-plans';
import { ArcChartComponent } from './arc-chart/arc-chart';
import { ArcProgressComponent } from './arc-progress/arc-progress';

const routes: Routes = [
    {
        path: '',
        component: UserPlansComponent,
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [UserPlansComponent, ArcChartComponent, ArcProgressComponent]
})
export class JoolaModule {}
