import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "src/app/Services/auth.service";
import { HeaderMenusService } from "src/app/Services/header-menus.service";
import { LocalStorageService } from "src/app/Services/local-storage.service";
import { SharedService } from "src/app/Services/shared.service";
import { AuthDTO } from "src/app/Models/auth.dto";
import { HeaderMenus } from "src/app/Models/header-menus.dto";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})

export class LoginComponent implements OnInit {
  // TODO 19
  loginUser: AuthDTO;
  email: FormControl<string>;
  password: FormControl<string>;
  loginForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private sharedService: SharedService,
    private headerMenusService: HeaderMenusService,
    private localStorageService: LocalStorageService,
    private router: Router,
  ) {
    // TODO 20
    // Inicializar el objeto loginUser
    this.loginUser = new AuthDTO("", "", "", "");

    //  Inicializar las diferentes propiedades del formulario:
    // ▪ email: requerido, formato de email válido.
    // ▪ password: requerido, mínimo 8 caracteres, máximo 16.
    // ▪ loginForm: definir el formBuilder con todas las propiedades
    // anteriores.
    this.email = new FormControl("", {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    });
    this.password = new FormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16),
      ],
      nonNullable: true,
    });
    this.loginForm = this.formBuilder.group({
      email: this.email,
      password: this.password,
    });
  }

  ngOnInit(): void {}

  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    let responseOK = false;
    let errorResponse: any;

    const { email, password } = this.loginForm.getRawValue();

    this.loginUser.email = email;
    this.loginUser.password = password;

    try {
      const authToken = await this.authService.login(this.loginUser);

      responseOK = true;
      this.loginUser.user_id = authToken.user_id;
      this.loginUser.access_token = authToken.access_token;

      // Save token to localStorage
      this.localStorageService.set("user_id", this.loginUser.user_id);
      this.localStorageService.set("access_token", this.loginUser.access_token);
    } catch (error: any) {
      responseOK = false;
      errorResponse = error.error;

      const headerInfo: HeaderMenus = {
        showAuthSection: false,
        showNoAuthSection: true,
      };

      this.headerMenusService.headerManagement.next(headerInfo);
      this.sharedService.errorLog(error.error);
    }

    await this.sharedService.managementToast(
      "loginFeedback",
      responseOK,
      errorResponse,
    );

    if (responseOK) {
      const headerInfo: HeaderMenus = {
        showAuthSection: true,
        showNoAuthSection: false,
      };

      this.headerMenusService.headerManagement.next(headerInfo);
      this.router.navigateByUrl("home");
    }
  }
}
