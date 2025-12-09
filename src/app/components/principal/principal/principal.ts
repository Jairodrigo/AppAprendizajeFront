import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environmets/environmet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './principal.html',
  styleUrls: ['./principal.css']
})
export class Principal implements OnInit {

  proyectosPublicos: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.cargarProyectosPublicos();
  }

  cargarProyectosPublicos(): void {
    this.http.get<any[]>(`${environment.apiUrl}/api/proyectos/publicos`)
      .subscribe({
        next: (data) => {
          this.proyectosPublicos = data;
          console.log("Proyectos públicos cargados en PRINCIPAL:", data);
        },
        error: (err) => {
          console.error("Error cargando proyectos en PRINCIPAL:", err);
        }
      });
  }

  loginWithGoogle() {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google?prompt=select_account`;
  }
}
