import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit {
  showAuthSection: boolean;
  showNoAuthSection: boolean;

  constructor(
    private router: Router,
    private headerMenusService: HeaderMenusService,
    private localStorageService: LocalStorageService
  ) {
    this.showAuthSection = false;
    this.showNoAuthSection = true;
  }

  ngOnInit(): void {
    this.headerMenusService.headerManagement.subscribe(
      (headerInfo: HeaderMenus) => {
        if (headerInfo) {
          this.showAuthSection = headerInfo.showAuthSection;
          this.showNoAuthSection = headerInfo.showNoAuthSection;
        }
      }
    );
  }

  home(): void {
    this.router.navigateByUrl('home');
  }

  login(): void {
    this.router.navigateByUrl('login');
  }

  register(): void {
    this.router.navigateByUrl('register');
  }

  adminPosts(): void {
    this.router.navigateByUrl('posts');
  }

  adminCategories(): void {
    this.router.navigateByUrl('categories');
  }

  profile(): void {
    this.router.navigateByUrl('profile');
  }

  logout(): void {
    // TODO 15
    // En este ejercicio vamos a implementar el logout. 
    // En el fichero header.component.ts en el método logout tenemos que implementar la siguiente lógica (TODO 15): 
    // ● Utilizando el método remove del servicio localStorageService eliminar el campo user_id 
    this.localStorageService.remove("user_id");

    // ● Utilizando el método remove del servicio localStorageService eliminar el campo access_token 
    this.localStorageService.remove("access_token");

    // ● Crear una constante headerInfo de tipo HeaderMenus con las propiedades: 
    // o showAuthSection: false 
    // o showNoAuthSection: true 
    const headerInfo: HeaderMenus = {
      showAuthSection: false,
      showNoAuthSection: true,
    }

    // ● Añadir la siguiente línea para actualizar los puntos de menú: this.headerMenusService.headerManagement.next(headerInfo); 
    this.headerMenusService.headerManagement.next(headerInfo);

    // ● Y finalmente redireccionar a la home
    // this.router.navigateByUrl('home');
    this.home();
  }
}
