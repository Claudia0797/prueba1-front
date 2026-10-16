import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from "@angular/forms";
import { LocalStorageService } from "src/app/Services/local-storage.service";
import { SharedService } from "src/app/Services/shared.service";
import { UserService } from "src/app/Services/user.service";
import { UserDTO } from "src/app/Models/user.dto";
import { formatDate } from "@angular/common";

type ProfileFormModel = {
  name: FormControl<string>;
  surname_1: FormControl<string>;
  surname_2: FormControl<string>;
  alias: FormControl<string>;
  birth_date: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})

// Cuando estemos autenticados al sistema y vayamos al punto de menú Profile,
// deberemos poder editar nuestros datos de usuario. Para ello, deberemos completar la
// implementación del componente profile.component, concretamente:
// En el controlador profile.component.ts:
// ● Descomentar la declaración de variables.
// Buscad en el proyecto la etiqueta:
// TODO 4
export class ProfileComponent implements OnInit {
  // TODO: implementar tipo ProfileFormModel

  // TODO 4
  profileUser: UserDTO;

  name: FormControl<string>;
  surname_1: FormControl<string>;
  surname_2: FormControl<string>;
  alias: FormControl<string>;
  birth_date: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;

  profileForm: FormGroup<ProfileFormModel>;
  isValidForm: boolean | null;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
  ) {
    // TODO 5
    // ● En el constructor deberemos:
    // o Inicializar el objeto profileUser.
    this.profileUser = new UserDTO("", "", "", "", new Date(), "", "");

    // o Inicializar la variable isValidForm a null.
    this.isValidForm = null;

    // o Inicializar las diferentes propiedades del formulario:
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

    // ▪ birth_date: requerido, formato ‘yyyy-mm-dd’.
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

    // ▪ profileForm: definir el formBuilder con todas las propiedades anteriores.
    this.profileForm = this.formBuilder.group<ProfileFormModel>({
      name: this.name,
      surname_1: this.surname_1,
      surname_2: this.surname_2,
      alias: this.alias,
      birth_date: this.birth_date,
      email: this.email,
      password: this.password,
    });
  }

  async ngOnInit(): Promise<void> {
    let errorResponse: any;

    const userId = this.localStorageService.get("user_id");
    if (!userId) return;

    try {
      const userData = await this.userService.getUSerById(userId);

      this.profileForm.patchValue({
        name: userData.name,
        surname_1: userData.surname_1,
        surname_2: userData.surname_2 ?? "",
        alias: userData.alias,
        birth_date: formatDate(userData.birth_date, "yyyy-MM-dd", "en"),
        email: userData.email,
        // password NO se rellena desde backend (normalmente)
      });
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  async updateUser(): Promise<void> {
    let responseOK = false;
    this.isValidForm = false;
    let errorResponse: any;

    if (this.profileForm.invalid) return;
    this.isValidForm = true;

    const userId = this.localStorageService.get("user_id");
    if (!userId) return;

    const raw = this.profileForm.getRawValue();

    // Parse de fecha (evita problemas de zona horaria)
    const [y, m, d] = raw.birth_date.split("-").map(Number);
    const birthDate = new Date(y, m - 1, d);

    this.profileUser = new UserDTO(
      raw.name,
      raw.surname_1,
      raw.surname_2 ?? "",
      raw.alias,
      birthDate,
      raw.email,
      raw.password,
    );

    try {
      await this.userService.updateUser(userId, this.profileUser);
      responseOK = true;
    } catch (error: any) {
      responseOK = false;
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }

    await this.sharedService.managementToast(
      "profileFeedback",
      responseOK,
      errorResponse,
    );
  }
}
