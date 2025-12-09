import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

//se define que el componente es independiente 
@Component({
  selector: 'app-crear-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-proyecto.html',
  styleUrls: ['./crear-proyecto.css']
})

export class CrearProyectoComponent {
  //propiedades del componente
  proyectoForm: FormGroup;
  mensaje = '';
  guardando = false;
  portadaFile: File | null = null;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    //se crea un formulario
    this.proyectoForm = this.fb.group({
      nombreProyecto: ['', Validators.required],
      descripcion: [''],
      portada: [null]
    });
  }

  onFileSelected(event: any) {
    this.portadaFile = event.target.files[0];
  }
  //validamos el nombre del proyecto
  crearProyecto(): void {
  if (this.proyectoForm.invalid) {
    this.mensaje = 'Por favor, ingresa un nombre de proyecto';
    return;
  }

  //preparamos los datos 
  this.guardando = true;
  this.mensaje = '';

  const formData = new FormData();

  //se contruye un obj con los datos del formulario
  const proyectoJson = {
    nombreProyecto: this.proyectoForm.value.nombreProyecto,
    descripcion: this.proyectoForm.value.descripcion,
    urlArchivo: ''
  };

  formData.append('proyecto', new Blob(
      [JSON.stringify(proyectoJson)],
      { type: 'application/json' }
    ));

    // 4️⃣ Si hay portada, adjuntarla
    if (this.portadaFile) {
      formData.append('portada', this.portadaFile);
    }

  this.api.createProyecto(formData).subscribe({
    //cuando el backend responde exitosamente
    next: (res: any) => {
      console.log('Proyecto creado correctamente:', res);
      this.mensaje = 'Proyecto creado correctamente';
      this.proyectoForm.reset();
      this.guardando = false;

      //redirige a la escena, guardando el idProyecto
      if (res.idProyecto) {
        this.router.navigate(['/escena', res.idProyecto]);
      }
    },
    //ocurre si hay un fallo
    error: (err: any) => {
      console.error('Error al crear el proyecto:', err);
      this.mensaje = 'Error al crear el proyecto';
      this.guardando = false;
    }
  });
}
}