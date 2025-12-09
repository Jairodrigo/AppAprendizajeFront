import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api';
import { HttpResponse } from '@angular/common/http';
import { Favorito } from '../../services/favorito';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyectos.html',
  styleUrls: ['./proyectos.css']
})
export class Proyectos implements OnInit {

  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  loading = true;
  filtroActual: string = 'todos';

  usuarioId: number = 0;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private favoritoService: Favorito
  ) { }

  ngOnInit(): void {
    const id = localStorage.getItem("usuarioId");
    this.usuarioId = id ? Number(id) : 0;

    this.cargarProyectos();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.includes('/proyectos')) {
          this.cargarProyectos();
        }
      }
    });
  }

  // =====================================================
  //               CARGAR PROYECTOS
  // =====================================================
  cargarProyectos() {
    if (this.usuarioId) {
      this.apiService.getProyectosPorUsuario(this.usuarioId).subscribe({
        next: (resp: HttpResponse<any[]>) => {
          this.proyectos = (resp.body ?? []).map(p => ({
            ...p,
            estadoNormalizado:
              p.estado === "B" ? "borrador" :
              p.estado === "C" ? "culminado" : "otros",
            favorito: p.esFavorito ?? false
          }));

          this.aplicarFiltro();
          this.loading = false;
        },
        error: (err: any) => {
          console.error("Error al obtener proyectos:", err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
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

  // =====================================================
  //               FAVORITOS (MARCAR / QUITAR)
  // =====================================================
  toggleFavorito(proyecto: any) {
    if (!this.usuarioId) return;

    if (proyecto.favorito) {
      // ---- quitar favorito ----
      this.favoritoService.quitar(this.usuarioId, proyecto.idProyecto)
        .subscribe(() => {
          proyecto.favorito = false;
        });
    } else {
      // ---- marcar favorito ----
      this.favoritoService.marcar(this.usuarioId, proyecto.idProyecto)
        .subscribe(resp => {
          if (resp.success) {
            proyecto.favorito = true;
          }
        });
    }
  }

  // =====================================================
  //                    MENÚ
  // =====================================================
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

  // =====================================================
  //                   OPCIONES
  // =====================================================
  editarProyecto(proyecto: any) {
    proyecto.showMenu = false;
    this.router.navigate(['/editar-proyecto', proyecto.idProyecto]);
  }

  presentarProyecto(proyecto: any) {
    this.router.navigate(['/proyectos/presentacion', proyecto.idProyecto]);
  }

  compartirProyecto(proyecto: any) {
    proyecto.showMenu = false;

    const url = `${window.location.origin}/proyectos/compartido/${proyecto.idProyecto}?view=public`;

    navigator.clipboard.writeText(url).then(() => {
      alert("📎 URL copiada al portapapeles");
    });
  }

}
