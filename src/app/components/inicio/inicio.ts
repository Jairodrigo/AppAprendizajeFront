import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environmets/environmet';

//se define que el componente es independiente 
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule], 
  templateUrl: './inicio.html',
  styleUrls:['./inicio.css']
})
export class Inicio implements OnInit {
  //propiedades del componente
  proyectosPublicos: any[] = [];
  
  //inyeccion de dependencias
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);//accedemos a los parametros de la URL
    const usuarioId = params.get("usuarioId");//obtenemos el valor del parametro

    if (usuarioId) {
      localStorage.setItem("usuarioId", usuarioId); //almacenamos el id en localStorage
      console.log("Usuario ID guardado en localStorage:", usuarioId);

      window.history.replaceState({}, document.title, window.location.pathname);//limpiamos la URL(sin mostrar el idUsuario)
    }
    this.cargarProyectosPublicos();
  }

  //navegacion a mi perfil
  goToPerfil() {
    this.router.navigate(['/mi-perfil']);
    console.log("Navegar a Mi Perfil");
  }

  //cierre de sesion
  logout() {
    window.location.href = `${environment.apiUrl}/logout`; 
  }

  cargarProyectosPublicos(): void {
    this.http.get<any[]>(`${environment.apiUrl}/api/proyectos/publicos`).subscribe({
      //si la solicitud fue exitosa
      next: (data) => {
        this.proyectosPublicos = data;
        console.log('Proyectos públicos cargados:', data);
      },
      //si la solicitud fallo
      error: (error) => {
        console.error('Error al obtener proyectos públicos:', error);
      }
    });
  }

  verPresentacion(proyecto: any) {
  this.router.navigate(['/presentacion/proyecto/publico', proyecto.idProyecto]);
}

}
