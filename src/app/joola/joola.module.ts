import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AddArchiveComponent } from './add-archive/add-archive';
import { ArcChartComponent } from './arc-chart/arc-chart';
import { ArcProgressComponent } from './arc-progress/arc-progress';
import { PlanStatusComponent } from './plan-status/plan-status';
import { UserPlansComponent } from './user-plans/user-plans';

const routes: Routes = [
    {
        path: '',
        component: UserPlansComponent,
        pathMatch: 'full'
    },
    {
        path: 'add-archive',
        component: AddArchiveComponent
    }
];

const declarations = [
    UserPlansComponent,
    ArcChartComponent,
    ArcProgressComponent,
    PlanStatusComponent,
    AddArchiveComponent
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations
})
export class JoolaModule {}
