import {Component, Inject} from "@nestjs/common";
import {Model} from "sequelize-typescript";
import {Post} from "./post.entity";
import {PostsRepository} from "./post.provider";
import {CreatePostDto} from "./dto/create-post.dto";

@Component()
export class PostService {
  constructor(@Inject(PostsRepository) private readonly postsRepository: typeof Model) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = new Post()
    const {user_id, url, title, desc} = createPostDto

    post.user_id = user_id
    post.title = title
    post.desc = desc

    return await post.save()
  }

  async findAll(): Promise<Post[]> {
    return await this.postsRepository.findAll<Post>()
  }

  async findById(id: number | string): Promise<Post> {
    return await this.postsRepository.findById<Post>()
  }

  async findByUserId(user_id: number | string): Promise<Post> {
    return await this.postsRepository.findOne<Post>({where: {user_id}})
  }
}