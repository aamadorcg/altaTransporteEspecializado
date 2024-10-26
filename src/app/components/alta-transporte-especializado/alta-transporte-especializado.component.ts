import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AlertaUtility } from 'src/app/shared/utilities/alerta';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material/stepper';
import { convertirPDFbase64 } from 'src/app/shared/utilities/convertirPDFbase64';
import { COLOR_CONFIRMAR, COLOR_SI } from 'src/app/shared/constants/colores';
import { TerminosCondicionesComponent } from 'src/app/components/terminos-condiciones/terminos-condiciones.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { AltaRevistaService } from 'src/app/services/alta-revista.service';
import { CardPdfComponent } from '../card-pdf/card-pdf.component';


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
    strNiv: `El campo <strong>Número de Identificación Vehicular</strong> de <strong>${this.FORM_DATOS_CONCESION}</strong>, no debe estar vacío o el formato es no válido.`,
    strRfc: `El campo <strong>RFC</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strEmail: `El campo <strong>Correo</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, no debe estar vacío o el formato es no válido.`,
    strTelefonoContacto: `El campo <strong>Teléfono Concesionario</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, debe contener 10 núumeros.`,
    strTelefonoRepresentante: `El campo <strong>Teléfono Representante</strong> de <strong>${this.FORM_DATOS_CONCESIONARIO}</strong>, debe contener 10 núumeros.`,
    strTramite: `El campo <strong>Revista </strong> de <strong>${this.FORM_TRAMITE}</strong>, debe estar seleccionado.`,
  };

  actualizarForm = false;
  cargarSpinner = false;
  pdfUrls: { [key: string]: any } = {};
  listaTramites: any[] = [];
  arregloDocumentos: any[] = [];
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

  datosConcesionForm!: FormGroup;
  datosPermisionarioForm!: FormGroup;
  tramiteForm!: FormGroup;
  documentosUnidadForm!: FormGroup;

  defaultPdfUrl: any;

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
    this.cargaValoresCamposDinamicos();
    //this.observarFormularios();
  }

  private inicializarFormularios() {
    this.datosConcesionForm = this.formBuilder.group({
      intId: 0,
      strNiv: ['', Validators.required],
      strCveVeh: [{ value: '',disabled: false }],
      strMotor: [{ value: '',disabled: false}],
      strMarca: [{ value: '',disabled: false}],
      intModelo: [{ value: '',disabled: false}],
      strTipoVeh: [{ value: '',disabled: false}],
      intCapacidad: [{ value: '',disabled: false}],
      intCilindros: [{ value: '',disabled: false}],
      strCombustible: [{ value: '',disabled: false}],
      strColor: [{ value: '',disabled: false}],
      intPuertas: [{ value: '',disabled: false}],
      strUnidadMedida: [{ value: '',disabled: false}],
      strEntFed: [{ value: '',disabled: false}],
      dtFechaFact: [{ value: '',disabled: false}],
      strNoFact: [{ value: '',disabled: false}],
      strImporteFact: [{ value: '',disabled: false}],
      strProcedencia: [{ value: '',disabled: false}],
      strAgenciaDist: [{ value: '',disabled: false}],
      strTipoServ: [{ value: '',disabled: false}],
      strUsoVeh: [{ value: '',disabled: false}],
      strRepuve: [{ value: '',disabled: false}]
    });

    this.datosPermisionarioForm = this.formBuilder.group({
      strRfc: ['', {
        validators: [Validators.required, this.rfcValidator()],
        updateOn: 'change'
      }],
      strNombre: [{ value: '',disabled: false}],
      strCurp: [{ value: '',disabled: false}],
      strApPaterno: [{ value: '',disabled: false}],
      strApMaterno: [{ value: '',disabled: false}],
      strCalleProp: [{ value: '',disabled: false}],
      strNumExt: [{ value: '',disabled: false}],
      strNumInt: [{ value: '',disabled: false}],
      strColonia: [{ value: '',disabled: false}],
      strLocalidad: [{ value: '',disabled: false}],
      strMunicipio: [{ value: '',disabled: false}],
      estado: [{ value: '',disabled: false}],
      strSexo: [{ value: '',disabled: false}],
      strFechaNac: [{ value: '',disabled: false}],
      strCP: [{ value: '',disabled: false}],
      strTelefonoRepresentante: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^\d+$/)]],
      strEmail: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      strTelefonoContacto: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^\d+$/)]] 

    });

    this.tramiteForm = this.formBuilder.group({
      strTramite: ['', Validators.required]
    });

    this.documentosUnidadForm = this.formBuilder.group({
      tarjetaCirculacion: [null, Validators.required],
      repuve: [null, Validators.required],
      poliza: [null, Validators.required],
      dictamenGas: [null, Validators.required],
      ine: [null, Validators.required],
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
        this.formConcesionario['strRfc'].setValidators([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern(this.RFC_FISICA_PATTERN)
        ]);
        this.datosPermisionarioForm.get('strRfc')?.updateValueAndValidity();
        this.esPersonaFisica = true;
      } else if (param.tipo === 'M') {
        this.formConcesionario['strRfc'].setValidators([
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

  // private cargarDefaultPDFs() {
  //   const defaultPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/documents/subirArchivo.pdf');
  //   this.pdfUrls = {
  //     tarjetaCirculacion: defaultPdfUrl,
  //     repuve: defaultPdfUrl,
  //     poliza: defaultPdfUrl,
  //     dictamenGas: defaultPdfUrl,
  //     ine: defaultPdfUrl,
  //   };
  // }
  private cargarDefaultPDFs() {
    const defaultPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/documents/subirArchivo.pdf');
    this.defaultPdfUrl = defaultPdfUrl;
  }

  // Agregar a reiniciaFormulario() o metodo similar
  reiniciaDocumentos() {
    if (this.cardPdfs) {
      this.cardPdfs.forEach((cardPdf) => {
        cardPdf.isDefaultPdf = true;
      });
    }
  }

  ngAfterViewInit() {
    this.validaCamposConAutocomplete();
  }

  /* IDENTIFICAR CAMBIOS EN FORMULARIO */
  private observarFormularios() {
    //TODO: Verificar con Eduardo que eventos deben lanzarse durante la captura de datos en el formulario
  }

  /* OBTENER VALORES PARA USAR EN FORMULARIO */
  cargaValoresCamposDinamicos(){
    //TODO Identificar que campos obtienen valores dinámicamente -> Entidad Federativa, Tipo Servicio, etc
    //TODO Reemplazar por consumo endpoint para obtener claves vehiculares
    this.opcCveVeh = [
      {
        "strCveVeh": "0000001",
        "nombre": "Opcion 1"
    },
    {
        "strCveVeh": "0000002",
        "nombre": "Opcion 2"
    },
    {
        "strCveVeh": "0000003",
        "nombre": "Opcion 3"
    },
    {
        "strCveVeh": "0000004",
        "nombre": "Opcion 4"
    },
    {
        "strCveVeh": "0000005",
        "nombre": "Opcion 5"
    },
    {
        "strCveVeh": "0000006",
        "nombre": "Opcion 6"
    },
    {
        "strCveVeh": "0000007",
        "nombre": "Opcion 7"
    },
    {
        "strCveVeh": "0000008",
        "nombre": "Opcion 8"
    },
    {
        "strCveVeh": "0000009",
        "nombre": "Opcion 9"
    },
    {
        "strCveVeh": "0000010",
        "nombre": "Opcion 10"
    },
    {
        "strCveVeh": "0000011",
        "nombre": "Opcion 11"
    },
    {
        "strCveVeh": "0000012",
        "nombre": "Opcion 12"
    },
    {
        "strCveVeh": "0000013",
        "nombre": "Opcion 13"
    },
    {
        "strCveVeh": "0000014",
        "nombre": "Opcion 14"
    },
    {
        "strCveVeh": "0000015",
        "nombre": "Opcion 15"
    }
    ];
    this.opcCveVehFiltradas = this.opcCveVeh;
  }

  filtrarOpciones(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const valorBusqueda = inputElement?.value || '';
    this.opcCveVehFiltradas = this.opcCveVeh.filter(opcion =>
        opcion.nombre.toLowerCase().includes(valorBusqueda.toLowerCase())
    );
}

/*CARGA DE DATOS A FORMULARIO */

  cargarDatosFormulario(formulario: FormGroup, nombreFormulario: ClavesFormulario, desdeNextStep: boolean) {
   if (formulario.invalid) {
      formulario.markAllAsTouched();
      const primerCampoInvalido = this.obtenerPrimerCampoInvalido(formulario);
      if (primerCampoInvalido) {
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
    }else{
      this.stepper.next();
    }
  }

  pdfSeleccionado(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      const fileType = file.type;
      if (fileType !== 'application/pdf') {
        this.alertaUtility.mostrarAlerta({
          message: 'Por favor selecciona un archivo PDF.',
          icon: 'warning',
          showConfirmButton: true,
          confirmButtonColor: COLOR_CONFIRMAR,
          confirmButtonText: 'Confirmar',
          showCloseButton: false,
          allowOutsideClick: true
        });
        input.value = '';
        return;
      }
      convertirPDFbase64(file).then((base64: string) => {
        this.documentosUnidadForm.patchValue({
          [controlName]: base64
        });
        const fileURL = URL.createObjectURL(file);
        this.pdfUrls[controlName] = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      }).catch(() => {
        this.alertaUtility.mostrarAlerta({
          message: 'Error al procesar el archivo PDF.',
          icon: 'warning',
          showConfirmButton: true,
          confirmButtonColor: COLOR_CONFIRMAR,
          confirmButtonText: 'Confirmar',
          showCloseButton: false,
          allowOutsideClick: true
        });
        input.value = '';
      });
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
      this.arregloDocumentos.forEach((doc) => {
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

  /* ACTUALIZACIONES DE CAMPOS */

  onSelectFocus() {
    const control = this.tramiteForm.get('strTramite');
    if (control && !control.value) {
      control.markAsTouched();
    }
  }

  onSelectChange() {
    const control = this.tramiteForm.get('strTramite');
    control?.setErrors(control.value ? null : { required: true });
  }

  validaCamposConAutocomplete(){
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
  registraInformacion(){
  //TODO: Definir objeto a enviar a backend para registro de trámite
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

  openModal() {
    this.modalTerminosCondiciones.open(TerminosCondicionesComponent, { size: 'xl', centered: true });
  }

  get formConcesion() {
    return this.datosConcesionForm.controls;
  }

  get formConcesionario() {
    return this.datosPermisionarioForm.controls;
  }

  get formRevista() {
    return this.tramiteForm.controls;
  }

  get formDocumentos() {
    return this.documentosUnidadForm.controls;
  }
}