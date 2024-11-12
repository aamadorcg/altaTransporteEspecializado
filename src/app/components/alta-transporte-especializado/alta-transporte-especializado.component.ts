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


type ClavesFormulario = 'datosConcesionForm' | 'datosPermisionarioForm' | 'tramiteForm' | 'documentosUnidadForm';

@Component({
  selector: 'app-base',
  templateUrl: './alta-transporte-especializado.component.html',
  styleUrls: ['./alta-transporte-especializado.component.css'],
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
    strUnidadMedida: `El campo <strong>Unidad de Medida</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
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
    strNombre: `El campo <strong>Nombre</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
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
  esPersonaFisica: boolean = false;
  esPersonaMoral: boolean = false;
  esModificacion: boolean = false;
  opcCveVeh: any[] = [];
  opcCveVehFiltradas: any[] = [];
  listaMunicipios: any[] = [];
  listaLocalidades: any[] = [];
  listaDocumentos: any[] = [];

  datosConcesionForm!: FormGroup;
  datosPermisionarioForm!: FormGroup;
  tramiteForm!: FormGroup;
  documentosUnidadForm!: FormGroup;

  defaultPdfUrl: any;
  idTramite: string = "";

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
    this.cargaDocumentosTramite();
    this.cargaValoresCamposDinamicos();
    this.observarFormularios();
  }

  private inicializarFormularios() {
    this.datosConcesionForm = this.formBuilder.group({
      intId: 0,
      strNiv: ['', Validators.required],
      strCveVeh: ['', Validators.required],
      strMotor: ['', Validators.required],
      strMarca: ['', Validators.required],
      intModelo: ['', Validators.required],
      strTipoVeh: ['', Validators.required],
      intCapacidad: ['', Validators.required],
      intCilindros: ['', Validators.required],
      strCombustible: ['', Validators.required],
      strColor: ['', Validators.required],
      intPuertas: ['', Validators.required],
      strUnidadMedida: ['', Validators.required],
      strEntFed: ['', Validators.required],
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
      estado: ['', Validators.required],
      strMunicipio: ['', Validators.required],
      strLocalidad: ['', Validators.required],
      strCP: ['', Validators.required],
      strColonia: ['', Validators.required],
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
      ultimoPermiso: [null, Validators.required],
      tarjetaCirculacion: [null, Validators.required],
      ultimoPagoRefrendo: [null, Validators.required],
      ine: [null, Validators.required],
      constanciaFis: [null, Validators.required],
      factura: [null, Validators.required],
      curp: [null, Validators.required],
      comprobanteDom: [null, Validators.required],
      antPenales: [null, Validators.required],
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
    /* this.opcCveVeh = [
      {
        "strCveVeh": "0000001",
        "nombre": "Opcion 1"
      }
    ]; */
    this.servicios.obtenerClavesVehiculares().subscribe({
      next: (value: any) => {
        this.cargarSpinner = false;
        this.opcCveVeh = value.data;
        // this.opcCveVehFiltradas = this.opcCveVeh;
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      },
    });

    let jsonEstados = {
      intIdEstado: 1
    }
    this.servicios.obtenerMunicipios(jsonEstados).subscribe({
      next: (value: any) => {
        this.cargarSpinner = false;
        this.listaMunicipios = value.data;
      },
      error: (err: HttpErrorResponse) => {
        this.errorGenerico(err);
      }
    });
  }

  filtrarOpciones(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const valorBusqueda = inputElement?.value || '';
    this.opcCveVehFiltradas = this.opcCveVeh.filter(opcion =>
      opcion.strClaveVehicular.toLowerCase().includes(valorBusqueda.toLowerCase()) ||
      opcion.strEmpresa.toLowerCase().includes(valorBusqueda.toLowerCase()) ||
      opcion.strModelo.toLowerCase().includes(valorBusqueda.toLowerCase())
    );
  }

  /* IDENTIFICAR CAMBIOS EN FORMULARIO */
  private observarFormularios() {
    this.datosConcesionForm.get('strNiv')?.valueChanges.subscribe((strNiv) => {
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
      if (rfc.length <= 10) {
        this.datosPermisionarioForm.patchValue({ strCurp: rfc });
        if (rfc.length < 10) {
          this.datosPermisionarioForm.patchValue({ strFechaNac: '' });
        }
      }
      if (rfc.length >= 10) {
        const fechaNac = rfc.substring(4, 10);
        this.datosPermisionarioForm.patchValue({ strFechaNac: this.convertirFecha(fechaNac) });
        this.datosPermisionarioForm.get('strFechaNac')?.markAsDirty();
        this.datosPermisionarioForm.get('strFechaNac')?.markAsTouched();
      }

    });

    this.datosPermisionarioForm.get('strCurp')?.valueChanges.subscribe((curp: string) => {
      if (curp.length >= 11) {
        const genderChar = curp.charAt(10);
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
  }

  validaNiv(value: any) {
    let json = {
      strNiv: value
    }
    this.servicios.validaNiv(json).subscribe({
      error: (err: HttpErrorResponse) => {
        this.resetFormulario('datosConcesionForm');
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
    return `${dia}-${mes}-${anioCompleto}`;
  }

  /*CARGA DE DATOS A FORMULARIO */
  cargarDatosFormulario(formulario: FormGroup, nombreFormulario: ClavesFormulario, desdeNextStep: boolean) {
    if (formulario.invalid) {
      formulario.markAllAsTouched();
      const primerCampoInvalido = this.obtenerPrimerCampoInvalido(formulario);
      if (primerCampoInvalido) {
        console.log(primerCampoInvalido);
        const descripcion = this.descripciones[primerCampoInvalido] || 'Este campo es obligatorio';
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
          default:
            break;
        }
      });
    });
  }

  /* ACTUALIZACIONES DE CAMPOS */

  onSelectFocus() {
    const controlTramite = this.tramiteForm.get('strTramite');
    if (controlTramite && !controlTramite.value) {
      controlTramite.markAsTouched();
    }
    const controlMunicipio = this.tramiteForm.get('strMunicipio');
    if (controlMunicipio && !controlMunicipio.value) {
      controlMunicipio.markAsTouched();
    }
  }

  onSelectChange(event: Event): void {
    const control = this.tramiteForm.get('strTramite');
    control?.setErrors(control.value ? null : { required: true });
    const campoMunicipio = this.datosPermisionarioForm.get('strMunicipio');
    campoMunicipio?.setErrors(campoMunicipio.value ? null : { required: true });
    if (campoMunicipio) {
      const selectElement = event.target as HTMLSelectElement;
      const selectedValue = selectElement.value;
      if (selectedValue) {
        let json = {
          intIdMunicipio: selectedValue
        }
        this.obtenLocalidades(json, () => {
        });
      }
    }

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
      json = {
        intIdTipoTramite: 13,
        esPersonaFisica: this.esPersonaFisica,
        facturaVo: {
          strNiv: this.formConcesion['strNiv'].value,
          intIdCaCve: this.formConcesion['strCveVeh'].value,
          strNumeroMotor: this.formConcesion['strMotor'].value,
          strMarca: this.formConcesion['strMarca'].value,
          intModelo: this.formConcesion['intModelo'].value,
          strTipo: this.formConcesion['strTipoVeh'].value,
          intCapacidad: this.formConcesion['intCapacidad'].value,
          intCilindros: this.formConcesion['intCilindros'].value,
          intIdCombustible: this.formConcesion['strCombustible'].value,
          strColor: this.formConcesion['strColor'].value,
          intPuertas: this.formConcesion['intPuertas'].value,
          strUnidadMedida: this.formConcesion['strUnidadMedida'].value,
          intIdEntidad: this.formConcesion['strEntFed'].value,
          ldFechaFactura: this.formConcesion['dtFechaFact'].value,
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
          strSexo: this.formPermisionario['strSexo'].value,
          ldFechaNacimiento: this.formPermisionario['strFechaNac'].value,
          strCalle: this.formPermisionario['strCalleProp'].value,
          strNumeroInterior: this.formPermisionario['strNumExt'].value,
          strNumeroExterior: this.formPermisionario['strNumInt'].value,
          intIdEstado: this.formPermisionario['estado'].value,
          intIdMunicipio: this.formPermisionario['strMunicipio'].value,
          intIdLocalidad: this.formPermisionario['strLocalidad'].value,
          strCodigoPostal: this.formPermisionario['strCP'].value,
          strColonia: this.formPermisionario['strColonia'].value,
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
          case 'SOLICITUD AL TITULAR DE SMyT':
            documento.strArchivo = this.formDocumentos['solicitudTitular'].value
            break;
          case 'CONVENIO ACTUALIZADO':
            documento.strArchivo = this.formDocumentos['convenioEmpresa'].value
            break;
          case 'POLIZA SEGURO':
            documento.strArchivo = this.formDocumentos['poliza'].value
            break;
          case 'ULTIMO PERMISO':
            documento.strArchivo = this.formDocumentos['ultimoPermiso'].value
            break;
          case 'TARJETA DE CIRCULACION':
            documento.strArchivo = this.formDocumentos['tarjetaCirculacion'].value
            break;
          case 'ULTIMO PAGO DE REFRENDO':
            documento.strArchivo = this.formDocumentos['ultimoPagoRefrendo'].value
            break;
          case 'INE':
            documento.strArchivo = this.formDocumentos['ine'].value
            break;
          case 'CONSTANCIA FISCAL':
            documento.strArchivo = this.formDocumentos['constanciaFis'].value
            break;
          case 'CARTA FACTURA':
            documento.strArchivo = this.formDocumentos['factura'].value
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
          default:
            break;
        }
      });
    }
  }


  /*LIMPIEZA FORMULARIO */

  private limpiarFormulariosSiguientes(formularioActual: ClavesFormulario) {
    const formularios: ClavesFormulario[] = [
      'datosConcesionForm',
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
      });
    }
  }

  reiniciaFormulario() {

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

  obtenerURLFormulario(formulario: string) {
    let endpoint = '';
    switch (formulario) {
      case 'datosConcesionForm':
        endpoint = '';
        break;
      case 'datosPermisionarioForm':
        endpoint = '';
        break;
      case 'tramiteForm':
        endpoint = '';
        break;
      case 'documentosUnidadForm':
        endpoint = '';
        break;
      default:
        throw new Error(`No existe un endpoint para el formulario: ${formulario}`);
    }
    return endpoint;
  }

  errorGenerico(err: HttpErrorResponse) {
    this.cargarSpinner = false;
    let message: string;
    if (err.error instanceof ErrorEvent) {
      message = 'Ocurrió un problema con la conexión de red. Por favor, verifica tu conexión a internet.';
    } else if (err.status === 0) {
      message = 'El servicio no está disponible en este momento.<br> Intente nuevamente más tarde.';
    } else {
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
    return this.datosConcesionForm.controls;
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