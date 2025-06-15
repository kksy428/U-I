import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
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

  // 특정 헬스장의 회원 목록 가져오기
  @Get('gym/:gymName/users')
  async getGymUsers(@Param('gymName') gymName: string) {
    return await this.equipmentService.getGymUsers(gymName);
  }


  // 현재 운동기구 사용 정보와 남은 시간 가져오기
  @Get(':id/current')
  async getCurrentUsage(@Param('id', ParseIntPipe) id: number) {
    return await this.equipmentService.getCurrentUsage(id);
  }

  // 특정 헬스장의 운동기구 정보 가져오기
  @Get('gym/:gymName/equipment')
  async getGymEquipment(@Param('gymName') gymName: string) {
    return await this.equipmentService.getGymEquipment(gymName);
  }
} 