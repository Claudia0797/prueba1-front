import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { LocalStorageService } from "src/app/Services/local-storage.service";
import { PostDTO } from "src/app/Models/post.dto";
import { PostService } from "src/app/Services/post.service";
import { SharedService } from "src/app/Services/shared.service";

@Component({
  selector: "app-posts-list",
  templateUrl: "./posts-list.component.html",
  styleUrls: ["./posts-list.component.scss"],
})
export class PostsListComponent {
  posts!: PostDTO[];

  constructor(
    private postService: PostService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService,
  ) {
    this.loadPosts();
  }
  // TODO 12

  // La carga de todos los posts del usuario mediante el servicio getPostsByUserId
  // o Tendréis que implementar el servicio getPostsByUserId del fichero
  private async loadPosts(): Promise<void> {
    let errorResponse: any;
    const userId = this.localStorageService.get("user_id");

    if (userId) {
      try {
        this.posts = await this.postService.getPostsByUserId(userId);
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }

  // El método createPost que redirigirá a ‘user/post/’ sin pasar un postId.
  createPost(): void {
    this.router.navigateByUrl("/user/post/");
  }

  // El método updatePost que redirigirá a ‘user/post/’ + postId.

  updatePost(postId: string): void {
    this.router.navigateByUrl("user/post/" + postId);
  }

  // El método deletePost que pedirá confirmación para eliminar el post. Si se cancela la confirmación no se realizará ninguna acción y si se confirma se llamará al servicio deletePost y se volverá a cargar el listado de post para que no salga el último eliminado.
  async deletePost(postId: string): Promise<void> {
    let errorResponse: any;

    // Mostrar popup de confirmación
    let result = confirm(
      "Confimación de eliminación de post con id: " + postId + " .",
    );

    if (result) {
      try {
        const rowsAffected = await this.postService.deletePost(postId);
        if (rowsAffected.affected > 0) {
          this.loadPosts();
        }
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }
}

// En el componente post-list.component (TODO 11 y TODO 12):
// En la vista post-list.component.html tendremos que implementar: - -
// El botón de añadir post.
// El listado de posts con un ngFor que muestre los campos:
// o postId.
// o title.
// o description.
// o num_likes.
// o num_dislikes.
// o Por cada fila las acciones de actualizar y eliminar
// En el controlador post-list.component.ts tendremos que implementar: - - - - -
// Una variable posts!: PostDTO[]
// La carga de todos los posts del usuario mediante el servicio getPostsByUserId
// o Tendréis que implementar el servicio getPostsByUserId del fichero
// post.service.ts ( TODO 22 ).
// El método createPost que redirigirá a ‘user/post/’ sin pasar un postId.
// El método updatePost que redirigirá a ‘user/post/’ + postId.
// El método deletePost que pedirá confirmación para eliminar el post. Si se cancela
// la confirmación no se realizará ninguna acción y si se confirma se llamará al
// servicio deletePost y se volverá a cargar el listado de post para que no salga el
// último eliminado.
// En el componente post-form.component (TODO 13 y TODO 14):
// En el controlador post-form.component.ts tendremos que implementar toda la lógica al
// igual que en el CRUD de categoría para diferenciar entre alta y edición y hacer uso del
// managementToast para mostrar feedback al usuario.
// ● Respecto a las propiedades del formulario de la entidad post:
// o title: requerido, máximo 55 caracteres.
// o description: requerido, máximo 255 caracteres.
// o publication_date: requerido, formato ‘yyyy-mm-dd’.
// o categories: array de categorías, tendrá que ser un desplegable con la
// opción de selección múltiple.
// ● En el controlador necesitaremos implementar:
// o loadCategories: para cargar las categorías del usuario.
// o ngOnInit: gestionaremos el caso de si es una edición, para cargar los
// datos del formulario.
// o editPost: para lanzar el servicio updatePost (tendremos que aplicar la
// misma lógica que en el CRUD de categorías).
// o createPost: para lanzar el servicio createPost (tendremos que aplicar la
// misma lógica que en el CRUD de categorías).
// o savePost: si el formulario es válido en función de si es alta o edición
// llamar a editPost o createPost.
// En la vista post-form.component.html tendremos que implementar:
// ● Implementar el formulario reactivo para gestionar todas las propiedades de la
// entidad post (title, description, publication_date y categories asociadas) El
// formulario al hacer submit tendrá que llamar al método savePost.
// ● No quitéis el div de la parte superior ya que vincula el id=”postFeedback” con
// los estilos y con el servicio managementToast. Tendréis que hacer uso de
// manera semejante a como se utiliza en el CRUD de categorías.
