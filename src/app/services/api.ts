import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/usuarios`);
  }

  //UsuariosPorID
  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/usuarios/${id}`);
  }

  createUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/usuarios`, usuario);
  }

  //actualizar usuario
  updateUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/usuarios/${id}`, usuario, { withCredentials: true });
  }

  //Proyectos
  getProyectos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/proyectos`, { observe: 'response' });
  }

 createProyecto(formData: FormData) {
  return this.http.post(`${this.baseUrl}/api/proyectos/crear`, formData, { withCredentials: true });
}


  //Proyectos por Usuario
  getProyectosPorUsuario(usuarioId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/api/proyectos/usuario/${usuarioId}`, {
      observe: 'response'
    });
  }

  // Nacionalidades
  getNacionalidades(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/nacionalidades`);
  }

  //Escenas
  getEscenasPorProyecto(proyectoId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/escenas/proyecto/${proyectoId}`);
  }

  guardarEscenas(escenas: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/escenas/guardar`, escenas, { withCredentials: true });
  }


  eliminarEscena(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/escenas/${id}`);
  }

  subirRecurso(idEscena: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/escenas/${idEscena}/subir-recurso`, formData, { withCredentials: true });
  }

  // Obtener proyecto completo (con escenas y recursos)
  getProyectoCompleto(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/proyectos/${id}/completo`, { withCredentials: true });
  }

  getUsuarioActual(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/user/actual`, { withCredentials: true });
  }

  actualizarEscenas(escenas: any[]) {
    return this.http.put(`${this.baseUrl}/api/escenas/actualizar`, escenas, { withCredentials: true });
  }

  actualizarProyecto(data: any) {
  return this.http.put(`${this.baseUrl}/api/proyectos/${data.idProyecto}/actualizar-estado`,data,{ withCredentials: true });
}

subirReaccion(idEscena: number, formData: FormData) {
  return this.http.post<any>(`${this.baseUrl}/api/escenas/${idEscena}/subir-reaccion`,formData,{withCredentials: true});
}
getProyectosFavoritos(usuarioId: number) {
  return this.http.get<any[]>(`${this.baseUrl}/api/proyectos/usuario/${usuarioId}/favoritos`, { observe: 'response' });
}

getValoracionesProyecto(idProyecto: number) {
  return this.http.get<any[]>(`${this.baseUrl}/api/valoraciones/proyecto/${idProyecto}`, { observe: 'response' });
}

crearValoracion(payload: any) {
  return this.http.post<any>(`${this.baseUrl}/api/valoraciones/guardar`, payload,{withCredentials: true});
}


}