import { Routes } from '@angular/router';
import { Usuarios } from './components/usuarios/usuarios';
import { Proyectos } from './components/proyectos/proyectos';
import { Principal } from './components/principal/principal/principal';
import { Inicio } from './components/inicio/inicio';
import { Cuestionario } from './components/cuestionario/cuestionario';
import { MiPerfil } from './components/mi-perfil/mi-perfil';
import { Layouts } from './layouts/layouts';
import { CrearProyectoComponent } from './components/crear-proyecto/crear-proyecto';
import { CrearEscena } from './components/crear-escena/crear-escena';
import { PresentacionProyecto } from './components/presentacion-proyecto/presentacion-proyecto';
import { ProyectoCompartido } from './components/proyecto-compartido/proyecto-compartido';
import { Favoritos } from './components/favoritos/favoritos';
import { PresentacionProyectoPublico } from './components/presentacion-proyecto-publico/presentacion-proyecto-publico';



export const routes: Routes = [
  { path: 'principal', component: Principal},
  { path: 'cuestionario', component: Cuestionario},
  {
    path: '',
    component: Layouts,
    children: [
      { path: 'inicio', component: Inicio },
      { path: 'proyectos/mis-proyectos', component: Proyectos },
      { path: 'mi-perfil', component: MiPerfil },
      {path: 'proyectos/crear', component:CrearProyectoComponent},
      { path: 'editar-proyecto/:idProyecto', component: CrearEscena },
      { path: 'escena/:idProyecto', component: CrearEscena },
      { path: 'proyectos/presentacion/:idProyecto', component: PresentacionProyecto },
      { path: 'favoritos', component: Favoritos },
      {path: 'presentacion/proyecto/publico/:idProyecto', component:PresentacionProyectoPublico}
    ],
  },
  { path: 'usuarios', component: Usuarios},
  {path: 'proyectos/compartido/:idProyecto',component: ProyectoCompartido},
  { path: '', redirectTo: 'principal', pathMatch: 'full' },
];
