import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AlertaUtility } from 'src/app/shared/utilities/alerta';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material/stepper';
import { COLOR_CONFIRMAR, COLOR_SI } from 'src/app/shared/constants/colores';
import { TerminosCondicionesComponent } from 'src/app/components/terminos-condiciones/terminos-condiciones.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { AltaRevistaService } from 'src/app/services/alta-revista.service';
import { CardPdfComponent } from '../card-pdf/card-pdf.component';
import Swal from 'sweetalert2';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { filter, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';


type ClavesFormulario = 'datosFacturaForm' | 'datosPermisionarioForm' | 'tramiteForm' | 'documentosUnidadForm';

@Component({
  selector: 'app-base',
  templateUrl: './revista-transporte-especializado.component.html',
  styleUrls: ['./revista-transporte-especializado.component.css'],
})

export class AltaTransporteEspecializado {

  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChildren(CardPdfComponent) cardPdfs!: QueryList<CardPdfComponent>;

  FORM_DATOS_CONCESION = 'Datos de la Factura';
  FORM_DATOS_CONCESIONARIO = 'Datos del Permisionario';
  FORM_TRAMITE = 'Tipo de Trámite';
  FORM_DATOS_DOCUMENTOS = 'Documentos de la Unidad';
  

  descripciones: { [key: string]: string } = {
    //Formulario Datos Factura
    strNiv: `El campo <strong>Número de Identificación Vehicular</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strCveVeh: `El campo <strong>Clave Vehicular</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strMotor: `El campo <strong>Número de Motor</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strMarca: `El campo <strong>Marca</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    intModelo: `El campo <strong>Modelo</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strTipoVeh: `El campo <strong>Tipo</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    intCapacidad: `El campo <strong>Capacidad</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    intCilindros: `El campo <strong>Cilindros</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strCombustible: `El campo <strong>Combustible</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strColor: `El campo <strong>Color</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    intPuertas: `El campo <strong>Puertas</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strEntFed: `El campo <strong>Entidad Federativa</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    dtFechaFact: `El campo <strong>Fecha de la Factura</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strNoFact: `El campo <strong>No. Factura</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strImporteFact: `El campo <strong>Importe de la Factura</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strProcedencia: `El campo <strong>Procedencia</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strAgenciaDist: `El campo <strong>Agencia Distribuidora</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strTipoServ: `El campo <strong>Tipo de Servicio</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strUsoVeh: `El campo <strong>Uso del Vehículo</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strRepuve: `El campo <strong>REPUVE</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    //Formulario Permisionario
    strRfc: `El campo <strong>RFC</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strCurp: `El campo <strong>CURP</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strApPaterno: `El campo <strong>Apellido Paterno</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strApMaterno: `El campo <strong>Apellido Materno</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strSexo: `El campo <strong>SEXO</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strFechaNac: `El campo <strong>Fecha Nacimiento</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strCalleProp: `El campo <strong>Calle</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strNumExt: `El campo <strong>Número Exterior</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strNumInt: `El campo <strong>Número Interior</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    estado: `El campo <strong>Estado</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strMunicipio: `El campo <strong>Municipio</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strLocalidad: `El campo <strong>Localidad</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strCp: `El campo <strong>Código Postal</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strColonia: `El campo <strong>Colonia</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strTelefonoRepresentante: `El campo <strong>Teléfono Representante</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, debe contener 10 núumeros.`,
    strEmail: `El campo <strong>Correo</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strTelefonoContacto: `El campo <strong>Teléfono Concesionario</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, debe contener 10 núumeros.`,
    //Fromulario Tipo Trámite
    strTramite: `El campo <strong>Revista </strong> de <strong>${this.FORM_TRAMITE}</strong>, debe estar seleccionado.`,
  };

  actualizarForm = false;
  cargarSpinner = false;
  pdfUrls: { [key: string]: any } = {};
  listaTramites: any[] = [];

  documentoGas: any;
  /*Control Documentos Visibles*/
  esSolicitudTitularVis: boolean = false;
  esConvenioActualizadoVis: boolean = false;
  esTarjetaCirculacionVis: boolean = false;
  esRepuveVis: boolean = false;
  esPolizaVis: boolean = false;
  esUltimoPermisoVis: boolean = false;
  esUltimoPagoRefVis: boolean = false;
  esIneVis: boolean = false;
  esDictamenGasVis: boolean = false;
  esUltimoPagoTenVis: boolean = false;
  esConstFiscalVis: boolean = false;
  esAntNoPenalesVis: boolean = false;
  esActaConstVis: boolean = false;
  buscaRFC = false;
  documentCheckedStatus: { [key: string]: boolean } = {};
  documentValidatedStatus: { [key: string]: boolean } = {};

  RFC_FISICA_PATTERN = '^([A-ZÑ&]{4})(\\d{6})([A-Z\\d]{3})$';
  RFC_MORAL_PATTERN = '^([A-ZÑ&]{3})(\\d{6})([A-Z\\d]{3})$';
  esPersonaMoral: boolean = false;
  esPersonaFisica: boolean = false;
  esModificacion: boolean = false;
  opcCveVeh: any[] = [];
  opcCveVehFiltradas: any[] = [];
  listaColonias: any[] = [];
  listaLocalidades: any[] = [];
  listaDocumentos: any[] = [];
  listaCombustibles: any[] = [];

  datosFacturaForm!: FormGroup;
  datosPermisionarioForm!: FormGroup;
  tramiteForm!: FormGroup;
  documentosUnidadForm!: FormGroup;

  defaultPdfUrl: any;
  idTramite: string = "";
  selectedVehicleId: number | null = null;
  estadoId: string = "";
  municipioId: string = "";
  localidadId: string = "";
  strEstado: string = "";
  strMunicipio: string = "";
  strColonia: string = "";
  ID_TRAMITE: string = "1";
  esSeleccionadoPorAutocomplete: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertaUtility: AlertaUtility,
    private sanitizer: DomSanitizer,
    private modalTerminosCondiciones: NgbModal,
    private router: Router,
    private servicios: AltaRevistaService,
    private activatedRoute: ActivatedRoute
  ) { }

  /* CONFIGURACIÓN INICIAL TRÁMITE */
  ngOnInit() {
    this.inicializarFormularios();
    this.configurarRFCFisicaMoral();
    this.desactivaCampos();
    this.cargarDefaultPDFs();
    this.cargaDocumentosTramite();
    this.cargaValoresCamposDinamicos();
    this.observarFormularios();
  }

  private inicializarFormularios() {
    this.datosFacturaForm = this.formBuilder.group({
      intId: 0,
      strNiv: ['', Validators.required],
      strCveVeh: ['', Validators.required],
      strMotor: ['', Validators.required],
      strMarca: [{ value: '', disabled: true }, Validators.required],
      intModelo: ['', Validators.required],
      strTipoVeh: [{ value: '', disabled: true }, Validators.required],
      intCapacidad: ['', Validators.required],
      intCilindros: ['', Validators.required],
      strCombustible: ['', Validators.required],
      strColor: ['', Validators.required],
      intPuertas: ['', Validators.required],
      strEntFed: [{ value: 'TLAXCALA', disabled: true }, Validators.required],
      dtFechaFact: ['', Validators.required],
      strNoFact: ['', Validators.required],
      strImporteFact: ['', Validators.required],
      strProcedencia: ['', Validators.required],
      strAgenciaDist: ['', Validators.required],
      strTipoServ: ['', Validators.required],
      strUsoVeh: ['', Validators.required],
      strRepuve: ['', Validators.required]
    });

    this.datosPermisionarioForm = this.formBuilder.group({
      strRfc: ['', {
        validators: [Validators.required, this.rfcValidator()],
        updateOn: 'change'
      }],
      strCurp: ['', Validators.required],
      strNombre: ['', Validators.required],
      strApPaterno: ['', Validators.required],
      strApMaterno: ['', Validators.required],
      strSexo: [{ value: '', disabled: true }, Validators.required],
      strFechaNac: [{ value: '', disabled: true }, Validators.required],
      strCalleProp: ['', Validators.required],
      strNumExt: ['', Validators.required],
      strNumInt: ['', Validators.required],
      estado: [{ value: '', disabled: true }, Validators.required],
      strMunicipio: [{ value: '', disabled: true }, Validators.required],
      strLocalidad: [{ value: '', disabled: true }, Validators.required],
      strCP: ['', Validators.required],
      strColonia: [{ value: '', disabled: false }, Validators.required],
      strTelefonoRepresentante: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^\d+$/)]],
      strEmail: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      strTelefonoContacto: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^\d+$/)]]
    });

    this.tramiteForm = this.formBuilder.group({
      strTramite: ['', Validators.required]
    });

    this.documentosUnidadForm = this.formBuilder.group({
      solicitudTitular: [null, Validators.required],
      convenioEmpresa: [null, Validators.required],
      poliza: [null, Validators.required],
      ultimoPermiso: [null],
      tarjetaCirculacion: [null, Validators.required],
      ultimoPagoRefrendo: [null, Validators.required],
      ine: [null, Validators.required],
      constanciaFis: [null, Validators.required],
      factura: [null, Validators.required],
      cartaFactura: [null],
      curp: [null, Validators.required],
      comprobanteDom: [null, Validators.required],
      antPenales: [null, Validators.required],
      facturaUno: [null],
      facturaDos: [null],
      facturaTres: [null],
      facturaCuatro: [null],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  rfcValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const esPersonaFisica = this.esPersonaFisica;
      const esPersonaMoral = this.esPersonaMoral;
      const rfcValue = control.value;
      if (esPersonaFisica) {
        if (!rfcValue || rfcValue.length !== 13 || !new RegExp(this.RFC_FISICA_PATTERN).test(rfcValue)) {
          return { rfcInvalido: true };
        }
      } else if (esPersonaMoral) {
        if (!rfcValue || rfcValue.length !== 12 || !new RegExp(this.RFC_MORAL_PATTERN).test(rfcValue)) {
          return { rfcInvalido: true };
        }
      }
      return null;
    };
  }

  get rfcPlaceholder(): string {
    return this.esPersonaFisica ? 'R.F.C. LLLL000000AAA' : 'R.F.C. LLL000000AAA';
  }

  get rfcTooltip(): string {
    return this.esPersonaFisica
      ? 'L = Letra, 0 = Número, A = Letra ó Número, Formato válido: LLLL000000AAA'
      : 'L = Letra, 0 = Número, A = Letra ó Número, Formato válido: LLL000000AAA';
  }

  configurarRFCFisicaMoral() {
    this.activatedRoute.data.subscribe((param: any) => {
      if (param.tipo === 'F') {
        this.formPermisionario['strRfc'].setValidators([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern(this.RFC_FISICA_PATTERN)
        ]);
        this.datosPermisionarioForm.get('strRfc')?.updateValueAndValidity();
        this.esPersonaFisica = true;
      } else if (param.tipo === 'M') {
        this.formPermisionario['strRfc'].setValidators([
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12),
          Validators.pattern(this.RFC_MORAL_PATTERN)
        ]);
        this.datosPermisionarioForm.get('strRfc')?.updateValueAndValidity();
        this.esPersonaMoral = true;
      }
    });
  }

  desactivaCampos(){
    const campoCurp = this.datosPermisionarioForm.get('strCurp');
    const campoApaterno = this.datosPermisionarioForm.get('strApPaterno');
    const campoAmaterno = this.datosPermisionarioForm.get('strApMaterno');
    if (this.esPersonaFisica) {
      campoCurp?.setValidators(Validators.required);
      campoApaterno?.setValidators(Validators.required);
      campoAmaterno?.setValidators(Validators.required);
    } else {
      campoCurp?.clearValidators();
      campoApaterno?.clearValidators();
      campoAmaterno?.clearValidators();
    }
  }

  private cargarDefaultPDFs() {
    this.defaultPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/documents/subirArchivo.pdf');
  }

  cargaDocumentosTramite() {
    this.servicios.obtenerDocumentosTramite().subscribe({
      next: (value: any) => {
        this.listaDocumentos = value.data;
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      }
    })
  }

  ngAfterViewInit() {
    this.validaCamposConAutocomplete();
  }

  /* OBTENER VALORES PARA USAR EN FORMULARIO */
  cargaValoresCamposDinamicos() {

    this.servicios.obtenerCombustibles().subscribe({
      next: (value: any) => {
        this.cargarSpinner = false;
        this.listaCombustibles = value.data;
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      },
    });

    this.servicios.obtenerClavesVehiculares().subscribe({
      next: (value: any) => {
        this.cargarSpinner = false;
        this.opcCveVeh = value.data;
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      },
    });
  }

  filtrarOpciones(event: Event) {
    this.esSeleccionadoPorAutocomplete = false;
    const inputElement = event.target as HTMLInputElement;
    const valorBusqueda = inputElement?.value || '';
    this.opcCveVehFiltradas = this.opcCveVeh.filter(opcion =>
      opcion.strClaveVehicular.toLowerCase().includes(valorBusqueda.toLowerCase()) ||
      opcion.strEmpresa.toLowerCase().includes(valorBusqueda.toLowerCase()) ||
      opcion.strModelo.toLowerCase().includes(valorBusqueda.toLowerCase())
    );
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.esSeleccionadoPorAutocomplete = true;
    const selectedOption = event.option.value;
    console.log(selectedOption);
    this.datosFacturaForm.get('strCveVeh')?.setValue(selectedOption);
    this.datosFacturaForm.get('strMarca')?.setValue(selectedOption.strEmpresa);
    this.datosFacturaForm.get('strMarca')?.markAsTouched();
    this.datosFacturaForm.get('strTipoVeh')?.setValue(selectedOption.strModelo);
    this.datosFacturaForm.get('strTipoVeh')?.markAsTouched();
    this.selectedVehicleId = selectedOption.intIdCaCve;
  }

  displayFn(opcion: any): string {
    return opcion ? `${opcion.strClaveVehicular}-${opcion.strEmpresa}-${opcion.strModelo}` : '';
  }

  /* IDENTIFICAR CAMBIOS EN FORMULARIO */
  private observarFormularios() {
    this.datosFacturaForm.get('strNiv')?.valueChanges.subscribe((strNiv) => {
      if (this.actualizarForm) return;
      setTimeout(() => {
        if (strNiv?.length === 17) {
          this.validaNiv(this.formConcesion['strNiv'].value);
        }
      }, 0);
    });

    this.datosPermisionarioForm.get('strRfc')?.valueChanges.subscribe((strRfc) => {
      if (this.actualizarForm) return;
      setTimeout(() => {
        if ((strRfc && strRfc.length === 13 && this.esPersonaFisica && this.formPermisionario['strRfc'].valid) ||
          (strRfc && strRfc.length === 12 && this.esPersonaMoral && this.formPermisionario['strRfc'].valid)) {
          this.validaRfc(this.formPermisionario['strRfc'].value);
        }
      }, 0);
    });

    this.datosPermisionarioForm.get('strRfc')?.valueChanges.subscribe((rfc: string) => {
      if (rfc?.length <= 10) {
        this.datosPermisionarioForm.patchValue({ strCurp: rfc });
        if (rfc?.length < 10) {
          this.datosPermisionarioForm.patchValue({ strFechaNac: '' });
        }
      }
      if (rfc?.length >= 10) {
        const fechaNac = rfc?.substring(4, 10);
        this.datosPermisionarioForm.patchValue({ strFechaNac: this.convertirFecha(fechaNac) });
        this.datosPermisionarioForm.get('strFechaNac')?.markAsDirty();
        this.datosPermisionarioForm.get('strFechaNac')?.markAsTouched();
      }
    });

    this.datosPermisionarioForm.get('strCurp')?.valueChanges.subscribe((curp: string) => {
      if (curp?.length >= 11) {
        const genderChar = curp?.charAt(10);
        if (genderChar === 'H') {
          this.datosPermisionarioForm.patchValue({ strSexo: 'MASCULINO' });
        } else if (genderChar === 'M') {
          this.datosPermisionarioForm.patchValue({ strSexo: 'FEMENINO' });
        }
        this.datosPermisionarioForm.get('strSexo')?.markAsDirty();
        this.datosPermisionarioForm.get('strSexo')?.markAsTouched();
      } else {
        this.datosPermisionarioForm.patchValue({ strSexo: '' });
      }
    });


    this.datosPermisionarioForm.get('strCP')?.valueChanges
      .pipe(
        filter((codigoPostal: string) => codigoPostal?.length === 5),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((codigoPostal: string) => {
          this.cargarSpinner = true;
          return this.servicios.obtenerDireccion(codigoPostal).pipe(
            catchError((err) => {
              this.strMunicipio = "";
              this.strEstado = "";
              this.estadoId = "";
              this.municipioId = "";
              this.localidadId = ""
              this.datosPermisionarioForm.get('strCP')?.patchValue('');
              this.datosPermisionarioForm.get('strMunicipio')?.reset();
              this.datosPermisionarioForm.get('strLocalidad')?.reset();
              this.datosPermisionarioForm.get('estado')?.reset();
              this.errorGenerico(err);
              return of(null);
            })
          );
        }
        )
      )
      .subscribe((respuesta: any) => {
        this.cargarSpinner = false;
        if (respuesta) {
          let value = respuesta[0];
          if (value) {
            this.obtenColonias(respuesta);
            this.strMunicipio = value.descripcionIdMunicipioCodigoPostal;
            this.strEstado = value.descripcionidEstadoPais;
            this.estadoId = value.idEstadoPais;
            this.municipioId = value.codigoMunicipio;
            this.localidadId = value.codigoMunicipio;
            this.datosPermisionarioForm.get('strMunicipio')?.patchValue(this.strMunicipio);
            this.datosPermisionarioForm.get('strLocalidad')?.patchValue(this.strMunicipio);
            this.datosPermisionarioForm.get('estado')?.patchValue(this.strEstado);
          } else {
            this.strMunicipio = "";
            this.strEstado = "";
            this.estadoId = "";
            this.municipioId = "";
            this.localidadId = ""
            this.datosPermisionarioForm.get('strCP')?.patchValue('');
            this.datosPermisionarioForm.get('strMunicipio')?.reset();
            this.datosPermisionarioForm.get('strLocalidad')?.reset();
            this.datosPermisionarioForm.get('estado')?.reset();
            /* this.datosPermisionarioForm.get('strColonia')?.patchValue('');
            this.datosPermisionarioForm.get('strCP')?.reset(); */
            this.muestraError('Error al consultar código postal, inténtelo de nuevo');
          }
        }
      });

      this.datosFacturaForm.get('intModelo')?.valueChanges.subscribe((modelo: string) => {
        if (modelo?.length == 4) {
          let json = {
            intModelo: modelo
          }
          this.servicios.validarVidaUtil(json).subscribe({
            error: (err: HttpErrorResponse) => {
              this.datosFacturaForm.get('intModelo')?.reset();
              this.datosFacturaForm.get('intModelo')?.markAsDirty();
              this.errorGenerico(err);
            }
          })
        }
      });
  }

  obtenColonias(arregloColonias: any) {
    this.listaColonias = arregloColonias.map((item: { asentamiento: any; codigoTipoAsentamiento: any; }) => ({
      asentamiento: item.asentamiento,
      codigoTipoAsentamiento: item.codigoTipoAsentamiento
    }));

  }
  validaNiv(value: any) {
    let json = {
      strNiv: value
    }
    this.servicios.validaNiv(json).subscribe({
      error: (err: HttpErrorResponse) => {
        this.resetFormulario('datosFacturaForm');
        this.errorGenerico(err);
      }
    })
  }

  validaRfc(value: any) {
    let json = {
      strRfc: value,
      esPersonaFisica: this.esPersonaFisica
    }
    this.servicios.validaNiv(json).subscribe({
      next: (value: any) => {
        this.llenaYBloqueaCampos(value.data);
      },
      error: (err: HttpErrorResponse) => {
        this.resetFormulario('datosPermisionarioForm');
        this.errorGenerico(err);
      }
    })
  }

  llenaYBloqueaCampos(data: any) {
    if (data) {
      this.datosPermisionarioForm.patchValue(data);
      Object.keys(this.formPermisionario).forEach((campo) => {
        const control = this.documentosUnidadForm.get(campo);
        if (control && control.value) {
          control.disable();
        }
      });
    }
  }

  convertirFecha(codigo: string): string {
    if (codigo.length !== 6) {
      throw new Error("El código debe tener 6 dígitos.");
    }

    const anioCorto: string = codigo.substring(0, 2); // YY
    const mes: string = codigo.substring(2, 4);       // MM
    const dia: string = codigo.substring(4, 6);

    let anioCompleto: string;
    if (parseInt(anioCorto) >= 40) {
      anioCompleto = '19' + anioCorto;
    } else {
      anioCompleto = '20' + anioCorto;
    }
    return `${anioCompleto}-${mes}-${dia}`;
  }

  validaClaveVehicular(event: Event): void {
    setTimeout(() => {
      if (this.esSeleccionadoPorAutocomplete) {
        this.esSeleccionadoPorAutocomplete = false;
        return; 
      }
      const selectElement = event.target as HTMLInputElement;
      const value = selectElement.value;
      if (!value) {
        console.log('Campo vacío, no se envía la petición');
        return;
      }
      let json = {
        strDescripcion: value
      };
      this.cargarSpinner = true;
      this.servicios.validarClaveVehicular(json).subscribe({
        next: (response: any) => {
          this.cargarSpinner = false;
          console.log(response);
        },
        error: (err: HttpErrorResponse) => {
          this.datosFacturaForm.get('strCveVeh')?.reset();
          this.datosFacturaForm.get('strCveVeh')?.markAsTouched();
          this.errorGenerico(err);
        }
      });
    }, 1000);
  }
  

  /*CARGA DE DATOS A FORMULARIO */
  cargarDatosFormulario(formulario: FormGroup, nombreFormulario: ClavesFormulario, desdeNextStep: boolean) {
    if (formulario.invalid) {
      formulario.markAllAsTouched();
      const primerCampoInvalido = this.obtenerPrimerCampoInvalido(formulario);
      if (primerCampoInvalido) {
        console.log(primerCampoInvalido);
        let descripcion = this.descripciones[primerCampoInvalido] || 'Este campo es obligatorio';
        if(primerCampoInvalido == 'strNombre'){
          if(this.esPersonaFisica){
            descripcion = `El campo <strong>NOMBRE</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`
          }else{
            descripcion = `El campo <strong>RAZÓN SOCIAL</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`
          }
        }
        this.alertaUtility.mostrarAlerta({
          message: descripcion,
          icon: 'warning',
          showConfirmButton: true,
          confirmButtonColor: COLOR_CONFIRMAR,
          confirmButtonText: 'Confirmar',
          showCloseButton: false,
          allowOutsideClick: true
        });
        return;
      }
    } else {
      this.stepper.next();
    }
  }

  cargaInformacionDocumentos(documentos: any) {
    let campoDoc = '';
    if (this.esModificacion) {
      campoDoc = 'strDescDoc';
    } else {
      campoDoc = 'strNombreDocumento';
    }
    documentos.forEach((doc: any) => {
      this.listaDocumentos.forEach((doc) => {
        const status = doc.strAceptado === 'A';
        switch (doc[campoDoc]) {
          case 'SOLICITUD AL TITULAR DE SMyT':
            this.esSolicitudTitularVis = true;
            this.documentCheckedStatus['solicitudTitular'] = status;
            this.pdfUrls['solicitudTitular'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['solicitudTitular'] = !status;
            this.documentosUnidadForm.patchValue({
              solicitudTitular: doc.strArchivo
            });
            break;
          case 'convenioActualizado':
            this.esConvenioActualizadoVis = true;
            this.documentCheckedStatus['convenioActualizado'] = status;
            this.pdfUrls['convenioActualizado'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['convenioActualizado'] = !status;
            this.documentosUnidadForm.patchValue({
              convenioActualizado: doc.strArchivo
            });
            break;
          case 'tarjetaCirculacion':
            this.esTarjetaCirculacionVis = true;
            this.documentCheckedStatus['tarjetaCirculacion'] = status;
            this.pdfUrls['tarjetaCirculacion'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['tarjetaCirculacion'] = !status;
            this.documentosUnidadForm.patchValue({
              tarjetaCirculacion: doc.strArchivo
            });
            break;
          case 'repuve':
            this.esRepuveVis = true;
            this.documentCheckedStatus['repuve'] = status;
            this.pdfUrls['repuve'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['repuve'] = !status;
            this.documentosUnidadForm.patchValue({
              repuve: doc.strArchivo
            });
            break;
          case 'polizaSeguro':
            this.esPolizaVis = true;
            this.documentCheckedStatus['poliza'] = status;
            this.pdfUrls['poliza'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['poliza'] = !status;
            this.documentosUnidadForm.patchValue({
              poliza: doc.strArchivo
            });
            break;
          case 'ultimoPermiso':
            this.esUltimoPermisoVis = true;
            this.documentCheckedStatus['ultimoPermiso'] = status;
            this.pdfUrls['ultimoPermiso'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['ultimoPermiso'] = !status;
            this.documentosUnidadForm.patchValue({
              ultimoPermiso: doc.strArchivo
            });
            break;
          case 'refrendoVigenteAnual':
            this.esUltimoPagoRefVis = true;
            this.documentCheckedStatus['ultimoPagoRef'] = status;
            this.pdfUrls['ultimoPagoRef'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['ultimoPagoRef'] = !status;
            this.documentosUnidadForm.patchValue({
              ultimoPagoRef: doc.strArchivo
            });
            break;
          case 'ine':
            this.esIneVis = true;
            this.documentCheckedStatus['ine'] = status;
            this.pdfUrls['ine'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['ine'] = !status;
            this.documentosUnidadForm.patchValue({
              ine: doc.strArchivo
            });
            break;
          case 'dictamenGas':
            this.esDictamenGasVis = true;
            this.documentCheckedStatus['dictamenGas'] = status;
            this.pdfUrls['dictamenGas'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['dictamenGas'] = !status;
            this.documentosUnidadForm.patchValue({
              dictamenGas: doc.strArchivo
            });
            break;
          case 'ultimoPagoTenencia':
            this.esUltimoPagoTenVis = true;
            this.documentCheckedStatus['ultimoPagoTen'] = status;
            this.pdfUrls['ultimoPagoTen'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['ultimoPagoTen'] = !status;
            this.documentosUnidadForm.patchValue({
              ultimoPagoTen: doc.strArchivo
            });
            break;
          case 'constanciaFiscal':
            this.esConstFiscalVis = true;
            this.documentCheckedStatus['constFiscal'] = status;
            this.pdfUrls['constFiscal'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
            this.documentValidatedStatus['constFiscal'] = !status;
            this.documentosUnidadForm.patchValue({
              constFiscal: doc.strArchivo
            });
            break;
          case 'antecedentesPenales':
            if (this.esPersonaFisica) {
              this.esAntNoPenalesVis = true;
              this.documentCheckedStatus['antNoPenales'] = status;
              this.pdfUrls['antNoPenales'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
              this.documentValidatedStatus['antNoPenales'] = !status;
              this.documentosUnidadForm.patchValue({
                antNoPenales: doc.strArchivo
              });
            }
            break;
          case 'actaConstitutiva':
            if (this.esPersonaMoral) {
              this.esActaConstVis = true;
              this.documentCheckedStatus['actaConst'] = status;
              this.pdfUrls['actaConst'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
              this.documentValidatedStatus['actaConst'] = !status;
              this.documentosUnidadForm.patchValue({
                actaConst: doc.strArchivo
              });
            }
            break;
          case 'facturaUno':
            if (this.esPersonaMoral) {
              this.documentCheckedStatus['facturaUno'] = status;
              this.pdfUrls['facturaUno'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
              this.documentValidatedStatus['facturaUno'] = !status;
              this.documentosUnidadForm.patchValue({
                facturaUno: doc.strArchivo
              });
            }
            break;
          case 'facturaDos':
            if (this.esPersonaMoral) {
              this.documentCheckedStatus['facturaDos'] = status;
              this.pdfUrls['facturaDos'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
              this.documentValidatedStatus['facturaDos'] = !status;
              this.documentosUnidadForm.patchValue({
                facturaDos: doc.strArchivo
              });
            }
            break;
          case 'facturaTres':
            if (this.esPersonaMoral) {
              this.documentCheckedStatus['facturaTres'] = status;
              this.pdfUrls['facturaTres'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
              this.documentValidatedStatus['facturaTres'] = !status;
              this.documentosUnidadForm.patchValue({
                facturaTres: doc.strArchivo
              });
            }
            break;
          case 'facturaCuatro':
            if (this.esPersonaMoral) {
              this.documentCheckedStatus['facturaCuatro'] = status;
              this.pdfUrls['facturaCuatro'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo);
              this.documentValidatedStatus['facturaCuatro'] = !status;
              this.documentosUnidadForm.patchValue({
                facturaCuatro: doc.strArchivo
              });
            }
            break;
          default:
            break;
        }
      });
    });
  }

  /* ACTUALIZACIONES DE CAMPOS */

  onSelectFocus(componente: string) {
    switch (componente) {
      case 'strCombustible':
        const controlCombustible = this.datosFacturaForm.get('strCombustible');
        if (controlCombustible && !controlCombustible.value) {
          controlCombustible.markAsTouched();
        }
        break;
      case 'strTramite':
        const controlTramite = this.tramiteForm.get('strTramite');
        if (controlTramite && !controlTramite.value) {
          controlTramite.markAsTouched();
        }
        break;
      case 'strMunicipio':
        const controlMunicipio = this.tramiteForm.get('strMunicipio');
        if (controlMunicipio && !controlMunicipio.value) {
          controlMunicipio.markAsTouched();
        }
        break;
      case 'strProcedencia':
        const controlProcedencia = this.datosFacturaForm.get('strProcedencia');
        if (controlProcedencia && !controlProcedencia.value) {
          controlProcedencia.markAsTouched();
        }
        break;
      case 'strUsoVeh':
        const controlUsoVehiculo = this.datosFacturaForm.get('strUsoVeh');
        if (controlUsoVehiculo && !controlUsoVehiculo.value) {
          controlUsoVehiculo.markAsTouched();
        }
        break;
      default:
        break;
    }



  }

  onSelectChange(event: Event, campo: string): void {
    let control;
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    switch (campo) {
      case 'strTramite':
        control = this.tramiteForm.get('strTramite');
        break;
      case 'strMunicipio':
        control = this.tramiteForm.get('strMunicipio');
        if (selectedValue) {
          let json = {
            intIdMunicipio: selectedValue
          }
          this.obtenLocalidades(json, () => {
          });
        }
        break;
      case 'strTramite':
        control = this.datosFacturaForm.get('strCombustible');
        break;
      default:
        break;
    }
    console.log(campo);
    control?.setErrors(control.value ? null : { required: true });
  }

  obtenLocalidades(idTipoTramite: any, callback: () => void): void {
    this.servicios.obtenerLocalidades(idTipoTramite).subscribe({
      next: (value: any) => {
        this.cargarSpinner = false;
        this.listaLocalidades = value.data;
        //console.log(this.listaLocalidades);
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      }
    });
  }

  validaCamposConAutocomplete() {
    const strEmailElement = document.getElementById('strEmail') as HTMLInputElement;
    if (strEmailElement) {
      strEmailElement.addEventListener('input', () => {
        const strEmailControl = this.datosPermisionarioForm.get('strEmail');
        if (strEmailControl) {
          strEmailControl.markAsDirty();
          strEmailControl.markAsTouched();
          strEmailControl.updateValueAndValidity();
        }
      });
    }
  }

  /**REGISTRO DE LA INFORMACIÓN CAPTURADA */
  registraInformacion() {
    let json = {};
    if (this.esModificacion) {
      //this.obtenDocumentosParaModificar();
      json = {
        intIdTramite: this.idTramite
      };
    } else {
      this.obtenDocumentosParaEnviar();
      console.log(this.listaDocumentos)
      const fecha = new Date(this.datosFacturaForm.get('dtFechaFact')?.value);
      const fechaformato = fecha.toISOString().split('T')[0];
      json = {
        intIdTipoTramite: this.ID_TRAMITE,
        esPersonaFisica: this.esPersonaFisica,
        facturaVo: {
          strNiv: this.formConcesion['strNiv'].value,
          intIdCaCve: this.selectedVehicleId,
          strNumeroMotor: this.formConcesion['strMotor'].value,
          strMarca: this.formConcesion['strMarca'].value,
          intModelo: this.formConcesion['intModelo'].value,
          strTipo: this.formConcesion['strTipoVeh'].value,
          intCapacidad: this.formConcesion['intCapacidad'].value,
          intCilindros: this.formConcesion['intCilindros'].value,
          intIdCombustible: this.formConcesion['strCombustible'].value,
          strColor: this.formConcesion['strColor'].value,
          intPuertas: this.formConcesion['intPuertas'].value,
          intIdEntidad: 1,
          ldFechaFactura: fechaformato,
          strNumeroFactura: this.formConcesion['strNoFact'].value,
          dblValor: this.formConcesion['strImporteFact'].value,
          strProcedencia: this.formConcesion['strProcedencia'].value,
          strAgencia: this.formConcesion['strAgenciaDist'].value,
          strTipoServicio: this.formConcesion['strTipoServ'].value,
          strUso: this.formConcesion['strUsoVeh'].value,
          strRepuve: this.formConcesion['strRepuve'].value
        },
        permisionarioVo: {
          strRfc: this.formPermisionario['strRfc'].value,
          strCurp: this.formPermisionario['strCurp'].value,
          strNombre: this.formPermisionario['strNombre'].value,
          strApellidoPaterno: this.formPermisionario['strApPaterno'].value,
          strApellidoMaterno: this.formPermisionario['strApMaterno'].value,
          strSexo: this.formPermisionario['strSexo'].value.charAt(0),
          ldFechaNacimiento: this.formPermisionario['strFechaNac'].value,//Modificar
          strCalle: this.formPermisionario['strCalleProp'].value,
          strNumeroInterior: this.formPermisionario['strNumExt'].value,
          strNumeroExterior: this.formPermisionario['strNumInt'].value,
          intIdEstado: 1,
          intIdMunicipio: this.municipioId,
          intIdLocalidad: this.municipioId,
          strCodigoPostal: this.formPermisionario['strCP'].value,
          strColonia: this.formPermisionario['strColonia'].value,
          strLocalidad: this.strMunicipio,
          strMunicipio: this.strMunicipio,
          strEstado: this.strEstado,
          mediosContactoVo:
          {
            strTelefonoRepresentante: this.formPermisionario['strTelefonoRepresentante'].value,
            strCorreo: this.formPermisionario['strEmail'].value,
            strTelefonoConcesionario: this.formPermisionario['strTelefonoContacto'].value
          }
        },
        documentacionVo: this.listaDocumentos
      };
    }
    console.log(json);

    this.alertaUtility.mostrarAlerta({
      message: '¿Estás seguro que deseas guardar la información?',
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: COLOR_SI,
      confirmButtonText: 'Si',
      showDenyButton: true,
      denyButtonText: 'No',
      showCloseButton: false
    }).then(result => {
      if (result.isConfirmed) {
        this.cargarSpinner = true;
        if (this.esModificacion) {
          this.servicios.corregirTramite(json).subscribe({
            next: () => {
              this.cargarSpinner = false;
              this.alertaUtility.mostrarAlerta({
                message: 'Trámite actualizado correctamente',
                icon: 'success',
                showConfirmButton: true,
                confirmButtonColor: COLOR_SI,
                confirmButtonText: 'Aceptar',
                showCloseButton: false,
                allowOutsideClick: true
              }).then(result => {
                if (result.isConfirmed) {
                  this.reiniciaFormulario();
                }
              });
            },
            error: (err: HttpErrorResponse) => {
              this.errorGenerico(err);
            }
          });
        } else {
          this.servicios.registrarTramite(json).subscribe({
            next: (value: any) => {
              this.cargarSpinner = false;
              const email = this.datosPermisionarioForm.get('strEmail')?.value;
              let htmlTramiteEnviado: string = '';
              const strCodigo = value.data || '';
              if (email) {
                htmlTramiteEnviado = `
                      <div>
                        <h4>Estimado usuario, la solicitud fue enviada con éxito</h4>
                        <hr>
                        En un lapso de 24 a 48 horas notificaremos a través de tu <b>correo electrónico:</b>
                        <b><p style="color: #a11a5c;">${email}</p></b>
                        la información sobre el seguimiento al trámite por parte de SMyT.
                        <br>
                        <h5><b>Folio Trámite: ${strCodigo}</b></h5>
                        Gracias.
                      </div>
                    `;
              }
              Swal.fire({
                html: htmlTramiteEnviado,
                icon: 'success',
                showConfirmButton: true,
                confirmButtonColor: COLOR_SI,
                confirmButtonText: 'Aceptar',
                showCloseButton: false,
                allowOutsideClick: true,
                background: '#fff url("/assets/images/logoTlaxC2.png") center/cover no-repeat'
              }).then(result => {
                if (result.isConfirmed) {
                  this.reiniciaFormulario();
                }
              });
            }, error: (err: HttpErrorResponse) => {
              this.errorGenerico(err);
            }
          })
        }
      } else {
        this.muestraError('La operación fue cancelada');
      }
    });
  }

  obtenDocumentosParaEnviar() {
    if (this.listaDocumentos) {
      this.listaDocumentos.forEach((documento) => {
        switch (documento.strNombreDocumento) {
          case 'SOLICITUD DIRIGIDA AL TITULAR DE LA SMyT':
            documento.strArchivo = this.formDocumentos['solicitudTitular'].value
            break;
          case 'CONVENIO ACTUALIZADO CON LA EMPRESA':
            documento.strArchivo = this.formDocumentos['convenioEmpresa'].value
            break;
          case 'PÓLIZA DE SEGURO':
            documento.strArchivo = this.formDocumentos['poliza'].value
            break;
          case 'ÚLTIMO PERMISO':
            documento.strArchivo = this.formDocumentos['ultimoPermiso'].value
            break;
          case 'TARJETA DE CIRCULACIÓN':
            documento.strArchivo = this.formDocumentos['tarjetaCirculacion'].value
            break;
          case 'ÚLTIMO PAGO DE REFRENDO':
            documento.strArchivo = this.formDocumentos['ultimoPagoRefrendo'].value
            break;
          case 'INE':
            documento.strArchivo = this.formDocumentos['ine'].value
            break;
          case 'CONSTANCIA FISCAL':
            documento.strArchivo = this.formDocumentos['constanciaFis'].value
            break;
          case 'FACTURA':
            documento.strArchivo = this.formDocumentos['factura'].value
            break;
          case 'CARTA FACTURA':
            documento.strArchivo = this.formDocumentos['cartaFactura'].value
            break;
          case 'CURP':
            documento.strArchivo = this.formDocumentos['curp'].value
            break;
          case 'COMPROBANTE DE DOMICILIO':
            documento.strArchivo = this.formDocumentos['comprobanteDom'].value
            break;
          case 'CARTA DE ANTECEDENTES NO PENALES':
            documento.strArchivo = this.formDocumentos['antPenales'].value
            break;
          case 'FACTURA UNO':
            documento.strArchivo = this.formDocumentos['facturaUno'].value
            break;
          case 'FACTURA DOS':
            documento.strArchivo = this.formDocumentos['facturaDos'].value
            break;
          case 'FACTURA TRES':
            documento.strArchivo = this.formDocumentos['facturaTres'].value
            break;
          case 'FACTURA CUATRO':
            documento.strArchivo = this.formDocumentos['facturaCuatro'].value
            break;
          default:
            break;
        }
      });
      this.listaDocumentos = this.listaDocumentos.filter(item => item.strArchivo !== null);
    }
  }


  /*LIMPIEZA FORMULARIO */

  private limpiarFormulariosSiguientes(formularioActual: ClavesFormulario) {
    const formularios: ClavesFormulario[] = [
      'datosFacturaForm',
      'datosPermisionarioForm',
      'tramiteForm',
      'documentosUnidadForm',
    ];
    const indiceFormularioActual = formularios.indexOf(formularioActual);
    formularios.slice(indiceFormularioActual + 1).forEach((formulario) => {
      this.resetFormulario(formulario);
    });
  }

  private resetFormulario(nombreFormulario: ClavesFormulario) {
    const formulario = this[nombreFormulario];
    if (formulario) {
      formulario.reset();
      formulario.markAsPristine();
      formulario.markAsUntouched();
    }
  }

  reiniciaDocumentos() {
    if (this.cardPdfs) {
      this.cardPdfs.forEach((cardPdf) => {
        cardPdf.isDefaultPdf = true;
        cardPdf.pdfUrl = this.defaultPdfUrl;
      });
    }
  }

  reiniciaFormulario() {
    this.reiniciaDocumentos();
    this.stepper.reset();
    this.router.navigate([this.router.url], { skipLocationChange: true });
    this.datosFacturaForm.get('strEntFed')?.setValue('TLAXCALA');
    this.datosFacturaForm.get('strCombustible')?.reset('');
  }

  mensaje() {
    this.reiniciaDocumentos();
    this.stepper.reset();
    this.router.navigate([this.router.url], { skipLocationChange: true });
    this.datosFacturaForm.get('strEntFed')?.setValue('TLAXCALA');
    this.datosFacturaForm.get('strCombustible')?.reset('');
  }
  /* UTILIDADES  */

  private obtenerPrimerCampoInvalido(formulario: FormGroup): string {
    const controles = formulario.controls;
    for (const campo in controles) {
      if (controles[campo].invalid) {
        return campo;
      }
    }
    return '';
  }

  muestraModalConImagen(campo: string) {
    let img = '';
    if (campo === 'strRfc' && this.esPersonaFisica) {
      img = '/assets/images/LogoTlaxFisica.png';
    } else {
      img = '/assets/images/LogoTlaxMoral.png';
    }
    this.alertaUtility.mostrarAlerta({
      message: '',
      imageUrl: img,
      showCloseButton: false,
      allowOutsideClick: true,
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      }
    });
  }

  errorGenerico(err: HttpErrorResponse) {
    this.cargarSpinner = false;
    let message: string;
    if (err.error instanceof ErrorEvent) {
      message = 'Ocurrió un problema con la conexión de red. Por favor, verifica tu conexión a internet.';
    } else if (err.status === 0) {
      message = 'El servicio no está disponible en este momento.<br> Intente nuevamente más tarde.';
    }
     else {
      message = err.error.strMessage;
    }
    this.alertaUtility.mostrarAlerta({
      message: message,
      icon: 'error',
      showConfirmButton: true,
      confirmButtonColor: COLOR_CONFIRMAR,
      confirmButtonText: 'Confirmar',
      showCloseButton: false,
      allowOutsideClick: true
    });
  }

  muestraError(message: string) {
    this.alertaUtility.mostrarAlerta({
      message,
      icon: 'error',
      showConfirmButton: true,
      confirmButtonColor: COLOR_CONFIRMAR,
      confirmButtonText: 'Confirmar',
      showCloseButton: false,
      allowOutsideClick: true
    });
  }

  openModal() {
    this.modalTerminosCondiciones.open(TerminosCondicionesComponent, { size: 'xl', centered: true });
  }

  get formConcesion() {
    return this.datosFacturaForm.controls;
  }

  get formPermisionario() {
    return this.datosPermisionarioForm.controls;
  }

  get formRevista() {
    return this.tramiteForm.controls;
  }

  get formDocumentos() {
    return this.documentosUnidadForm.controls;
  }
}