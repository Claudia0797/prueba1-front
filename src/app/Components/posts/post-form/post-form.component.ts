import { formatDate } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CategoryDTO } from "src/app/Models/category.dto";
import { CategoryService } from "src/app/Services/category.service";
import { LocalStorageService } from "src/app/Services/local-storage.service";
import { PostDTO } from "src/app/Models/post.dto";
import { PostService } from "src/app/Services/post.service";
import { SharedService } from "src/app/Services/shared.service";

type PostFormModel = {
  title: FormControl<string>;
  description: FormControl<string>;
  publication_date: FormControl<string>;
  categories: FormControl<CategoryDTO[]>;
};

@Component({
  selector: "app-post-form",
  templateUrl: "./post-form.component.html",
  styleUrls: ["./post-form.component.scss"],
})
export class PostFormComponent implements OnInit {
  post: PostDTO;
  // Para guardar la lista del desplegable
  categoriesList: CategoryDTO[] = [];

  title: FormControl<string>;
  description: FormControl<string>;
  publication_date: FormControl<string>;
  categories_control: FormControl<CategoryDTO[]>;

  postForm: FormGroup<PostFormModel>;
  isValidForm: boolean | null;

  private isUpdateMode: boolean;
  private validRequest: boolean;
  private postId: string | null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private categoryService: CategoryService,
  ) {
    this.isValidForm = null;
    this.postId = this.activatedRoute.snapshot.paramMap.get("id");
    this.post = new PostDTO("", "", 0, 0, new Date());
    this.post.categories = [];
    this.isUpdateMode = false;
    this.validRequest = false;

    // ● Respecto a las propiedades del formulario de la entidad post:
    // o title: requerido, máximo 55 caracteres.
    this.title = new FormControl(this.post.title, {
      validators: [Validators.required, Validators.maxLength(55)],
      nonNullable: true,
    });

    // o description: requerido, máximo 255 caracteres.
    this.description = new FormControl(this.post.description, {
      validators: [Validators.required, Validators.maxLength(255)],
      nonNullable: true,
    });

    // o publication_date: requerido, formato ‘yyyy-mm-dd’.
    this.publication_date = new FormControl(
      formatDate(this.post.publication_date, "yyyy-MM-dd", "en"),
      {
        validators: [
          Validators.required,
          Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
        ],
        nonNullable: true,
      },
    );

    // o categories: array de categorías, tendrá que ser un desplegable con la opción de selección múltiple.
    this.categories_control = new FormControl([], {
      nonNullable: true,
      validators: [Validators.required],
    });

    this.postForm = this.formBuilder.group<PostFormModel>({
      title: this.title,
      description: this.description,
      publication_date: this.publication_date,
      categories: this.categories_control,
    });
  }

  // TODO 13
  // ● En el controlador necesitaremos implementar:
  // o ngOnInit: gestionaremos el caso de si es una edición, para cargar los datos del formulario.
  async ngOnInit(): Promise<void> {
    let errorResponse: any;
    await this.loadCategories();

    if (this.isUpdateMode && this.postId) {
      try {
        const postData = await this.postService.getPostById(this.postId);
        this.post = postData;
        this.description.setValue(postData.description);
        this.publication_date.setValue(
          formatDate(postData.publication_date, "yyyy-MM-dd", "en"),
        );
        this.categories_control.setValue(postData.categories);
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }

  // o loadCategories: para cargar las categorías del usuario
  private async loadCategories(): Promise<void> {
    let errorResponse: any;
    const userId = this.localStorageService.get("user_id");

    if (userId) {
      try {
        this.categoriesList =
          await this.categoryService.getCategoriesByUserId(userId);
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }

  // o editPost: para lanzar el servicio updatePost (tendremos que aplicar la
  // misma lógica que en el CRUD de categorías).
  private async editPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    if (this.postId) {
      const userId = this.localStorageService.get("user_id");

      if (userId) {
        this.post.userId = userId;
        try {
          await this.postService.updatePost(this.postId, this.post);
          responseOK = true;
        } catch (error: any) {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }

        await this.sharedService.managementToast(
          "postFeedback",
          responseOK,
          errorResponse,
        );

        if (responseOK) {
          this.router.navigateByUrl("posts");
        }
      }
    }
    return responseOK;
  }

  // o createPost: para lanzar el servicio createPost (tendremos que aplicar la
  // misma lógica que en el CRUD de categorías).
  private async createPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    const userId = this.localStorageService.get("user_id");

    if (userId) {
      this.post.userId = userId;
      try {
        await this.postService.createPost(this.post);
        responseOK = true;
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }

      await this.sharedService.managementToast(
        "postFeedback",
        responseOK,
        errorResponse,
      );

      if (responseOK) {
        this.router.navigateByUrl("posts");
      }
    }

    return responseOK;
  }

  // o savePost: si el formulario es válido en función de si es alta o edición
  // llamar a editPost o createPost.
  async savePost(): Promise<void> {
    this.isValidForm = false;
    if (this.postForm.invalid) {
      return;
    }
    this.isValidForm = true;
    const { title, description, publication_date, categories } =
      this.postForm.getRawValue();

    const [y, m, d] = publication_date.split("-").map(Number);
    const pubDate = new Date(y, m - 1, d);

    this.post = new PostDTO(
      title,
      description,
      this.post.num_likes,
      this.post.num_dislikes,
      pubDate,
    );

    if (this.isUpdateMode) {
      this.validRequest = await this.editPost();
    } else {
      this.validRequest = await this.createPost();
    }
  }
}
