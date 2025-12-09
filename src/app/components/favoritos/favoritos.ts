import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api';
import { HttpResponse } from '@angular/common/http';
import { Favorito } from '../../services/favorito';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favoritos.html',
  styleUrls: ['./favoritos.css']
})
export class Favoritos implements OnInit {

  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  loading = true;
  filtroActual: string = 'todos';
  usuarioId: number = 0;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private favoritoService: Favorito
  ) {}

  ngOnInit(): void {
    const id = localStorage.getItem("usuarioId");
    this.usuarioId = id ? Number(id) : 0;

    this.cargarFavoritos();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.includes('/favoritos')) {
          this.cargarFavoritos();
        }
      }
    });
  }

  cargarFavoritos() {
    if (!this.usuarioId) {
      this.loading = false;
      return;
    }

    this.apiService.getProyectosFavoritos(this.usuarioId).subscribe({
      next: (resp: HttpResponse<any[]>) => {
        this.proyectos = (resp.body ?? []).map(p => ({
          ...p,
          estadoNormalizado:
            p.estado === "B" ? "borrador" :
            p.estado === "C" ? "culminado" : "otros",
          favorito: p.esFavorito ?? true // todos son favoritos
        }));

        this.aplicarFiltro();
        this.loading = false;
      },
      error: err => {
        console.error("Error al obtener favoritos:", err);
        this.loading = false;
      }
    });
  }

  aplicarFiltro() {
    if (this.filtroActual === 'todos') {
      this.proyectosFiltrados = [...this.proyectos];
    } else {
      this.proyectosFiltrados = this.proyectos.filter(
        p => p.estadoNormalizado === this.filtroActual
      );
    }
  }

  //Marcar y desmarcar favoritos
  toggleFavorito(proyecto: any) {
  if (!this.usuarioId) return;

  if (proyecto.favorito) {
    //quitar favorito
    this.favoritoService.quitar(this.usuarioId, proyecto.idProyecto)
      .subscribe(() => {
        // Eliminarlo de ambas listas locales
        proyecto.favorito = false;
        this.proyectos = this.proyectos.filter(p => p.idProyecto !== proyecto.idProyecto);
        this.proyectosFiltrados = this.proyectosFiltrados.filter(p => p.idProyecto !== proyecto.idProyecto);
      });
  } else {
    //marcar favorito
    this.favoritoService.marcar(this.usuarioId, proyecto.idProyecto)
      .subscribe(resp => {
        if (resp.success) {
          proyecto.favorito = true;
          //agregar a la lista de favoritos
          this.proyectos.push(proyecto);
          this.aplicarFiltro();
        }
      });
  }
}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-container')) {
      this.proyectosFiltrados.forEach(p => p.showMenu = false);
    }
  }

  toggleMenu(proyecto: any) {
    this.proyectosFiltrados.forEach(p => {
      if (p !== proyecto) p.showMenu = false;
    });
    proyecto.showMenu = !proyecto.showMenu;
  }

  editarProyecto(proyecto: any) {
    proyecto.showMenu = false;
    this.router.navigate(['/editar-proyecto', proyecto.idProyecto]);
  }

  presentarProyecto(proyecto: any) {
    proyecto.showMenu = false;
    if (proyecto.estadoNormalizado === 'culminado') {
      this.router.navigate(['/proyectos/presentacion', proyecto.idProyecto]);
    }
  }

  compartirProyecto(proyecto: any) {
    proyecto.showMenu = false;
    if (proyecto.estadoNormalizado === 'culminado') {
      const url = `${window.location.origin}/proyectos/compartido/${proyecto.idProyecto}?view=public`;
      navigator.clipboard.writeText(url).then(() => {
        alert("📎 URL copiada al portapapeles");
      });
    }
  }

}
