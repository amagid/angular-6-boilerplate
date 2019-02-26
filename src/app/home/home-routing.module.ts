import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '@app/core';
import { HomeComponent } from './home.component';
import { AuthenticationGuard } from '../core/authentication/authentication.guard';

const routes: Routes = [
  Route.withShell([
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: HomeComponent, canActivate: [AuthenticationGuard], data: { title: extract('Dashboard'), minPermissions: 'viewer' } }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
