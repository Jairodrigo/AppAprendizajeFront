import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { NacionalidadService } from '../../services/nacionalidad'; 
import { environment } from '../../../environmets/environmet';

//se define que el componente es independiente 
@Component({
  selector: 'app-cuestionario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './cuestionario.html',
  styleUrls: ['./cuestionario.css',]
})

export class Cuestionario implements OnInit {
  //propiedades del componente
  cuestionarioForm!: FormGroup;
  nacionalidades: any[] = [];
  generos = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ];

  //inyeccion de dependencias
  constructor(
    private fb: FormBuilder,
    private nacionalidadService: NacionalidadService,
    private http: HttpClient,
    public router: Router 
  ) {}

  ngOnInit(): void {
    //creacion del formulario
    this.cuestionarioForm = this.fb.group({
      genero: ['', Validators.required],
      nacionalidad: ['', Validators.required]
    });

    this.nacionalidadService.getNacionalidades()
      .subscribe(data => {
        console.log('Nacionalidades:', data);
        this.nacionalidades = data;
      });
  }

  guardar(): void {
    //validamos que el formulario este completo
    if (this.cuestionarioForm.invalid) return;

    //armamos un obj con los valores seleccionados
    const payload = {
      genero: this.cuestionarioForm.value.genero,
      nacionalidad: Number(this.cuestionarioForm.value.nacionalidad)
    };

    //enviamos los datos
    console.log("Datos enviados:", payload);

    this.http.post(`${environment.apiUrl}/api/user/completar`,payload, { withCredentials: true }) //guardamos al usuario en cookies
      .subscribe({
        next: () => this.router.navigate(['/inicio']),
        error: err => console.error('Error al guardar cuestionario', err)
      });
  }
}
