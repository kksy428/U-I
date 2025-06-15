import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationStatus } from '@prisma/client';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  /**
   * 새로운 예약 생성
   */
  @Post()
  async createReservation(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('equipmentId', ParseIntPipe) equipmentId: number,
    @Body('desiredTime', ParseIntPipe) desiredTime: number,
    @Body('latePolicy') latePolicy: 'CANCELLED' | 'MOVE_TO_NEXT',
  ) {
    return await this.reservationService.createReservation(
      userId,
      equipmentId,
      desiredTime,
      latePolicy,
    );
  }

  /**
   * 운동 상태 변경 이벤트 처리
   */
  @Put('equipment/:equipmentId/status-event')
  async handleExerciseStatusEvent(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
    @Body('eventType') eventType: 'START_EXERCISE' | 'END_EXERCISE' | 'ARRIVE' | 'LATE',
  ) {
    return await this.reservationService.handleExerciseStatusEvent(equipmentId, eventType);
  }

  // 사용자의 현재 예약 목록 조회
  @Get('user/:userId')
  async getUserActiveReservations(@Param('userId', ParseIntPipe) userId: number) {
    return await this.reservationService.getUserActiveReservations(userId);
  }

  /**
   * 현재 운동 상태 조회
   */
  @Get('equipment/:equipmentId/status')
  async getCurrentExerciseStatus(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return await this.reservationService.getCurrentExerciseStatus(equipmentId);
  }

  /**
   * 운동기구의 대기열 조회
   */
  @Get('equipment/:equipmentId/queue')
  async getEquipmentQueue(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return await this.reservationService.getEquipmentQueue(equipmentId);
  }

  /**
   * 모든 예약 삭제 (개발용)
   */
  @Delete('all')
  async deleteAllReservations() {
    return await this.reservationService.deleteAllReservations();
  }
} 