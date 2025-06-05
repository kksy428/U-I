import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsageService } from './usage.service';

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  // 특정 헬스장의 회원 목록 가져오기 (전화번호 뒷자리로 필터링)
  @Get('gym/:gymName/users')
  async getGymUsers(
    @Param('gymName') gymName: string,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    return await this.usageService.getGymUsers(gymName, phoneNumber);
  }

  // 특정 운동기구의 대기열 정보 가져오기 (최대 4명)
  @Get('equipment/:id/queue')
  async getEquipmentQueue(@Param('id', ParseIntPipe) id: number) {
    return await this.usageService.getEquipmentQueue(id);
  }

  // 현재 운동기구 사용 정보와 남은 시간 가져오기
  @Get('equipment/:id/current')
  async getCurrentUsage(@Param('id', ParseIntPipe) id: number) {
    return await this.usageService.getCurrentUsage(id);
  }

  // 특정 헬스장의 운동기구 정보 가져오기
  @Get('gym/:gymName/equipment')
  async getGymEquipment(@Param('gymName') gymName: string) {
    return await this.usageService.getGymEquipment(gymName);
  }
} 