import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environmets/environmet';

@Injectable({
  providedIn: 'root'
})
export class Favorito {

  private baseUrl =`${environment.apiUrl}/api/favoritos`;

  constructor(private http: HttpClient) { }

  marcar(idUsuario: number, idProyecto: number): Observable<any> {
    return this.http.post(
  `${this.baseUrl}/marcar?idUsuario=${idUsuario}&idProyecto=${idProyecto}`,
  {}, // ← cuerpo vacío
  { withCredentials: true }
);

  }

  quitar(idUsuario: number, idProyecto: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quitar?idUsuario=${idUsuario}&idProyecto=${idProyecto}`, { withCredentials: true });
  }

  esFavorito(idUsuario: number, idProyecto: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/esFavorito?idUsuario=${idUsuario}&idProyecto=${idProyecto}`);
  }
}
