import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Lista de Usuarios</h2>
    <ul>
      <li *ngFor="let usuario of usuarios">
        {{ usuario.nombre }} {{ usuario.apellido_paterno }} - {{ usuario.correo }}
      </li>
    </ul>
  `
})
export class Usuarios implements OnInit {
  usuarios: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
  this.apiService.getUsuarios().subscribe({
    next: data => {
      console.log("Usuarios recibidos:", data);
      this.usuarios = data;
    },
    error: err => console.error("Error al obtener usuarios:", err)
  });
}

}
