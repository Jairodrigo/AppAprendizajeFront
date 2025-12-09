import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

// ---------------- INTERFACES ------------------

interface ImagenEscena {
  url: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  idRecurso?: number;
  recursoUrl?: string;
  tipoRecurso?: string;
  forma?: 'CUADRADO' | 'CIRCULO' | 'REDONDO' | 'OVALO';
}

interface Escena {
  fondoImagen: string | null;
  colorFondo?: string;
  imagenes: ImagenEscena[];
  anchoOriginal?: number;
  altoOriginal?: number;
}

interface Valoracion {
  idValoracion: number;
  calificacion: number;
  comentarios: string;
  fecha: string;
  usuario: any;
}

// ------------------------------------------------

@Component({
  selector: 'app-presentacion-proyecto-publico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion-proyecto-publico.html',
  styleUrls: ['./presentacion-proyecto-publico.css']
})
export class PresentacionProyectoPublico implements OnInit, AfterViewInit {

  @ViewChild('escenaContainer') escenaContainer!: ElementRef;

  // ---------------- VARIABLES ------------------

  idProyecto!: number;
  escenas: Escena[] = [];
  escenaActualIndex = 0;
  pantallaCompleta = false;
  cargando = true;
  usuario: any = null;

  // Recursos anidados
  recursoVisible = false;
  recursoActualUrl: string | null = null;
  recursoTipo: 'IMAGEN' | 'AUDIO' | null = null;
  recursoX = 0;
  recursoY = 0;
  recursoWidth = 0;
  recursoHeight = 0;
  audioObject: HTMLAudioElement | null = null;

  // ⭐ Valoración
  valoracionSeleccionada = 0;
  valoracionGuardada = false;

  // 💬 Comentarios
  comentarios: any[] = [];
  nuevoComentario: string = "";

  // ------------------------------------------------

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener ID del proyecto
    this.route.params.subscribe(params => {
      this.idProyecto = +params['idProyecto'];

      // Obtener usuario logueado
      this.apiService.getUsuarioActual().subscribe({
        next: (user) => {
          this.usuario = user;
          this.cargarEscenas();
          this.cargarValoraciones(); // ⭐ Cargar comentarios y valoraciones
        },
        error: (err) => {
          console.error('No hay sesión activa:', err);
          this.cargando = false;
        }
      });
    });
  }

  ngAfterViewInit() {
    window.addEventListener('resize', () => this.recalcularPosiciones());
  }

  // ------------------- ESCENAS --------------------

  getContenedorSize() {
    if (this.escenaContainer) {
      const rect = this.escenaContainer.nativeElement.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: 900, height: 640 };
  }

  mostrarRecurso(img: ImagenEscena & { tipoRecurso?: string }) {
    if (!img.recursoUrl) return;

    if (img.tipoRecurso === 'IMAGEN') {
      this.recursoActualUrl = img.recursoUrl;
      this.recursoTipo = 'IMAGEN';
      this.recursoX = img.leftPct;
      this.recursoY = img.topPct;
      this.recursoWidth = img.widthPct;
      this.recursoHeight = img.heightPct;
      this.recursoVisible = true;

      setTimeout(() => this.cerrarRecurso(), 1500);

    } else if (img.tipoRecurso === 'AUDIO') {

      if (this.audioObject) {
        this.audioObject.pause();
        this.audioObject = null;
      }

      this.audioObject = new Audio(img.recursoUrl);
      this.audioObject.play();

      setTimeout(() => {
        if (this.audioObject) {
          this.audioObject.pause();
          this.audioObject = null;
        }
      }, 1500);
    }
  }

  cerrarRecurso() {
    this.recursoVisible = false;
    this.recursoActualUrl = null;
    this.recursoTipo = null;
  }

  cargarEscenas() {
    this.apiService.getProyectoCompleto(this.idProyecto).subscribe({
      next: (data: any) => {
        console.log("Datos cargados:", data);

        const { width: contenedorWidth, height: contenedorHeight } = this.getContenedorSize();

        this.escenas = (data.escenas || []).map((escenaData: any) => {
          const fondo = (escenaData.usosRecursos || []).find(
            (uso: any) => uso.nombreRecurso?.toLowerCase().includes('fondo')
          );

          const fondoImagen = fondo ? fondo.rutaImagen : null;

          const imagenes: ImagenEscena[] = (escenaData.usosRecursos || [])
            .filter((uso: any) => !uso.nombreRecurso?.toLowerCase().includes('fondo'))
            .map((uso: any) => {
              const x = uso.x ?? 0;
              const y = uso.y ?? 0;
              const ancho = uso.ancho ?? 100;
              const alto = uso.alto ?? 100;
              const url = uso.rutaImagen;

              return {
                url,
                x, y, ancho, alto,
                leftPct: (x / contenedorWidth) * 100,
                topPct: (y / contenedorHeight) * 100,
                widthPct: (ancho / contenedorWidth) * 100,
                heightPct: (alto / contenedorHeight) * 100,
                idRecurso: uso.reaccion?.idRecurso ?? null,
                recursoUrl: uso.reaccion?.url ?? null,
                tipoRecurso: uso.reaccion?.tipoRecurso ?? null,
                forma: uso.forma
              };
            });

          return {
            fondoImagen,
            colorFondo: escenaData.colorFondo || '#ffffff',
            imagenes,
            anchoOriginal: contenedorWidth,
            altoOriginal: contenedorHeight
          };
        });

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  recalcularPosiciones() {
    const { width: nuevoAncho, height: nuevoAlto } = this.getContenedorSize();

    this.escenas.forEach(escena => {
      if (!escena.anchoOriginal || !escena.altoOriginal) return;

      const escalaX = nuevoAncho / escena.anchoOriginal;
      const escalaY = nuevoAlto / escena.altoOriginal;

      escena.imagenes.forEach(img => {
        img.leftPct = ((img.x * escalaX) / nuevoAncho) * 100;
        img.topPct = ((img.y * escalaY) / nuevoAlto) * 100;

        if (img.forma === 'CIRCULO' || img.forma === 'REDONDO') {
          const escala = Math.min(escalaX, escalaY);
          const size = Math.min(img.ancho * escala, img.alto * escala);
          img.widthPct = (size / nuevoAncho) * 100;
          img.heightPct = (size / nuevoAlto) * 100;

        } else {
          img.widthPct = ((img.ancho * escalaX) / nuevoAncho) * 100;
          img.heightPct = ((img.alto * escalaY) / nuevoAlto) * 100;
        }
      });
    });

    this.cdr.detectChanges();
  }

  get escenaActual(): Escena {
    return this.escenas[this.escenaActualIndex];
  }

  siguienteEscena() {
    if (this.escenaActualIndex < this.escenas.length - 1) this.escenaActualIndex++;
  }

  anteriorEscena() {
    if (this.escenaActualIndex > 0) this.escenaActualIndex--;
  }

  alternarPantallaCompleta() {
    const elem = this.escenaContainer.nativeElement;

    if (!this.pantallaCompleta) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      this.pantallaCompleta = true;
    } else {
      document.exitFullscreen?.();
      this.pantallaCompleta = false;
    }

    setTimeout(() => this.recalcularPosiciones(), 100);
  }

  onImageError(url: string) {
    console.warn('No se pudo cargar la imagen:', url);
  }

  // ------------------- VALORACIONES --------------------
  formatearFecha(fecha: string): string {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${year}/${month}/${day}`;
}


  cargarValoraciones() {
  this.apiService.getValoracionesProyecto(this.idProyecto).subscribe(
    (resp: any) => {

      const data = resp.body;  // Aquí viene realmente la lista del back

      // Transformo la fecha a un formato más amigable
      this.comentarios = data.map((c: any) => ({
        usuarioNombre: c.usuarioNombre,
        comentarios: c.comentarios,
        calificacion: Number(c.calificacion),

        // Formateo la fecha → YYYY/MM/DD
        fecha: c.fecha ? this.formatearFecha(c.fecha) : ""
      }));
      console.log("Comentarios cargados:", this.comentarios);
    },
    (err) => {
      console.error("Error al cargar comentarios", err);
    }
  );
}

getArray(n: number): number[] {
  return Array(n).fill(0);
}

  // ⭐ Seleccionar calificación
seleccionarEstrella(valor: number) {
  this.valoracionSeleccionada = valor;
}

enviarValoracion() {
  if (!this.valoracionSeleccionada || this.nuevoComentario.trim() === "") {
    alert("Debes escribir un comentario y seleccionar una calificación.");
    return;
  }
  console.log("Usuario actual:", this.usuario);
console.log("ID usuario:", this.usuario?.id);
console.log("ID proyecto:", this.idProyecto);


  const payload = {
    idUsuario: Number(this.usuario.idUsuario),
    idProyecto: this.idProyecto,
    calificacion: this.valoracionSeleccionada,
    comentarios: this.nuevoComentario
  };

  this.apiService.crearValoracion(payload).subscribe({
    next: () => {
      this.nuevoComentario = "";
      this.valoracionSeleccionada = 0;
      this.cargarValoraciones();
    },
    error: err => console.error("Error al guardar valoración", err)
  });
}

}
