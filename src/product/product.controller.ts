import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, ParseIntPipe, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto' })
  create(@Body() dto: CreateProductDto, @Request() req: any) {
    return this.productService.create(dto, req.user.id); // ✅ userId del JWT
  }

  @Get()
  @ApiOperation({ summary: 'Buscar mis productos (con paginación)' })
  search(@Query() dto: SearchProductDto, @Request() req: any) {
    return this.productService.search(dto, req.user.id); // ✅
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mi producto por ID' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.productService.findOne(id, req.user.id); // ✅
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar mi producto' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto, @Request() req: any) {
    return this.productService.update(id, dto, req.user.id); // ✅
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar mi producto (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.productService.remove(id, req.user.id); // ✅
  }
}