import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { HeaderMenus } from "src/app/Models/header-menus.dto";
import { PostDTO } from "src/app/Models/post.dto";
import { HeaderMenusService } from "src/app/Services/header-menus.service";
import { LocalStorageService } from "src/app/Services/local-storage.service";
import { PostService } from "src/app/Services/post.service";
import { SharedService } from "src/app/Services/shared.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  posts!: PostDTO[];
  showButtons: boolean;
  constructor(
    private postService: PostService,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService,
    private router: Router,
    private headerMenusService: HeaderMenusService,
  ) {
    this.showButtons = false;
    this.loadPosts();
  }

  ngOnInit(): void {
    this.headerMenusService.headerManagement.subscribe(
      (headerInfo: HeaderMenus) => {
        if (headerInfo) {
          this.showButtons = headerInfo.showAuthSection;
        }
      },
    );
  }
  private async loadPosts(): Promise<void> {
    // TODO 2
    // - En el controlador home.component.ts: falta implementar la carga de todos los
    // posts en el método loadPosts. Para ello debemos seguir la lógica siguiente:
    // o Definir la variable errorResponse.
    // o Leer de localStorageService el campo userId, si lo tenemos, asignar a la
    // variable showButtons a true. Esta variable nos servirá después para
    // mostrar o no los botones de like o dislike de la vista.
    // o Implementar el try/catch para llamar al getPosts y guardar el resultado en
    // la variable posts.
    // o En caso de error pasárselo al sharedService.errorLog.

    let errorResponse: any;

    const userId = this.localStorageService.get("user_id");
    if (userId) {
      this.showButtons = true;
    }

    try {
      this.posts = await this.postService.getPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  async like(postId: string): Promise<void> {
    let errorResponse: any;
    try {
      await this.postService.likePost(postId);
      this.loadPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  async dislike(postId: string): Promise<void> {
    let errorResponse: any;
    try {
      await this.postService.dislikePost(postId);
      this.loadPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }
}
