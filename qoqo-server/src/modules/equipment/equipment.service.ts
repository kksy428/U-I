import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async getAllEquipment() {
    return this.prisma.equipment.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        equip_name: true,
        equip_type: true,
        equip_image: true
      },
      orderBy: {
        equip_type: 'asc',
      },
    });
  }

  async getEquipmentById(id: number) {
    return this.prisma.equipment.findUnique({
      where: { id },
      select: {
        id: true,
        equip_name: true,
        equip_type: true,
        equip_image: true,
        is_active: true,
      },
    });
  }

  async getEquipmentByType(type: string) {
    return this.prisma.equipment.findMany({
      where: {
        equip_type: type,
        is_active: true,
      },
      select: {
        id: true,
        equip_name: true,
        equip_type: true,
        equip_image: true,
      },
    });
  }
} 