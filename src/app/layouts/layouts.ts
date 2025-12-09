import { Component } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Inicio } from '../components/inicio/inicio';
import { environment } from '../../environmets/environmet';

@Component({
  selector: 'app-layouts',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './layouts.html',
  styleUrls: ['./layouts.css']
})
export class Layouts {
constructor(private router: Router) {}
isMenuOpen = false;

  logout() {
    console.log('Cerrando sesión...');
    window.location.href = `${environment.apiUrl}/logout`
  }

  goToProyectos() {
    this.router.navigate(['/proyectos/mis-proyectos']);
    console.log("Navegar a Proyectos");
  }

  goToPerfil() {
    this.router.navigate(['/mi-perfil']);
    console.log("Navegar a Mi Perfil");
  }

  goToInicio() {
    console.log('Navegar a Inicio');
    this.router.navigate(['/inicio']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  goToCrearProyecto() {
  this.router.navigate(['/proyectos/crear']);
  console.log("Navegar a Crear Proyecto");
  }

  goToFavoritos() {
    console.log('Navegar a Favoritos');
    this.router.navigate(['/favoritos']);
  }

}
