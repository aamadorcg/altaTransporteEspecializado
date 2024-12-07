import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AltaTransporteEspecializado } from './components/alta-transporte-especializado/revista-transporte-especializado.component';


const routes: Routes = [
  {
    path: 'persona-fisica',
    component: AltaTransporteEspecializado,
    data: {tipo: 'F'}
  },
  {
    path: 'persona-moral',
    component: AltaTransporteEspecializado,
    data: {tipo: 'M'}
  },
  {
    path: 'persona-fisica/modificar/:intIdTramite',
    component: AltaTransporteEspecializado,
    data: { tipo: 'F', modo: 'modificar' }
  },
  {
    path: 'persona-moral/modificar/:intIdTramite',
    component: AltaTransporteEspecializado,
    data: { tipo: 'M', modo: 'modificar' }
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'persona-fisica'
  },
  {
    path: '**',
    redirectTo: 'persona-fisica'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
