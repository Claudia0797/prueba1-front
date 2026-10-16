import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { formatDate } from "@angular/common";
import { HeaderMenusService } from "src/app/Services/header-menus.service";
import { SharedService } from "src/app/Services/shared.service";
import { UserService } from "src/app/Services/user.service";
import { UserDTO } from "src/app/Models/user.dto";
import { HeaderMenus } from "src/app/Models/header-menus.dto";
import { NonNullAssert } from "@angular/compiler";

// TODO: implementar tipo RegisterFormModel
type RegisterFormModel = {
  name: FormControl<string>;
  surname_1: FormControl<string>;
  surname_2: FormControl<string>;
  alias: FormControl<string>;
  birth_date: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  // TODO: implementar tipo RegisterFormModel

  // TODO 16
  registerUser!: UserDTO;

  name!: FormControl<string>;
  surname_1!: FormControl<string>;
  surname_2!: FormControl<string>;
  alias!: FormControl<string>;
  birth_date!: FormControl<string>;
  email!: FormControl<string>;
  password!: FormControl<string>;

  registerForm!: FormGroup<RegisterFormModel>;
  isValidForm: boolean | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private headerMenusService: HeaderMenusService,
    private router: Router,
  ) {
    // TODO 17
    // Inicializar el objeto registerUser.
    // Inicializar la variable isValidForm a null.
    this.registerUser = new UserDTO("", "", "", "", new Date(), "", "");
    this.isValidForm = null;

    // Inicializar las diferentes propiedades del formulario:
    // ▪ name: requerido, mínimo 5 / máximo 25 caracteres.
    this.name = new FormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(25),
      ],
      nonNullable: true,
    });

    // ▪ surname_1: requerido, mínimo 5 / máximo 25 caracteres.
    this.surname_1 = new FormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(25),
      ],
      nonNullable: true,
    });

    // ▪ surname_2: opcional, mínimo 5 / máximo 25 caracteres.
    this.surname_2 = new FormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(25),
      ],
      nonNullable: true,
    });

    // ▪ alias: requerido, mínimo 5 / máximo 25 caracteres.
    this.alias = new FormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(25),
      ],
      nonNullable: true,
    });

    // ▪ birth_date: requerido, formato ‘yyyy-mm-dd.
    this.birth_date = new FormControl(
      formatDate(new Date(), "yyyy-MM-dd", "en"),
      {
        validators: [
          Validators.required,
          Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
        ],
        nonNullable: true,
      },
    );

    // ▪ email: requerido, formato de email válido.
    this.email = new FormControl("", {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    });

    // ▪ password: requerido, mínimo 8 caracteres, máximo 16.
    this.password = new FormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16),
      ],
      nonNullable: true,
    });

    // ▪ registerForm: definir el formBuilder con todas las propiedades anteriores.
    this.registerForm = this.formBuilder.group<RegisterFormModel>({
      name: this.name,
      surname_1: this.surname_1,
      surname_2: this.surname_2,
      alias: this.alias,
      birth_date: this.birth_date,
      email: this.email,
      password: this.password,
    });
  }

  ngOnInit(): void {}

  async register(): Promise<void> {
    let responseOK = false;
    this.isValidForm = false;
    let errorResponse: any;

    if (this.registerForm.invalid) {
      return;
    }

    this.isValidForm = true;

    const raw = this.registerForm.getRawValue();

    // Convertir birth_date (string yyyy-MM-dd) a Date
    const birthDate = new Date(raw.birth_date);

    // surname_2: si viene vacío, pasamos string vacío para cumplir constructor
    const surname2 = raw.surname_2 ?? "";

    this.registerUser = new UserDTO(
      raw.name,
      raw.surname_1,
      surname2,
      raw.alias,
      birthDate,
      raw.email,
      raw.password,
    );

    try {
      await this.userService.register(this.registerUser);
      responseOK = true;
    } catch (error: any) {
      responseOK = false;
      errorResponse = error.error;

      const headerInfo: HeaderMenus = {
        showAuthSection: false,
        showNoAuthSection: true,
      };
      this.headerMenusService.headerManagement.next(headerInfo);

      this.sharedService.errorLog(errorResponse);
    }

    await this.sharedService.managementToast(
      "registerFeedback",
      responseOK,
      errorResponse,
    );

    if (responseOK) {
      this.registerForm.reset();

      // Volver a setear el birth_date por defecto
      this.birth_date.setValue(formatDate(new Date(), "yyyy-MM-dd", "en"));

      this.router.navigateByUrl("home");
    }
  }
}
