import { Controller, Post, Get, Body, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // 운동기구 예약하기
  @Post()
  async createReservation(
    @Body('userId') userId: number,
    @Body('equipmentId') equipmentId: number,
    @Body('desiredTime') desiredTime: number,
    @Body('latePolicy') latePolicy: 'SKIP' | 'MOVE_TO_NEXT',
  ) {
    return await this.reservationService.createReservation(
      userId,
      equipmentId,
      desiredTime,
      latePolicy,
    );
  }

  // 예약 상태 업데이트
  @Put(':id/status')
  async updateReservationStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.reservationService.updateReservationStatus(id);
  }

  // 사용자의 현재 예약 목록 조회
  @Get('user/:userId')
  async getUserActiveReservations(@Param('userId', ParseIntPipe) userId: number) {
    return await this.reservationService.getUserActiveReservations(userId);
  }

  // 예약 시작 (운동 시작)
  @Post(':id/start')
  async startReservation(@Param('id', ParseIntPipe) id: number) {
    return await this.reservationService.startReservation(id);
  }

  // 모든 예약 데이터 삭제 (테스트용)
  @Delete('delete-all')
  async deleteAllReservations() {
    return await this.reservationService.deleteAllReservations();
  }
} 