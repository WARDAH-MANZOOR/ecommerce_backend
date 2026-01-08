import { prisma } from "../config/prisma.js";

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export const productService = {
  async getAll() {
    return prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  async create(data: CreateProductData) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
      },
    });
  },

  async update(id: string, data: UpdateProductData) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;

    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  },
};
