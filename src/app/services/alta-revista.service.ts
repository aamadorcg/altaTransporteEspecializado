import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { RespuestaGenerica } from "../core/models/respuesta.generica.model";
import { COLOR_CONFIRMAR } from "../shared/constants/colores";
import { AlertaUtility } from "../shared/utilities/alerta";
import { environment } from "../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class AltaRevistaService {

  private apiUrl: string;
  private apiCpUrl: string;
  public configuracion: any = [];
  constructor(private http: HttpClient, private alerta: AlertaUtility) {
    this.apiUrl = environment.apiUrl;
    this.apiCpUrl = environment.apiCodigoPostalUrl;
  }

  obtenerDatosFormulario(url: string, body: any) {
    return this.http.post(`${this.apiUrl + url}`, body);
  }

  cargarConfiguracionTramite(idTramite: string): Observable<any> {
    let json = {
      strCodigo: idTramite
    };
    return this.http.post<RespuestaGenerica>(`${this.apiUrl + '/tiposTramites/obtenerConfiguracionTramite'}`, json)
      .pipe(
        map((res) => {
          if (res.status) {
            return res.data;
          } else {
            throw new Error('Error al obtener la configuración');
          }
        }),
        catchError((error) => {
          this.alerta.mostrarAlerta({
            message: "Ha ocurrido un error al obtener la configuración del trámite",
            icon: 'error',
            showConfirmButton: true,
            confirmButtonColor: COLOR_CONFIRMAR,
            showCloseButton: false
          });
          return throwError(() => error);
        })
      );
  }

  obtenerDocumentosTramite(){
    return this.http.get<any>(`${this.apiUrl}/tramites/obtenerDocumentacion`);
  }

  obtenerCombustibles(){
    return this.http.get<any>(`${this.apiUrl}/tramites/obtenerCombustible`);
  }

  obtenerClavesVehiculares(){
    return this.http.get<any>(`${this.apiUrl}/tramites/obtenerClavesVehiculares`);
  }

  obtenerMunicipios(body: any) {
    return this.http.post(`${this.apiUrl + '/tramites/obtenerMunicipios'}`, body);
  }

  obtenerLocalidades(body: any) {
    return this.http.post(`${this.apiUrl + '/tramites/obtenerLocalidades'}`, body);
  }

  validaNiv(body: any){
    return this.http.post(`${this.apiUrl + '/tramites/validarNiv'}`, body);
  }

  validaRfc(body: any){
    return this.http.post(`${this.apiUrl + '/tramites/validarPermisionario'}`, body);
  }

  registrarTramite(body: any) {
    return this.http.post(`${this.apiUrl}/tramites/registrarTramite`, body);
  }

  obtenerTramiteParaCorregir(idTramite: string) {
    let params = new HttpParams().set('intIdTramite', idTramite);
    return this.http.get<RespuestaGenerica>(`${this.apiUrl}/tramites/obtenerTramite`, { params });
  }

  corregirTramite(body: any) {
    return this.http.post(`${this.apiUrl}/tramites/actualizarDocumentos`, body);
  }

  obtenerDireccion(codigoPostal: string){
    let params = new HttpParams().set('codigoPostal', codigoPostal);
    return this.http.get<RespuestaGenerica>(`${this.apiCpUrl}`, { params });
    //https://catalogos-publicos.sefintlax.gob.mx/CatalogosPublicos/catalogosINEGI/catCodigoPostal?codigoPostal=75505
  }

  validarClaveVehicular(json: {}){
    return this.http.post(`${this.apiUrl}/tramites/validarClaveVehicular`, json);
  }

  validarVidaUtil(json: {}){
    return this.http.post(`${this.apiUrl}/tramites/validarVidaUtil`, json);
  }

  obtenerTramiteEditar(idTramite: string){
    let params = new HttpParams().set('intIdTramite', idTramite);
    return this.http.get<RespuestaGenerica>(`${this.apiUrl}/tramites/obtenerTramiteFolio`, { params });
  }
}
