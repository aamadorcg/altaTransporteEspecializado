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
    strApellidoPaterno: `El campo <strong>Apellido Paterno</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strApellidoMaterno: `El campo <strong>Apellido Materno</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strSexo: `El campo <strong>SEXO</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strFechaNac: `El campo <strong>Fecha Nacimiento</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strCalle: `El campo <strong>Calle</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strNumeroExterior: `El campo <strong>Número Exterior</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strNumeroInterior: `El campo <strong>Número Interior</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    estado: `El campo <strong>Estado</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strMunicipio: `El campo <strong>Municipio</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strLocalidad: `El campo <strong>Localidad</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strCodigoPostal: `El campo <strong>Código Postal</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strColonia: `El campo <strong>Colonia</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strTelefonoRepresentante: `El campo <strong>Teléfono Representante</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, debe contener 10 núumeros.`,
    strCorreo: `El campo <strong>Correo</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strTelefonoConcesionario: `El campo <strong>Teléfono Concesionario</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, debe contener 10 núumeros.`,
    //Fromulario Tipo Trámite
    strTramite: `El campo <strong>Revista </strong> de <strong>${this.FORM_TRAMITE}</strong>, debe estar seleccionado.`,
  };

  actualizarForm = false;
  cargarSpinner = false;
  pdfUrls: { [key: string]: any } = {};
  listaTramites: any[] = [];

  documentoGas: any;

  arregloDocumentosVisibles: any[] = [];


  buscaRFC = false;
  documentCheckedStatus: { [key: string]: boolean } = {};
  documentValidatedStatus: { [key: string]: boolean } = {};

  RFC_FISICA_PATTERN = '^([A-ZÑ&]{4})(\\d{6})([A-Z\\d]{3})$';
  RFC_MORAL_PATTERN = '^([A-ZÑ&]{3})(\\d{6})([A-Z\\d]{3})$';
  esPersonaMoral: boolean = false;
  esPersonaFisica: boolean = false;
  esModificacion: boolean = false;
  esUnidadUsada: boolean = false;
  esUnidadNueva: boolean = false;
  esNuevaPagando: boolean = false;
  esNuevaPagada: boolean = false;
  opcCveVeh: any[] = [];
  opcCveVehFiltradas: any[] = [];
  listaColonias: any[] = [];
  listaLocalidades: any[] = [];
  listaDocumentos: any[] = [];
  listaDocumentosOriginal: any[] = [];
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
  tipoVeh: string = "";
  esSeleccionadoPorAutocomplete: boolean = false;
  currencyOptions = {
    prefix: '$ ',
    thousands: ',',
    decimal: '.',
    precision: 2,
    allowNegative: false,
    align: 'right',
  };
  maxDate: Date = new Date();
  claveVehicularEdita: any;

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
    this.cargarDefaultPDFs();
    this.detectarTipoTramite();
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
      dtFechaFact: ['', [Validators.required, this.validadorMaximaFechaFactura()]],
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
      strApellidoPaterno: ['', Validators.required],
      strApellidoMaterno: ['', Validators.required],
      strSexo: [{ value: '', disabled: true }, Validators.required],
      strFechaNac: [{ value: '', disabled: true }, Validators.required],
      strCalle: ['', Validators.required],
      strNumeroExterior: ['', Validators.required],
      strNumeroInterior: ['', Validators.required],
      estado: [{ value: '', disabled: true }, Validators.required],
      strMunicipio: [{ value: '', disabled: true }, Validators.required],
      strLocalidad: [{ value: '', disabled: true }, Validators.required],
      strCodigoPostal: ['', Validators.required],
      strColonia: [{ value: '', disabled: false }, Validators.required],
      strTelefonoRepresentante: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^\d+$/)]],
      strCorreo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      strTelefonoConcesionario: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^\d+$/)]]
    });

    this.tramiteForm = this.formBuilder.group({
      strTramite: ['', Validators.required]
    });

    this.documentosUnidadForm = this.formBuilder.group({
      /*Control Vehiculo Usado General */
      solicitudTitular: [null, Validators.required],
      facturaEndosada: [null, Validators.required],
      compraVenta: [null, Validators.required],
      ineVendedor: [null, Validators.required],
      ineComprador: [null, Validators.required],
      ineTestigo: [null, Validators.required],
      oriBajaUnidad: [null, Validators.required],
      validacionTenencia: [null, Validators.required],
      ultimoPagoRefrendo: [null, Validators.required],
      polizaViajero: [null, Validators.required],
      conversionGas: [null, Validators.required],
      repuve: [null, Validators.required],
      comprobanteDom: [null, Validators.required],
      curp: [null, Validators.required],
      convenioEmpresa: [null, Validators.required],
      constanciaFis: [null, Validators.required],
      antPenales: [null, Validators.required],
      /** Control Vehiculo Usado Persona Moral **/
      idRepLegal: [null, Validators.required],
      constanciaFisMoral: [null, Validators.required],
      actaConstitutiva: [null, Validators.required],
      /*Control Vehiculo Usado Persona Fisica*/
      identificacionFisica: [null, Validators.required],
      /*Control Vehiculo Nuevo General*/
      constanciaFiscalVN: [null, Validators.required],
      idPersonaAut: [null, Validators.required],
      domicilioPersonaAut: [null, Validators.required],
      /*Control Vehiculo Nuevo General PAGANDO*/
      facturaOriginal: [null, Validators.required],
      facturaSinValor: [null, Validators.required],
      /* Control Campo Select */
      strTipoVehiculo: [null, Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
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

  validadorMaximaFechaFactura() {
    return (control: AbstractControl) => {
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        return { maxDate: true };
      }
      return null;
    };
  }

  validarFechaManual() {
    const control = this.datosFacturaForm.get('dtFechaFact');
    if (control && control.value) {
      const value = control.value;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(selectedDate.getTime())) {
        control.setErrors({ invalidDate: true });
      } else {
        const year = selectedDate.getFullYear();
        if (year < 1900) {
          control.setErrors({ minDate: true });
        }
        else if (selectedDate > today) {
          control.setErrors({ maxDate: true });
        } else {
          control.setErrors(null);
        }
      }
    } else {
      control?.setErrors({ required: true });
    }
  }


  private cargarDefaultPDFs() {
    this.defaultPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/documents/subirArchivo.pdf');
  }

  detectarTipoTramite() {
    this.activatedRoute.data.subscribe(data => {
      this.esModificacion = data['modo'] === 'modificar';
    });
    this.activatedRoute.paramMap.subscribe(params => {
      this.idTramite = params.get('intIdTramite') ?? '';
      this.cargaValoresCamposDinamicos();
      if (this.esModificacion && this.idTramite) {
        this.cargarDatosDelTramite(this.idTramite);
      } else {
        this.desactivaCampos();
        this.cargaDocumentosTramite();
      }
    });
  }

  cargarDatosDelTramite(idTramite: any) {
    
    this.cargarSpinner = true;
    this.servicios.obtenerTramiteEditar(idTramite).subscribe({
      next: (value: any) => {
        this.cargarSpinner = false;
        let infoTramite = value.data;
        if (infoTramite) {
          if (infoTramite.facturaVo) {
            this.datosFacturaForm.patchValue(infoTramite.facturaVo, { emitEvent: false });
            setTimeout(() => this.asignarClaveVehicularPorId(infoTramite.facturaVo.intIdCaCve), 300);
            this.datosFacturaForm.get('strMotor')?.patchValue(infoTramite.facturaVo.strNumeroMotor, { emitEvent: false });
            this.datosFacturaForm.get('strTipoVeh')?.patchValue(infoTramite.facturaVo.strTipo, { emitEvent: false });
            this.datosFacturaForm.get('strCombustible')?.patchValue(infoTramite.facturaVo.intIdCombustible, { emitEvent: false });
            this.datosFacturaForm.get('dtFechaFact')?.patchValue(infoTramite.facturaVo.ldFechaFactura, { emitEvent: false });
            this.datosFacturaForm.get('strNoFact')?.patchValue(infoTramite.facturaVo.strNumeroFactura, { emitEvent: false });
            this.datosFacturaForm.get('strImporteFact')?.patchValue(infoTramite.facturaVo.dblValor, { emitEvent: false });
            this.datosFacturaForm.get('strAgenciaDist')?.patchValue(infoTramite.facturaVo.strAgencia, { emitEvent: false });
            this.datosFacturaForm.get('strTipoServ')?.patchValue(infoTramite.facturaVo.strTipoServicio, { emitEvent: false });
            this.datosFacturaForm.get('strUsoVeh')?.patchValue(infoTramite.facturaVo.strUso, { emitEvent: false });
            this.datosFacturaForm.disable();
            
            this.tramiteForm.get('strTramite')?.patchValue(infoTramite.facturaVo.intIdTipoRevista, { emitEvent: false });
            this.tramiteForm.disable();

            this.documentosUnidadForm.get('strTipoVehiculo')?.patchValue(infoTramite.facturaVo.strTipoUnidad, { emitEvent: false });
            this.documentosUnidadForm.get('strTipoVehiculo')?.disable();
          }
          if (infoTramite.permisionarioVo) {
            this.datosPermisionarioForm.patchValue(infoTramite.permisionarioVo, { emitEvent: false });
            this.datosPermisionarioForm.get('estado')?.patchValue('TLAXCALA', { emitEvent: false });
            this.datosPermisionarioForm.get('strFechaNac')?.patchValue(infoTramite.permisionarioVo.ldFechaNacimiento, { emitEvent: false });
            this.datosPermisionarioForm.get('strColonia')?.patchValue(infoTramite.permisionarioVo.strColonia, { emitEvent: false });
            this.datosPermisionarioForm.get('strTelefonoRepresentante')?.patchValue(infoTramite.permisionarioVo.mediosContactoVo.strTelefonoRepresentante, { emitEvent: false });
            this.datosPermisionarioForm.get('strCorreo')?.patchValue(infoTramite.permisionarioVo.mediosContactoVo.strCorreo, { emitEvent: false });
            this.datosPermisionarioForm.get('strTelefonoConcesionario')?.patchValue(infoTramite.permisionarioVo.mediosContactoVo.strTelefonoConcesionario, { emitEvent: false });
            this.datosPermisionarioForm.disable();
          }
          if (infoTramite.documentacionVo) {
            this.limpiarValidadores();
            this.cargaInformacionDocumentos(infoTramite.documentacionVo);
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      },
    });
  }

  desactivaCampos() {
    const campoCurp = this.datosPermisionarioForm.get('strCurp');
    const campoApaterno = this.datosPermisionarioForm.get('strApellidoPaterno');
    const campoAmaterno = this.datosPermisionarioForm.get('strApellidoMaterno');
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

  cargaDocumentosTramite() {
    this.servicios.obtenerDocumentosTramite().subscribe({
      next: (value: any) => {
        this.listaDocumentosOriginal = value.data;
        this.listaDocumentos = JSON.parse(JSON.stringify(this.listaDocumentosOriginal));
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      }
    })
  }

  /* OBTENER VALORES PARA USAR EN FORMULARIO */
  cargaValoresCamposDinamicos() {
    this.servicios.obtenerCombustibles().subscribe({
      next: (value: any) => {
        this.cargarSpinner = false;
        this.listaCombustibles = value.data;
        this.asignarClaveVehicularPorId(this.claveVehicularEdita);
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

  ngAfterViewInit() {
    this.validaCamposConAutocomplete();
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

  asignarClaveVehicularPorId(id: number) {
    const objetoSeleccionado = this.opcCveVeh.find(opcion => opcion.intIdCaCve === id);
    if (objetoSeleccionado) {
      this.datosFacturaForm.get('strCveVeh')?.patchValue(objetoSeleccionado);
    }
  }

  displayFn(opcion: any): string {
    return opcion ? `${opcion.strClaveVehicular}-${opcion.strEmpresa}-${opcion.strModelo}` : '';
  }

  obtenColonias(arregloColonias: any) {
    this.listaColonias = arregloColonias.map((item: { asentamiento: any; codigoTipoAsentamiento: any; }) => ({
      asentamiento: item.asentamiento,
      codigoTipoAsentamiento: item.codigoTipoAsentamiento
    }));
  }

  /* IDENTIFICAR CAMBIOS EN FORMULARIO */
  private observarFormularios() {
    if (!this.esModificacion) {
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

      if (this.esPersonaFisica) {
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
      }

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

      this.datosPermisionarioForm.get('strCodigoPostal')?.valueChanges
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
                this.datosPermisionarioForm.get('strCodigoPostal')?.reset();
                this.datosPermisionarioForm.get('strMunicipio')?.reset();
                this.datosPermisionarioForm.get('strLocalidad')?.reset();
                this.datosPermisionarioForm.get('estado')?.reset();
                this.datosPermisionarioForm.get('strColonia')?.reset();
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
              this.datosPermisionarioForm.get('strCodigoPostal')?.patchValue('');
              this.datosPermisionarioForm.get('strMunicipio')?.reset();
              this.datosPermisionarioForm.get('strLocalidad')?.reset();
              this.datosPermisionarioForm.get('estado')?.reset();
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
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.esSeleccionadoPorAutocomplete = true;
    const selectedOption = event.option.value;
    this.datosFacturaForm.get('strCveVeh')?.setValue(selectedOption);
    this.datosFacturaForm.get('strMarca')?.setValue(selectedOption.strEmpresa);
    this.datosFacturaForm.get('strMarca')?.markAsTouched();
    this.datosFacturaForm.get('strTipoVeh')?.setValue(selectedOption.strModelo);
    this.datosFacturaForm.get('strTipoVeh')?.markAsTouched();
    this.selectedVehicleId = selectedOption.intIdCaCve;
  }

  validaNiv(value: any) {
    let json = { strNiv: value }
    this.servicios.validaNiv(json).subscribe({
      error: (err: HttpErrorResponse) => {
        this.resetFormulario('datosFacturaForm');
        this.errorGenerico(err);
      }
    })
  }

  validaRfc(value: any) {
    let json = { strRfc: value, esPersonaFisica: this.esPersonaFisica }
    this.cargarSpinner = true;
    this.servicios.validaRfc(json).subscribe({
      next: (value: any) => {
        if (value.data?.strRfc !== null) {
          this.llenaYBloqueaCampos(value.data);
          this.cargarSpinner = false;
        } else {
          this.limpiaPermisionario();
          this.cargarSpinner = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.resetFormulario('datosPermisionarioForm');
        this.errorGenerico(err);
      }
    })
  }

  llenaYBloqueaCampos(data: any) {
    if (data) {
      this.datosPermisionarioForm.patchValue(data, { emitEvent: false });
      let dataContacto = data.mediosContactoVo;
      if (dataContacto) {
        this.datosPermisionarioForm.patchValue(dataContacto, { emitEvent: false });
      }
      let dataCodigoPostal = data.strCodigoPostal;
      if (dataCodigoPostal) {
        this.datosPermisionarioForm.get('strCodigoPostal')?.patchValue(dataCodigoPostal);
        this.datosPermisionarioForm.get('strCodigoPostal')?.updateValueAndValidity();
      }
      this.datosPermisionarioForm.markAllAsTouched();
    }
  }

  convertirFecha(codigo: string): string {
    if (codigo.length !== 6) {
      throw new Error("El código debe tener 6 dígitos.");
    }

    const anioCorto: string = codigo.substring(0, 2);
    const mes: string = codigo.substring(2, 4);
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
        let descripcion = this.descripciones[primerCampoInvalido] || 'Este campo es obligatorio';
        if (primerCampoInvalido == 'strNombre') {
          if (this.esPersonaFisica) {
            descripcion = `El campo <strong>NOMBRE</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`
          } else {
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
    this.listaDocumentos = documentos;
    this.listaDocumentos.forEach((doc) => {
      const status = doc.strAceptado === 'A';
      switch (doc.strNombreDocumento) {
        case 'SOLICITUD DIRIGIDA AL TITULAR DE LA SMyT':
          if (!this.arregloDocumentosVisibles.includes('solicitudTitular')) {
            this.arregloDocumentosVisibles.push('solicitudTitular');
          }
          this.documentCheckedStatus['solicitudTitular'] = status;
          doc.strArchivo != null ? this.pdfUrls['solicitudTitular'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['solicitudTitular'] = !status;
          this.documentosUnidadForm.patchValue({ solicitudTitular: doc.strArchivo });
          break;
        case 'FACTURA ENDOSADA A FAVOR DEL CONCESIONARIO(A) O EMPRESA':
          if (!this.arregloDocumentosVisibles.includes('facturaEndosada')) {
            this.arregloDocumentosVisibles.push('facturaEndosada');
          }
          this.documentCheckedStatus['facturaEndosada'] = status;
          doc.strArchivo != null ? this.pdfUrls['facturaEndosada'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['facturaEndosada'] = !status;
          this.documentosUnidadForm.patchValue({ facturaEndosada: doc.strArchivo });
          break;
        case 'CONTRATO DE COMPRA VENTA':
          if (!this.arregloDocumentosVisibles.includes('compraVenta')) {
            this.arregloDocumentosVisibles.push('compraVenta');
          }
          this.documentCheckedStatus['compraVenta'] = status;
          doc.strArchivo != null ? this.pdfUrls['compraVenta'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['compraVenta'] = !status;
          this.documentosUnidadForm.patchValue({ compraVenta: doc.strArchivo });
          break;
        case 'INE DEL VENDEDOR':
          if (!this.arregloDocumentosVisibles.includes('ineVendedor')) {
            this.arregloDocumentosVisibles.push('ineVendedor');
          }
          this.documentCheckedStatus['ineVendedor'] = status;
          doc.strArchivo != null ? this.pdfUrls['ineVendedor'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['ineVendedor'] = !status;
          this.documentosUnidadForm.patchValue({ ineVendedor: doc.strArchivo });
          break;
        case 'INE COMPRADOR':
          if (!this.arregloDocumentosVisibles.includes('ineComprador')) {
            this.arregloDocumentosVisibles.push('ineComprador');
          }
          this.documentCheckedStatus['ineComprador'] = status;
          doc.strArchivo != null ? this.pdfUrls['ineComprador'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['ineComprador'] = !status;
          this.documentosUnidadForm.patchValue({ ineComprador: doc.strArchivo });
          break;
        case 'INE TESTIGO':
          if (!this.arregloDocumentosVisibles.includes('ineTestigo')) {
            this.arregloDocumentosVisibles.push('ineTestigo');
          }
          this.documentCheckedStatus['ineTestigo'] = status;
          doc.strArchivo != null ? this.pdfUrls['ineTestigo'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['ineTestigo'] = !status;
          this.documentosUnidadForm.patchValue({ ineTestigo: doc.strArchivo });
          break;
        case 'ORIGINAL DE LA BAJA DE LA UNIDAD QUE ENTRA':
          if (!this.arregloDocumentosVisibles.includes('oriBajaUnidad')) {
            this.arregloDocumentosVisibles.push('oriBajaUnidad');
          }
          this.documentCheckedStatus['oriBajaUnidad'] = status;
          doc.strArchivo != null ? this.pdfUrls['oriBajaUnidad'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['oriBajaUnidad'] = !status;
          this.documentosUnidadForm.patchValue({ oriBajaUnidad: doc.strArchivo });
          break;
        case 'VALIDACIÓN DE TENENCIAS EN LA DIRECCIÓN DE INGRESOS Y FISCALIZACIÓN':
          if (!this.arregloDocumentosVisibles.includes('validacionTenencia')) {
            this.arregloDocumentosVisibles.push('validacionTenencia');
          }
          this.documentCheckedStatus['validacionTenencia'] = status;
          doc.strArchivo != null ? this.pdfUrls['validacionTenencia'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['validacionTenencia'] = !status;
          this.documentosUnidadForm.patchValue({ validacionTenencia: doc.strArchivo });
          break;
        case 'RECIBO DEL ÚLTIMO PAGO DE REFRENDO':
          if (!this.arregloDocumentosVisibles.includes('ultimoPagoRefrendo')) {
            this.arregloDocumentosVisibles.push('ultimoPagoRefrendo');
          }
          this.documentCheckedStatus['ultimoPagoRefrendo'] = status;
          doc.strArchivo != null ? this.pdfUrls['ultimoPagoRefrendo'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['ultimoPagoRefrendo'] = !status;
          this.documentosUnidadForm.patchValue({ ultimoPagoRefrendo: doc.strArchivo });
          break;
        case 'PÓLIZA SEGURO DEL VIAJERO VIGENCIA MÍNIMA DE 1 MES':
          if (!this.arregloDocumentosVisibles.includes('polizaViajero')) {
            this.arregloDocumentosVisibles.push('polizaViajero');
          }
          this.documentCheckedStatus['polizaViajero'] = status;
          doc.strArchivo != null ? this.pdfUrls['polizaViajero'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['polizaViajero'] = !status;
          this.documentosUnidadForm.patchValue({ polizaViajero: doc.strArchivo });
          break;
        case 'EN CASO DE CONVERSIÓN A GAS, ORIGINAL Y COPIA DE DICTAMEN VIGENTE':
          if (!this.arregloDocumentosVisibles.includes('conversionGas')) {
            this.arregloDocumentosVisibles.push('conversionGas');
          }
          this.documentCheckedStatus['conversionGas'] = status;
          doc.strArchivo != null ? this.pdfUrls['conversionGas'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['conversionGas'] = !status;
          this.documentosUnidadForm.patchValue({ conversionGas: doc.strArchivo });
          break;
        case 'REPUVE':
          if (!this.arregloDocumentosVisibles.includes('repuve')) {
            this.arregloDocumentosVisibles.push('repuve');
          }
          this.documentCheckedStatus['repuve'] = status;
          doc.strArchivo != null ? this.pdfUrls['repuve'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['repuve'] = !status;
          this.documentosUnidadForm.patchValue({ repuve: doc.strArchivo });
          break;
        case 'COMPROBANTE DE DOMICILIO (MÁXIMO CON UNA ANTIGÜEDAD NO MAYOR DE TRES MESES) DE LUZ':
          if (!this.arregloDocumentosVisibles.includes('comprobanteDom')) {
            this.arregloDocumentosVisibles.push('comprobanteDom');
          }
          this.documentCheckedStatus['comprobanteDom'] = status;
          doc.strArchivo != null ? this.pdfUrls['comprobanteDom'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['comprobanteDom'] = !status;
          this.documentosUnidadForm.patchValue({ comprobanteDom: doc.strArchivo });
          break;
        case 'CURP':
          if (!this.arregloDocumentosVisibles.includes('curp')) {
            this.arregloDocumentosVisibles.push('curp');
          }
          this.documentCheckedStatus['curp'] = status;
          doc.strArchivo != null ? this.pdfUrls['curp'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['curp'] = !status;
          this.documentosUnidadForm.patchValue({ curp: doc.strArchivo });
          break;
        case 'CONVENIO ACTUALIZADO CON LA EMPRESA A LA QUE PRESTA EL SERVICIO':
          if (!this.arregloDocumentosVisibles.includes('convenioEmpresa')) {
            this.arregloDocumentosVisibles.push('convenioEmpresa');
          }
          this.documentCheckedStatus['convenioEmpresa'] = status;
          doc.strArchivo != null ? this.pdfUrls['convenioEmpresa'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['convenioEmpresa'] = !status;
          this.documentosUnidadForm.patchValue({ convenioEmpresa: doc.strArchivo });
          break;
        case 'CONSTANCIA DE SITUACIÓN FISCAL QUE INDIQUE ESTA OBLIGACIÓN':
          if (!this.arregloDocumentosVisibles.includes('constanciaFis')) {
            this.arregloDocumentosVisibles.push('constanciaFis');
          }
          this.documentCheckedStatus['constanciaFis'] = status;
          doc.strArchivo != null ? this.pdfUrls['constanciaFis'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['constanciaFis'] = !status;
          this.documentosUnidadForm.patchValue({ constanciaFis: doc.strArchivo });
          break;
        case 'CARTA DE ANTECEDENTES NO PENALES CON VIGENCIA NO MAYOR A 3 MESES':
          if (!this.arregloDocumentosVisibles.includes('antPenales')) {
            this.arregloDocumentosVisibles.push('antPenales');
          }
          this.documentCheckedStatus['antPenales'] = status;
          doc.strArchivo != null ? this.pdfUrls['antPenales'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['antPenales'] = !status;
          this.documentosUnidadForm.patchValue({ antPenales: doc.strArchivo });
          break;
        case 'IDENTIFICACIÓN OFICIAL DEL REPRESENTANTE LEGAL DE LA EMPRESA CON PODER NOTARIAL':
          if (!this.arregloDocumentosVisibles.includes('idRepLegal')) {
            this.arregloDocumentosVisibles.push('idRepLegal');
          }
          this.documentCheckedStatus['idRepLegal'] = status;
          doc.strArchivo != null ? this.pdfUrls['idRepLegal'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['idRepLegal'] = !status;
          this.documentosUnidadForm.patchValue({ idRepLegal: doc.strArchivo });
          break;
        case 'CONSTANCIA DE SITUACIÓN FISCAL':
          if (!this.arregloDocumentosVisibles.includes('constanciaFiscalVN')) {
            this.arregloDocumentosVisibles.push('constanciaFiscalVN');
          }
          this.documentCheckedStatus['constanciaFiscalVN'] = status;
          doc.strArchivo != null ? this.pdfUrls['constanciaFiscalVN'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['constanciaFiscalVN'] = !status;
          this.documentosUnidadForm.patchValue({ constanciaFiscalVN: doc.strArchivo });
          break;
        case 'ACTA CONSTITUTIVA':
          if (!this.arregloDocumentosVisibles.includes('actaConstitutiva')) {
            this.arregloDocumentosVisibles.push('actaConstitutiva');
          }
          this.documentCheckedStatus['actaConstitutiva'] = status;
          doc.strArchivo != null ? this.pdfUrls['actaConstitutiva'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['actaConstitutiva'] = !status;
          this.documentosUnidadForm.patchValue({ actaConstitutiva: doc.strArchivo });
          break;
        case 'IDENTIFICACIÓN OFICIAL CON FOTOGRAFÍA VIGENTE':
          if (!this.arregloDocumentosVisibles.includes('identificacionFisica')) {
            this.arregloDocumentosVisibles.push('identificacionFisica');
          }
          this.documentCheckedStatus['identificacionFisica'] = status;
          doc.strArchivo != null ? this.pdfUrls['identificacionFisica'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['identificacionFisica'] = !status;
          this.documentosUnidadForm.patchValue({ identificacionFisica: doc.strArchivo });
          break;
        case 'IDENTIFICACION OFICIAL CON FOTOGRAFIA VIGENTE DE LA PERSONA QUE AUTORIZA USO DE DOMICILIO':
          if (!this.arregloDocumentosVisibles.includes('idPersonaAut')) {
            this.arregloDocumentosVisibles.push('idPersonaAut');
          }
          this.documentCheckedStatus['idPersonaAut'] = status;
          doc.strArchivo != null ? this.pdfUrls['idPersonaAut'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['idPersonaAut'] = !status;
          this.documentosUnidadForm.patchValue({ idPersonaAut: doc.strArchivo });
          break;
        case 'COMPROBANTE DE DOMICILIO DE LA PERSONA QUE AUTORIZA USO DE DOMICILIO':
          if (!this.arregloDocumentosVisibles.includes('domicilioPersonaAut')) {
            this.arregloDocumentosVisibles.push('domicilioPersonaAut');
          }
          this.documentCheckedStatus['domicilioPersonaAut'] = status;
          doc.strArchivo != null ? this.pdfUrls['domicilioPersonaAut'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['domicilioPersonaAut'] = !status;
          this.documentosUnidadForm.patchValue({ domicilioPersonaAut: doc.strArchivo });
          break;
        case 'CARTA FACTURA ORIGINAL':
          if (!this.arregloDocumentosVisibles.includes('facturaOriginal')) {
            this.arregloDocumentosVisibles.push('facturaOriginal');
          }
          this.documentCheckedStatus['facturaOriginal'] = status;
          doc.strArchivo != null ? this.pdfUrls['facturaOriginal'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['facturaOriginal'] = !status;
          this.documentosUnidadForm.patchValue({ facturaOriginal: doc.strArchivo });
          break;
        case 'FACTURA SIN VALOR A FAVOR DEL CONCESIONARIO(A) O EMPRESA':
          if (!this.arregloDocumentosVisibles.includes('facturaSinValor')) {
            this.arregloDocumentosVisibles.push('facturaSinValor');
          }
          this.documentCheckedStatus['facturaSinValor'] = status;
          doc.strArchivo != null ? this.pdfUrls['facturaSinValor'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['facturaSinValor'] = !status;
          this.documentosUnidadForm.patchValue({ facturaSinValor: doc.strArchivo });
          break;
        case 'IDENTIFICACION OFICIAL CON FOTOGRAFIA VIGENTE DEL REPRESENTANTE LEGAL':
          if (!this.arregloDocumentosVisibles.includes('idRepLegal')) {
            this.arregloDocumentosVisibles.push('idRepLegal');
          }
          this.documentCheckedStatus['idRepLegal'] = status;
          doc.strArchivo != null ? this.pdfUrls['idRepLegal'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['idRepLegal'] = !status;
          this.documentosUnidadForm.patchValue({ idRepLegal: doc.strArchivo });
          break;
        case 'CONSTANCIA DE SITUACION FISCAL':
          if (!this.arregloDocumentosVisibles.includes('constanciaFiscalVN')) {
            this.arregloDocumentosVisibles.push('constanciaFiscalVN');
          }
          this.documentCheckedStatus['constanciaFiscalVN'] = status;
          doc.strArchivo != null ? this.pdfUrls['constanciaFiscalVN'] = this.sanitizer.bypassSecurityTrustResourceUrl(doc.strArchivo) : console.log('Documento no encontrado para: ', doc.strNombreDocumento);
          this.documentValidatedStatus['constanciaFiscalVN'] = !status;
          this.documentosUnidadForm.patchValue({ constanciaFiscalVN: doc.strArchivo });
          break;
        default:
          break;
      }
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
      case 'strTipoVehiculo':
        const controlTipoVeh = this.documentosUnidadForm.get('strTipoVehiculo');
        if (controlTipoVeh && !controlTipoVeh.value) {
          controlTipoVeh.markAsTouched();
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
      case 'strCombustible':
        control = this.datosFacturaForm.get('strCombustible');
        break;
      case 'strTipoVehiculo':
        control = this.documentosUnidadForm.get('strTipoVehiculo');
        if (selectedValue) {
          this.reiniciaTipoVehiculo();
          this.limpiarValidadores();
          if (selectedValue == "1") {
            this.esUnidadUsada = true;
            this.aplicarValidadores(['solicitudTitular', 'facturaEndosada', 'compraVenta', 'ineVendedor', 'ineComprador',
              'ineTestigo', 'oriBajaUnidad', 'validacionTenencia', 'ultimoPagoRefrendo', 'polizaViajero', 'conversionGas', 'repuve',
              'comprobanteDom', 'curp', 'convenioEmpresa', 'constanciaFis', 'antPenales']);
            if (this.esPersonaMoral) {
              this.aplicarValidadores(['idRepLegal', 'actaConstitutiva']);
            } else {
              this.aplicarValidadores(['identificacionFisica']);
            }
          } else if (selectedValue == "2" || selectedValue == "3") {
            this.esUnidadNueva = true;
            this.aplicarValidadores(['solicitudTitular', 'comprobanteDom', 'constanciaFiscalVN', 'idPersonaAut', 'domicilioPersonaAut']);
            if (selectedValue == "2") {//PAGANDO
              this.esNuevaPagando = true;
              this.esNuevaPagada = false;
              this.aplicarValidadores(['facturaOriginal', 'facturaSinValor']);
            } else {//PAGADO
              this.esNuevaPagada = true;
              this.esNuevaPagando = false;
              this.aplicarValidadores(['facturaEndosada', 'antPenales']);
            }
            if (this.esPersonaMoral) {
              this.aplicarValidadores(['actaConstitutiva', 'idRepLegal']);
            } else {
              this.aplicarValidadores(['identificacionFisica']);
            }
          }
        }
        break;

      default:
        break;
    }
    control?.setErrors(control.value ? null : { required: true });
  }

  reiniciaTipoVehiculo() {
    this.reiniciaDocumentos();
    //this.resetDocumentosForm();
    this.esUnidadUsada = false;
    this.esUnidadNueva = false;
    this.esNuevaPagando = false;
    this.esNuevaPagada = false;
  }

  limpiarValidadores(): void {
    Object.keys(this.documentosUnidadForm.controls).forEach(controlName => {
      if (controlName !== 'strTipoVehiculo' && controlName !== 'aceptaTerminos') {
        const control = this.documentosUnidadForm.get(controlName);
        if (control) {
          control.reset();
          control.clearValidators();
          control.updateValueAndValidity();
        }
      }
    });
  }

  limpiaPermisionario(): void {
    Object.keys(this.datosPermisionarioForm.controls).forEach(controlName => {
      if (controlName !== 'strRfc' && controlName !== 'strCurp' && controlName !== 'strFechaNac') {
        const control = this.datosPermisionarioForm.get(controlName);
        if (control) {
          control.reset();
          //control.clearValidators();
          control.updateValueAndValidity();
        }
      }
    });
  }

  aplicarValidadores(controles: string[]): void {
    controles.forEach(controlName => {
      const control = this.documentosUnidadForm.get(controlName);
      if (control) {
        control.setValidators(Validators.required);
        control.updateValueAndValidity();
      }
    });
  }

  resetDocumentosForm() {

  }

  obtenLocalidades(idTipoTramite: any, callback: () => void): void {
    this.servicios.obtenerLocalidades(idTipoTramite).subscribe({
      next: (value: any) => {
        this.cargarSpinner = false;
        this.listaLocalidades = value.data;
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      }
    });
  }

  validaCamposConAutocomplete() {
    const strCorreoElement = document.getElementById('strCorreo') as HTMLInputElement;
    if (strCorreoElement) {
      strCorreoElement.addEventListener('input', () => {
        const strCorreoControl = this.datosPermisionarioForm.get('strCorreo');
        if (strCorreoControl) {
          strCorreoControl.markAsDirty();
          strCorreoControl.markAsTouched();
          strCorreoControl.updateValueAndValidity();
        }
      });
    }
  }

  /**REGISTRO DE LA INFORMACIÓN CAPTURADA */
  registraInformacion() {
    let json = {};
    if (this.esModificacion) {
      this.obtenDocumentosParaModificar();
      json = {
        intIdTramite: this.idTramite,
        documentacionVo: this.listaDocumentos
      };
    } else {
      this.obtenDocumentosParaEnviar();
      this.obtenTipoVehiculo();
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
          strRepuve: this.formConcesion['strRepuve'].value,
          intIdTipoRevista: this.formRevista['strTramite'].value,
          strTipoUnidad: this.tipoVeh
        },
        permisionarioVo: {
          strRfc: this.formPermisionario['strRfc'].value,
          strCurp: this.formPermisionario['strCurp'].value,
          strNombre: this.formPermisionario['strNombre'].value,
          strApellidoPaterno: this.formPermisionario['strApellidoPaterno'].value,
          strApellidoMaterno: this.formPermisionario['strApellidoMaterno'].value,
          strSexo: this.esPersonaFisica ? this.formPermisionario['strSexo'].value.charAt(0) : '',
          ldFechaNacimiento: this.esPersonaFisica ? this.formPermisionario['strFechaNac'].value : '',
          strCalle: this.formPermisionario['strCalle'].value,
          strNumeroInterior: this.formPermisionario['strNumeroExterior'].value,
          strNumeroExterior: this.formPermisionario['strNumeroInterior'].value,
          intIdEstado: 1,
          intIdMunicipio: this.municipioId,
          intIdLocalidad: this.municipioId,
          strCodigoPostal: this.formPermisionario['strCodigoPostal'].value,
          strColonia: this.formPermisionario['strColonia'].value,
          strLocalidad: this.strMunicipio,
          strMunicipio: this.strMunicipio,
          strEstado: this.strEstado,
          mediosContactoVo:
          {
            strTelefonoRepresentante: this.formPermisionario['strTelefonoRepresentante'].value,
            strCorreo: this.formPermisionario['strCorreo'].value,
            strTelefonoConcesionario: this.formPermisionario['strTelefonoConcesionario'].value
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
              const email = this.datosPermisionarioForm.get('strCorreo')?.value;
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
    this.listaDocumentos = JSON.parse(JSON.stringify(this.listaDocumentosOriginal));
    if (this.listaDocumentos) {
      this.listaDocumentos.forEach((documento) => {
        switch (documento.strNombreDocumento) {
          case 'SOLICITUD DIRIGIDA AL TITULAR DE LA SMyT':
            documento.strArchivo = this.formDocumentos['solicitudTitular'].value
            break;
          case 'FACTURA ENDOSADA A FAVOR DEL CONCESIONARIO(A) O EMPRESA':
            documento.strArchivo = this.formDocumentos['facturaEndosada'].value
            break;
          case 'CONTRATO DE COMPRA VENTA':
            documento.strArchivo = this.formDocumentos['compraVenta'].value
            break;
          case 'INE DEL VENDEDOR':
            documento.strArchivo = this.formDocumentos['ineVendedor'].value
            break;
          case 'INE COMPRADOR':
            documento.strArchivo = this.formDocumentos['ineComprador'].value
            break;
          case 'INE TESTIGO':
            documento.strArchivo = this.formDocumentos['ineTestigo'].value
            break;
          case 'ORIGINAL DE LA BAJA DE LA UNIDAD QUE ENTRA':
            documento.strArchivo = this.formDocumentos['oriBajaUnidad'].value
            break;
          case 'VALIDACIÓN DE TENENCIAS EN LA DIRECCIÓN DE INGRESOS Y FISCALIZACIÓN':
            documento.strArchivo = this.formDocumentos['validacionTenencia'].value
            break;
          case 'RECIBO DEL ÚLTIMO PAGO DE REFRENDO':
            documento.strArchivo = this.formDocumentos['ultimoPagoRefrendo'].value
            break;
          case 'PÓLIZA SEGURO DEL VIAJERO VIGENCIA MÍNIMA DE 1 MES':
            documento.strArchivo = this.formDocumentos['polizaViajero'].value
            break;
          case 'EN CASO DE CONVERSIÓN A GAS, ORIGINAL Y COPIA DE DICTAMEN VIGENTE':
            documento.strArchivo = this.formDocumentos['conversionGas'].value
            break;

          case 'REPUVE':
            documento.strArchivo = this.formDocumentos['repuve'].value
            break;
          case 'COMPROBANTE DE DOMICILIO (MÁXIMO CON UNA ANTIGÜEDAD NO MAYOR DE TRES MESES) DE LUZ':
            documento.strArchivo = this.formDocumentos['comprobanteDom'].value
            break;
          case 'CURP':
            documento.strArchivo = this.formDocumentos['curp'].value
            break;
          case 'CONVENIO ACTUALIZADO CON LA EMPRESA A LA QUE PRESTA EL SERVICIO':
            documento.strArchivo = this.formDocumentos['convenioEmpresa'].value
            break;
          case 'CONSTANCIA DE SITUACIÓN FISCAL QUE INDIQUE ESTA OBLIGACIÓN':
            documento.strArchivo = this.formDocumentos['constanciaFis'].value
            break;
          case 'CARTA DE ANTECEDENTES NO PENALES CON VIGENCIA NO MAYOR A 3 MESES':
            documento.strArchivo = this.formDocumentos['antPenales'].value
            break;
          case 'IDENTIFICACIÓN OFICIAL DEL REPRESENTANTE LEGAL DE LA EMPRESA CON PODER NOTARIAL':
            documento.strArchivo = this.formDocumentos['idRepLegal'].value
            break;
          case 'ACTA CONSTITUTIVA':
            documento.strArchivo = this.formDocumentos['actaConstitutiva'].value
            break;
          case 'IDENTIFICACIÓN OFICIAL CON FOTOGRAFÍA VIGENTE':
            documento.strArchivo = this.formDocumentos['identificacionFisica'].value
            break;
          case 'IDENTIFICACION OFICIAL CON FOTOGRAFIA VIGENTE DE LA PERSONA QUE AUTORIZA USO DE DOMICILIO':
            documento.strArchivo = this.formDocumentos['idPersonaAut'].value
            break;
          case 'COMPROBANTE DE DOMICILIO DE LA PERSONA QUE AUTORIZA USO DE DOMICILIO':
            documento.strArchivo = this.formDocumentos['domicilioPersonaAut'].value
            break;
          case 'CARTA FACTURA ORIGINAL':
            documento.strArchivo = this.formDocumentos['facturaOriginal'].value
            break;
          case 'FACTURA SIN VALOR A FAVOR DEL CONCESIONARIO(A) O EMPRESA':
            documento.strArchivo = this.formDocumentos['facturaSinValor'].value
            break;
          case 'IDENTIFICACION OFICIAL CON FOTOGRAFIA VIGENTE DEL REPRESENTANTE LEGAL':
            documento.strArchivo = this.formDocumentos['idRepLegal'].value
            break;
          case 'CONSTANCIA DE SITUACION FISCAL':
            documento.strArchivo = this.formDocumentos['constanciaFiscalVN'].value
            break;
          case 'IDENTIFICACIÓN OFICIAL CON FOTOGRAFIA VIGENTE':
            documento.strArchivo = this.formDocumentos['identificacionFisica'].value
            break;
          default:
            break;
        }
      });
      this.listaDocumentos = this.listaDocumentos.filter(item => item.strArchivo !== null);
    }
  }

  obtenDocumentosParaModificar() {
    if (this.listaDocumentos) {
      let listaDocumentosNecesarios = this.listaDocumentos.filter(item => item.strAceptado !== 'A');
      listaDocumentosNecesarios = listaDocumentosNecesarios.map(({ strAceptado, ...resto }) => resto);
      listaDocumentosNecesarios.forEach((documento) => {
        switch (documento.strNombreDocumento) {
          case 'SOLICITUD DIRIGIDA AL TITULAR DE LA SMyT':
            documento.strArchivo = this.formDocumentos['solicitudTitular'].value
            break;
          case 'FACTURA ENDOSADA A FAVOR DEL CONCESIONARIO(A) O EMPRESA':
            documento.strArchivo = this.formDocumentos['facturaEndosada'].value
            break;
          case 'CONTRATO DE COMPRA VENTA':
            documento.strArchivo = this.formDocumentos['compraVenta'].value
            break;
          case 'INE DEL VENDEDOR':
            documento.strArchivo = this.formDocumentos['ineVendedor'].value
            break;
          case 'INE COMPRADOR':
            documento.strArchivo = this.formDocumentos['ineComprador'].value
            break;
          case 'INE TESTIGO':
            documento.strArchivo = this.formDocumentos['ineTestigo'].value
            break;
          case 'ORIGINAL DE LA BAJA DE LA UNIDAD QUE ENTRA':
            documento.strArchivo = this.formDocumentos['oriBajaUnidad'].value
            break;
          case 'VALIDACIÓN DE TENENCIAS EN LA DIRECCIÓN DE INGRESOS Y FISCALIZACIÓN':
            documento.strArchivo = this.formDocumentos['validacionTenencia'].value
            break;
          case 'RECIBO DEL ÚLTIMO PAGO DE REFRENDO':
            documento.strArchivo = this.formDocumentos['ultimoPagoRefrendo'].value
            break;
          case 'PÓLIZA SEGURO DEL VIAJERO VIGENCIA MÍNIMA DE 1 MES':
            documento.strArchivo = this.formDocumentos['polizaViajero'].value
            break;
          case 'EN CASO DE CONVERSIÓN A GAS, ORIGINAL Y COPIA DE DICTAMEN VIGENTE':
            documento.strArchivo = this.formDocumentos['conversionGas'].value
            break;
          case 'REPUVE':
            documento.strArchivo = this.formDocumentos['repuve'].value
            break;
          case 'COMPROBANTE DE DOMICILIO (MÁXIMO CON UNA ANTIGÜEDAD NO MAYOR DE TRES MESES) DE LUZ':
            documento.strArchivo = this.formDocumentos['comprobanteDom'].value
            break;
          case 'CURP':
            documento.strArchivo = this.formDocumentos['curp'].value
            break;
          case 'CONVENIO ACTUALIZADO CON LA EMPRESA A LA QUE PRESTA EL SERVICIO':
            documento.strArchivo = this.formDocumentos['convenioEmpresa'].value
            break;
          case 'CONSTANCIA DE SITUACIÓN FISCAL QUE INDIQUE ESTA OBLIGACIÓN':
            documento.strArchivo = this.formDocumentos['constanciaFis'].value
            break;
          case 'CARTA DE ANTECEDENTES NO PENALES CON VIGENCIA NO MAYOR A 3 MESES':
            documento.strArchivo = this.formDocumentos['antPenales'].value
            break;
          case 'IDENTIFICACIÓN OFICIAL DEL REPRESENTANTE LEGAL DE LA EMPRESA CON PODER NOTARIAL':
            documento.strArchivo = this.formDocumentos['idRepLegal'].value
            break;
          case 'ACTA CONSTITUTIVA':
            documento.strArchivo = this.formDocumentos['actaConstitutiva'].value
            break;
          case 'IDENTIFICACIÓN OFICIAL CON FOTOGRAFÍA VIGENTE':
            documento.strArchivo = this.formDocumentos['identificacionFisica'].value
            break;
          case 'IDENTIFICACION OFICIAL CON FOTOGRAFIA VIGENTE DE LA PERSONA QUE AUTORIZA USO DE DOMICILIO':
            documento.strArchivo = this.formDocumentos['idPersonaAut'].value
            break;
          case 'COMPROBANTE DE DOMICILIO DE LA PERSONA QUE AUTORIZA USO DE DOMICILIO':
            documento.strArchivo = this.formDocumentos['domicilioPersonaAut'].value
            break;
          case 'CARTA FACTURA ORIGINAL':
            documento.strArchivo = this.formDocumentos['facturaOriginal'].value
            break;
          case 'FACTURA SIN VALOR A FAVOR DEL CONCESIONARIO(A) O EMPRESA':
            documento.strArchivo = this.formDocumentos['facturaSinValor'].value
            break;
          case 'IDENTIFICACION OFICIAL CON FOTOGRAFIA VIGENTE DEL REPRESENTANTE LEGAL':
            documento.strArchivo = this.formDocumentos['idRepLegal'].value
            break;
          case 'CONSTANCIA DE SITUACION FISCAL':
            documento.strArchivo = this.formDocumentos['constanciaFiscalVN'].value
            break;
          case 'IDENTIFICACIÓN OFICIAL CON FOTOGRAFIA VIGENTE':
            documento.strArchivo = this.formDocumentos['identificacionFisica'].value
            break;
          default:
            break;
        }
      });
      this.listaDocumentos = listaDocumentosNecesarios;
    }
  }

  obtenTipoVehiculo() {
    let tipoVehiculo = this.formDocumentos['ineComprador'].value
    if (tipoVehiculo) {
      switch (tipoVehiculo) {
        case "1":
          this.tipoVeh = "UNIDAD USADA";
          break;
        case "2":
          this.tipoVeh = "UNIDAD NUEVA PAGANDO";
          break;
        case "3":
          this.tipoVeh = "UNIDAD NUEVA PAGADA";
          break;
        default: break;
      }
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
    //console.log(this.datosFacturaForm.controls);
    console.log(this.datosFacturaForm.get('dtFechaFact')?.hasError('maxDate') && (this.datosFacturaForm.get('dtFechaFact')?.touched || this.datosFacturaForm.get('dtFechaFact')?.dirty)
    );

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