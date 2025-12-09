import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

//se define que el componente es independiente
@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.html' ,
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfil implements OnInit {
  //propiedades del componente
  usuario: any = null;
  nacionalidades: any[] = [];

  //inyeccion de dependencias
  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    const usuarioId = localStorage.getItem("usuarioId");//obtenemos el usuario logueado
    if (usuarioId) {
      //si existe, se muestran sus datos
      this.apiService.getUsuarioById(Number(usuarioId)).subscribe({
        next: (resp: any) => {
          this.usuario = resp;
          console.log("Datos del usuario cargados:", this.usuario);
        },
        error: (err: any) => {
          console.error("Error al cargar usuario:", err);
        }
      });
    } else {
      console.warn("No se encontró usuario en localStorage");
    }

    //se cargan las nacionalidades
    this.apiService.getNacionalidades().subscribe({
      next: (resp: any[]) => {
        this.nacionalidades = resp;
        console.log("Nacionalidades cargadas:", this.nacionalidades);
      },
      error: (err: any) => {
        console.error("Error al cargar nacionalidades:", err);
      }
    });
  }

  guardarCambios() {
    if (this.usuario) {//verfica si hay un usuario cargado
      this.apiService.updateUsuario(this.usuario.idUsuario, this.usuario).subscribe({
        next: () => {
          alert("Datos actualizados correctamente");
        },
        error: (err: any) => {
          console.error("Error al actualizar usuario:", err);
          alert("Error al actualizar los datos");
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/inicio']);
  }
}
