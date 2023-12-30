import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// connection components
import { ConnectionsComponent } from './connections.component';
import { MapViewComponent } from './map-view/map-view.component';
import { ListViewComponent } from './list-view/list-view.component';
import { C_IMPORTS } from './connections.config';

const routes: Routes = [
  {
    path: '',
    component: ConnectionsComponent,
  },
  {
    path: 'new-farmer',
    loadComponent: () =>
      import('./new-connection-farmer/new-connection-farmer.component').then(
        n => n.NewConnectionFarmerComponent
      ),
  },
  {
    path: 'new-company',
    loadComponent: () =>
      import('./new-connection-company/new-connection-company.component').then(
        n => n.NewConnectionCompanyComponent
      ),
  },
];

@NgModule({
  declarations: [ListViewComponent, MapViewComponent, ConnectionsComponent],
  imports: [RouterModule.forChild(routes), ...C_IMPORTS],
})
export class ConnectionsModule {}
