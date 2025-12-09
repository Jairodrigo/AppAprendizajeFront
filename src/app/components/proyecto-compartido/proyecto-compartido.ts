import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';

//interfaces perzonalizadas
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
  forma?: 'CUADRADO' | 'CIRCULO' | 'REDONDO' | 'OVALO';
}

interface Escena {
  fondoImagen: string | null;
  colorFondo?: string;
  imagenes: ImagenEscena[];
  anchoOriginal?: number;
  altoOriginal?: number;
}
@Component({
  selector: 'app-proyecto-compartido',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './proyecto-compartido.html',
  styleUrls: ['./proyecto-compartido.css']
})
export class ProyectoCompartido implements OnInit, AfterViewInit {
  @ViewChild('escenaContainer') escenaContainer!: ElementRef;

  //variables
  idProyecto!: number;
  escenas: Escena[] = [];
  escenaActualIndex = 0;
  pantallaCompleta = false;
  cargando = true;
  usuario: any = null;
  recursoVisible = false;
  recursoActualUrl: string | null = null;
  recursoTipo: 'IMAGEN' | 'AUDIO' | null = null;
  recursoX = 0;
  recursoY = 0;
  recursoWidth = 0;
  recursoHeight = 0;
  audioObject: HTMLAudioElement | null = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
  this.route.params.subscribe(params => {
    this.idProyecto = +params['idProyecto'];
    this.cargarEscenas(); // ← solo esto
  });
}


  //recalcular posiciones de las imagenes
  ngAfterViewInit() {
    window.addEventListener('resize', () => this.recalcularPosiciones());
  }

  //tamaño del contenedor de las escenas
  getContenedorSize() {
    if (this.escenaContainer) {
      const rect = this.escenaContainer.nativeElement.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: 900, height: 640 };
  }

  mostrarRecurso(img: ImagenEscena & { tipoRecurso?: string }) {
    if (!img.recursoUrl) {
      console.log('No hay recurso anidado para esta imagen.');
      return;
    }

    if (img.tipoRecurso === 'IMAGEN') {
      // mostrar imagen en el contenedor
      this.recursoActualUrl = img.recursoUrl;
      this.recursoTipo = 'IMAGEN';
      this.recursoX = img.leftPct;
      this.recursoY = img.topPct;
      this.recursoWidth = img.widthPct;
      this.recursoHeight = img.heightPct;
      this.recursoVisible = true;

      setTimeout(() => this.cerrarRecurso(), 1500);

    } else if (img.tipoRecurso === 'AUDIO') {
      // reproducir audio
      if (this.audioObject) {
        this.audioObject.pause();
        this.audioObject = null;
      }

      this.audioObject = new Audio(img.recursoUrl);
      this.audioObject.play();

      // detener audio después de 5 segundos
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
        console.log("Datos cargados del backend:", data);

        //obtenemos el tamaño del contenedor
        const { width: contenedorWidth, height: contenedorHeight } = this.getContenedorSize();

        //mapeamos las esecnas
        this.escenas = (data.escenas || []).map((escenaData: any) => {
          //Buscar imagen de fondo
          const fondo = (escenaData.usosRecursos || []).find(
            (uso: any) => uso.nombreRecurso?.toLowerCase().includes('fondo')
          );

          const fondoImagen = fondo ? fondo.rutaImagen : null;

          //Filtrar imágenes normales
          const imagenes: ImagenEscena[] = (escenaData.usosRecursos || [])
            .filter((uso: any) => !uso.nombreRecurso?.toLowerCase().includes('fondo'))
            .map((uso: any) => {
              const x = uso.x ?? 0;
              const y = uso.y ?? 0;
              const ancho = uso.ancho ?? 100;
              const alto = uso.alto ?? 100;
              const url = uso.rutaImagen;

              //Convertir a porcentajes relativos al tamaño actual del contenedor
              return {
                url,
                x, y, ancho, alto,
                leftPct: (x / contenedorWidth) * 100,
                topPct: (y / contenedorHeight) * 100,
                widthPct: (ancho / contenedorWidth) * 100,
                heightPct: (alto / contenedorHeight) * 100,
                idRecurso: uso.reaccion?.idRecurso ?? null, // <--- aquí
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

  //calculo de posiciones para pantalla completa
  recalcularPosiciones() {
    const { width: nuevoAncho, height: nuevoAlto } = this.getContenedorSize();

    this.escenas.forEach(escena => {
      if (!escena.anchoOriginal || !escena.altoOriginal) return;

      //factores de escala
      const escalaX = nuevoAncho / escena.anchoOriginal;
      const escalaY = nuevoAlto / escena.altoOriginal;

      escena.imagenes.forEach(img => {
        // posición proporcional
        img.leftPct = ((img.x * escalaX) / nuevoAncho) * 100;
        img.topPct = ((img.y * escalaY) / nuevoAlto) * 100;

        if (img.forma === 'CIRCULO' || img.forma === 'REDONDO') {
          // usar el factor más pequeño para mantener la proporción
          const escala = Math.min(escalaX, escalaY);
          const sizeX = img.ancho * escala;
          const sizeY = img.alto * escala;
          const size = Math.min(sizeX, sizeY); // asegurar ancho = alto
          img.widthPct = (size / nuevoAncho) * 100;
          img.heightPct = (size / nuevoAlto) * 100;
        } else if (img.forma === 'OVALO') {
          // escalar libremente en X y Y
          img.widthPct = ((img.ancho * escalaX) / nuevoAncho) * 100;
          img.heightPct = ((img.alto * escalaY) / nuevoAlto) * 100;
        } else {
          // CUADRADO u otras formas
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

  //pantalla completa
  alternarPantallaCompleta() {
    const elem = this.escenaContainer.nativeElement;

    if (!this.pantallaCompleta) {
      //activamso el pantalla completa
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if ((elem as any).webkitRequestFullscreen) (elem as any).webkitRequestFullscreen();
      this.pantallaCompleta = true;
    } else {
      //salimos del pantalla completa
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      this.pantallaCompleta = false;
    }

    setTimeout(() => this.recalcularPosiciones(), 100);
  }

  onImageError(url: string) {
    console.warn('No se pudo cargar la imagen:', url);
  }
}
