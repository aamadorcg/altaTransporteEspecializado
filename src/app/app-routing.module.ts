import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AltaTransporteEspecializado } from './components/alta-transporte-especializado/alta-transporte-especializado.component';


const routes: Routes = [
  {
    path: 'alta-vehiculo-especializado-fisica',
    component: AltaTransporteEspecializado,
    data: {tipo: 'F'}
  },
  {
    path: 'alta-vehiculo-especializado-moral',
    component: AltaTransporteEspecializado,
    data: {tipo: 'M'}
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'alta-vehiculo-especializado-fisica'
  },
  {
    path: '**',
    redirectTo: 'alta-vehiculo-especializado-fisica'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
