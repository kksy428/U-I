import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  // 모든 운동기구 가져오기
  @Get()
  async getAllEquipment() {
    return await this.equipmentService.getAllEquipment();
  }

  // ID로 특정 운동기구 가져오기
  @Get(':id')
  async getEquipmentById(@Param('id', ParseIntPipe) id: number) {
    return await this.equipmentService.getEquipmentById(id);
  }

  // 종류별로 운동기구 가져오기
  @Get('type/:type')
  async getEquipmentByType(@Param('type') type: string) {
    return await this.equipmentService.getEquipmentByType(type);
  }
} 