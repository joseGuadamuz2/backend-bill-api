import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto, userId: number): Promise<Product> {
    const exists = await this.productRepo.findOne({
      where: { name: dto.name, userId }, // ✅ Mismo nombre solo conflicta dentro del mismo usuario
    });
    if (exists) throw new ConflictException(`Ya tienes un producto con el nombre "${dto.name}"`);

    const product = this.productRepo.create({ ...dto, userId });
    return this.productRepo.save(product);
  }

  async search(dto: SearchProductDto, userId: number) {
    const { query, page, limit } = dto;
    const skip = (page! - 1) * limit!;

    const [items, total] = await this.productRepo.findAndCount({
      where: {
        userId, // ✅ Solo productos del usuario
        isActive: true,
        ...(query ? { name: ILike(`%${query}%`) } : {}),
      },
      order: { name: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit!),
      },
    };
  }

  async findOne(id: number, userId: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id, userId } }); // ✅
    if (!product) throw new NotFoundException(`Producto con id ${id} no encontrado`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto, userId: number): Promise<Product> {
    const product = await this.findOne(id, userId); // ✅ Ya valida que pertenece al usuario

    if (dto.name && dto.name !== product.name) {
      const exists = await this.productRepo.findOne({ where: { name: dto.name, userId } });
      if (exists) throw new ConflictException(`Ya tienes un producto con el nombre "${dto.name}"`);
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const product = await this.findOne(id, userId); // ✅
    await this.productRepo.softRemove(product);
    return { message: `Producto "${product.name}" eliminado correctamente` };
  }

  async getBasePrice(id: number, userId: number): Promise<number> {
    const product = await this.findOne(id, userId);
    return Number(product.price);
  }
}