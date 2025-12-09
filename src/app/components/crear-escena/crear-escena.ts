import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { ApiService } from '../../services/api';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { forkJoin } from 'rxjs';


//interfaces personalizadas
interface ImagenEscena {
  url: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  file?: File;
  idRecurso?: number;
  idUsoRecurso?: number;
  idRecursoReaccion?: number;
  reaccionTipo?: 'IMAGEN' | 'AUDIO' | null;
  reaccionUrl?: string | null;
  reaccionFile?: File | null;
  reaccionEsAudio?: boolean;
  forma?: 'CUADRADO' | 'REDONDO' | 'CIRCULO' | 'OVALO';
}

interface Escena {
  nombre: string;
  colorFondo: string;
  fondoImagen: string | null;
  nombreFondo: string | null;
  imagenes: ImagenEscena[];
  recursosEliminados?: number[];
  idEscena?: number;
  fondoEliminado?: boolean;
}

interface Recurso {
  idRecurso: number;
  nombreRecurso: string;
  tipoRecurso: string;
  url: string;
  file?: File;
}


//se define que el componente es independiente 
@Component({
  selector: 'app-crear-escena',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './crear-escena.html',
  styleUrls: ['./crear-escena.css']
})
export class CrearEscena {
  //propiedades del componente
  idProyecto!: number;
  usuarioId!: number;
  escenas: Escena[] = [];
  escenaActualIndex = 0;
  modoEdicion = false;

  //tamaño de img
  readonly defaultWidth = 150;
  readonly defaultHeight = 150;
  //máx y min de cada img
  readonly minSize = 50;
  readonly maxSize = 400;
  //cantidad max de img
  readonly maxImagenes = 6;

  @ViewChild('inputReaccion') inputReaccion!: any;
  imgSeleccionadaParaReaccion: any = null;

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe(params => {
      this.idProyecto = +params['idProyecto']; // capturamos el idProyecto
    });
    //Capturamos el usuario logueado desde localStorage
    const idGuardado = localStorage.getItem('usuarioId');
    if (idGuardado) {
      this.usuarioId = Number(idGuardado);
      console.log('Usuario logueado (crear-escena):', this.usuarioId);
    } else {
      console.warn('No se encontró usuario logueado en localStorage');
    }
  }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.idProyecto = +params['idProyecto'];

      // si la ruta es editar-proyecto entonces cargamos el proyecto completo
      if (this.router.url.includes('editar-proyecto')) {
        this.modoEdicion = true;
        await this.cargarProyectoParaEditar();
      } else {
        this.agregarEscena();
      }
    });
  }

  async cargarProyectoParaEditar() {
    try {
      const proyecto = await firstValueFrom(this.apiService.getProyectoCompleto(this.idProyecto));

      // mapeamos las escenas desde el backend
      this.escenas = proyecto.escenas.map((e: any) => {
        let fondoImagen: string | null = null;
        let nombreFondo: string | null = null;

        const imagenes: ImagenEscena[] = [];

        console.log('Usos de recursos de la escena:', e.usosRecursos);

        e.usosRecursos.forEach((r: any) => {
          if (r.nombreRecurso === 'Fondo') {
            fondoImagen = r.rutaImagen ?? null;
            nombreFondo = r.nombreRecurso ?? null;
          } else {
            const img: ImagenEscena = {
              idRecurso: r.idRecurso,
              x: r.x,
              y: r.y,
              ancho: r.ancho,
              alto: r.alto,
              url: r.rutaImagen,
              idRecursoReaccion: r.reaccion?.idRecurso ?? null,
              reaccionUrl: r.reaccion?.url ?? null,
              reaccionTipo: r.reaccion?.tipoRecurso ?? null,
              reaccionEsAudio: r.reaccion?.tipoRecurso === 'AUDIO',
              reaccionFile: null,
              forma: r.forma
            };
            imagenes.push(img);
          }
        });


        return {
          idEscena: e.idEscena,
          nombre: e.nombre,
          colorFondo: e.colorFondo || '#ffffff',
          fondoImagen,
          nombreFondo,
          imagenes
        };
      });

      this.escenaActualIndex = 0;
      console.log('Proyecto cargado para editar:', this.escenas);
    } catch (err) {
      console.error('Error al cargar proyecto para editar:', err);
      alert('Error al cargar el proyecto para editar.');
    }
  }

  // eliminar una reacción de una imagen
  eliminarReaccion(img: ImagenEscena) {
    if (!img) return;

    if (img.reaccionUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(img.reaccionUrl);
    }

    // Limpiar propiedades de la reacción
    img.reaccionUrl = null;
    img.reaccionFile = null;
    img.reaccionTipo = null;
    img.idRecursoReaccion = undefined;
  }

  //Escena actual activa
  get escenaActual(): Escena {
    return this.escenas[this.escenaActualIndex];
  }

  // Agregar nueva escena con nombre automático
  agregarEscena() {
    const nueva: Escena = {
      nombre: `Escena ${this.escenas.length + 1}`,
      colorFondo: '#ffffff',
      fondoImagen: null,
      nombreFondo: null,
      imagenes: []
    };
    this.escenas.push(nueva);
    this.escenaActualIndex = this.escenas.length - 1;
  }

  //Eliminar escena siempre y aseguramos que al menos exista una
  eliminarEscena(index: number) {
    if (this.escenas.length <= 1) {
      alert('Debe haber al menos una escena.');
      return;
    }

    this.escenas.splice(index, 1);

    if (this.escenaActualIndex >= this.escenas.length) {
      this.escenaActualIndex = this.escenas.length - 1;
    }
  }

  //Cambiar escena actual
  seleccionarEscena(index: number) {
    this.escenaActualIndex = index;
  }

  //Permite subir una imagen de fondo o limpiarla
  cargarFondo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const f = input.files[0];
    this.escenaActual.fondoImagen = URL.createObjectURL(f);
    this.escenaActual.nombreFondo = f.name;
  }

  //limpia el fondo y lo deja en color blanco
  limpiarFondo() {
    const escena = this.escenaActual;
    escena.fondoImagen = null;
    escena.nombreFondo = null;
    escena.colorFondo = '#ffffff';
    escena.fondoEliminado = true;
    const inputFondo = document.getElementById('inputFondo') as HTMLInputElement;
    if (inputFondo) inputFondo.value = '';
  }

  // control de cantidad de imagenes 
  cargarImagenes(event: any): void {
    const archivos = Array.from(event.target.files || []);
    const maxImagenes = this.maxImagenes - this.escenaActual.imagenes.length;

    archivos.slice(0, maxImagenes).forEach((file: any) => {
      const lector = new FileReader();
      lector.onload = (e: any) => {
        const nuevaImagen: ImagenEscena = {
          url: e.target.result,
          x: 50,  // posición inicial
          y: 50,
          ancho: this.defaultWidth,  // tamaño ya definido 
          alto: this.defaultHeight,
          file: file,
          forma: 'CUADRADO'
        };
        this.escenaActual.imagenes.push(nuevaImagen);
      };
      lector.readAsDataURL(file);
    });
  }

  eliminarImagen(index: number) {
    const escena = this.escenaActual;
    const img = escena.imagenes[index];

    if (img?.url?.startsWith('blob:')) URL.revokeObjectURL(img.url);

    // Si la imagen ya existía en la base de datos
    if (img?.idRecurso) {
      if (!escena.recursosEliminados) escena.recursosEliminados = [];
      escena.recursosEliminados.push(img.idRecurso);
    }

    escena.imagenes.splice(index, 1);
  }



  onDragEnd(event: CdkDragEnd, index: number) {
    const escena = this.escenaActual;
    const delta = (event as any).distance || { x: 0, y: 0 }; //contiene cuanto se movio el elemento desde su posicion inicial
    //calcula las nuevas coordenadas
    let newX = (escena.imagenes[index].x || 0) + delta.x;
    let newY = (escena.imagenes[index].y || 0) + delta.y;

    //verifica si existe el canvas(pizarra)
    const canvas = document.getElementById('sceneCanvas');
    if (!canvas) {
      escena.imagenes[index].x = newX;
      escena.imagenes[index].y = newY;
      try { event.source.reset(); } catch { }
      return;
    }

    //calcula los limites de la pizarra
    const el = event.source.element.nativeElement as HTMLElement;
    const elemWidth = el.offsetWidth;
    const elemHeight = el.offsetHeight;
    const maxX = canvas.clientWidth - elemWidth;
    const maxY = canvas.clientHeight - elemHeight;

    //limitamos las coordenadas
    newX = Math.max(0, Math.min(newX, Math.max(0, maxX)));
    newY = Math.max(0, Math.min(newY, Math.max(0, maxY)));

    //guardamos las coordenadas finales
    escena.imagenes[index].x = newX;
    escena.imagenes[index].y = newY;

    try { event.source.reset(); } catch { }
  }

  seleccionarReaccion(img: any) {
    console.log("Seleccionando reacción para imagen:", img);

    if (!img.idRecursoReaccion) img.idRecursoReaccion = null;
    if (!img.reaccionTipo) img.reaccionTipo = null;
    if (!img.reaccionUrl) img.reaccionUrl = null;
  }

  abrirInputReaccion(img: any) {
    this.imgSeleccionadaParaReaccion = img;
    this.inputReaccion.nativeElement.value = '';
    this.inputReaccion.nativeElement.click();
  }

  cargarReaccion(event: any) {
    const archivo = event.target.files[0];
    if (!archivo || !this.imgSeleccionadaParaReaccion) return;

    const img = this.imgSeleccionadaParaReaccion;
    const url = URL.createObjectURL(archivo);

    img.reaccionFile = archivo;
    img.reaccionUrl = url;
    img.reaccionEsAudio = archivo.type.startsWith('audio/');
    img.reaccionTipo = img.reaccionEsAudio ? 'AUDIO' : 'IMAGEN';
  }



  async guardarEscenasInterno() {
    try {
      // Guardar escenas en backend y obtener ids
      const escenasAEnviar = this.escenas.map((escena, index) => ({
        idEscena: escena.idEscena ?? null,
        nombre: escena.nombre,
        colorFondo: escena.colorFondo,
        descripcion: '',
        orden: index,
        idProyecto: this.idProyecto,
        recursosEliminados: escena.recursosEliminados || [],
        fondoEliminado: escena.fondoEliminado || false
      }));

      if (this.modoEdicion) {
        // Si estamos editando, usamos PUT
        await firstValueFrom(this.apiService.actualizarEscenas(escenasAEnviar));
      } else {
        // Si es nuevo, usamos POST
        const resultado: any = await firstValueFrom(this.apiService.guardarEscenas(escenasAEnviar));
        resultado.forEach((escenaBackend: any, i: number) => {
          this.escenas[i].idEscena = escenaBackend.idEscena;
        });
      }

      for (const escena of this.escenas) {
        if (!escena.idEscena) continue;

        // Fondo
        if (escena.fondoImagen && escena.nombreFondo) {
          const file = (document.getElementById('inputFondo') as HTMLInputElement)?.files?.[0];
          if (file) {
            const fd = new FormData();
            fd.append('archivo', file);
            fd.append('nombre', 'Fondo');
            fd.append('tipo', 'IMAGEN');
            fd.append('idUsuario', this.usuarioId.toString());
            await this.apiService.subirRecurso(escena.idEscena, fd).toPromise();
          }
        }

        for (const img of escena.imagenes) {

          //imagen principal
          if (img.file) {
            const fd = new FormData();
            fd.append('archivo', img.file);
            fd.append('nombre', 'Imagen');
            fd.append('tipo', 'IMAGEN');
            fd.append('idUsuario', this.usuarioId.toString());
            fd.append('x', img.x.toString());
            fd.append('y', img.y.toString());
            fd.append('ancho', img.ancho.toString());
            fd.append('alto', img.alto.toString());
            fd.append('forma', img.forma ?? 'CUADRADO');

            const recursoCreado: any = await this.apiService.subirRecurso(escena.idEscena, fd).toPromise();

            img.idRecurso = recursoCreado.idRecurso;
            img.idUsoRecurso = recursoCreado.usosRecursos?.[0]?.idUsoRecurso;
          }

          if (img.reaccionFile) {

            const fd = new FormData();
            fd.append('archivo', img.reaccionFile);
            fd.append('nombre', 'Reaccion');
            // Tipo si es audio o imagen
            fd.append('tipo', img.reaccionEsAudio ? 'AUDIO' : 'IMAGEN');
            fd.append("idUsuario", this.usuarioId.toString());
            fd.append('idUsoRecurso', (img.idUsoRecurso ?? 0).toString());

            const recursoReaccion: Recurso = await this.apiService
              .subirReaccion(escena.idEscena, fd)
              .toPromise();

            img.idRecursoReaccion = recursoReaccion.idRecurso;
          }

        }

      }

      alert(this.modoEdicion
        ? 'Escenas actualizadas correctamente.'
        : 'Escenas y recursos guardados correctamente.'
      );
      this.router.navigate(['/proyectos/mis-proyectos']);
    } catch (err) {
      console.error(err);
      alert('Error al guardar escenas o subir recursos.');
    }
  }



  async guardarProyecto(estado: string, tipo: string) {
    try {

      //Guardar escenas + recursos
      await this.guardarEscenasInterno();

      //Actualizar estado y tipo del proyecto
      const proyectoActualizado = {
        idProyecto: this.idProyecto,
        estado: estado,
        tipo: tipo
      };

      await firstValueFrom(this.apiService.actualizarProyecto(proyectoActualizado));

      alert(
        estado === 'C'
          ? 'Proyecto finalizado y publicado correctamente.'
          : 'Proyecto guardado como borrador.'
      );

      this.router.navigate(['/proyectos/mis-proyectos'], { queryParams: { refresh: Date.now() } });

    } catch (err) {
      console.error('Error al guardar proyecto:', err);
      alert('Error al guardar el proyecto.');
    }
  }



}
