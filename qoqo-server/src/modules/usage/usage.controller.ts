import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UsageService } from './usage.service';

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  /**
   * 운동 기록 저장
   * @param userId 사용자 ID
   * @param equipmentId 운동기구 ID
   * @param startTime 운동 시작 시간
   * @param endTime 운동 종료 시간
   */
  @Post('record')
  async saveUsageRecord(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('equipmentId', ParseIntPipe) equipmentId: number,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    return await this.usageService.saveUsageRecord(
      userId,
      equipmentId,
      new Date(startTime),
      new Date(endTime),
    );
  }

  /**
   * 사용자의 운동 기록 조회
   * @param userId 사용자 ID
   */
  @Get('history/:userId')
  async getUserUsageHistory(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usageService.getUserUsageHistory(userId);
  }

  /**
   * 사용자의 운동 통계 조회
   * @param userId 사용자 ID
   */
  @Get('stats/:userId')
  async getUserUsageStats(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usageService.getUserUsageStats(userId);
  }
} 