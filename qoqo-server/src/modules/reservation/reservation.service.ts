import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';

/**
 * 운동기구 예약 관리 서비스
 * - 예약 생성
 * - 지각 정책 관리 (SKIP: 예약 취소, MOVE_TO_NEXT: 다음 사람과 순서 교체)
 * - 예약 상태 관리
 */
@Injectable()
export class ReservationService {
  private readonly LATE_THRESHOLD_MINUTES = 3; // 지각 판단 기준 시간 (3분)

  constructor(private prisma: PrismaService) {}

  /**
   * 특정 운동기구의 모든 대기 예약에 대해 예상 시작 시간을 재계산
   * @param equipmentId 운동기구 ID
   * @returns 업데이트된 예약 목록
   */
  private async recalculateEstimatedStartTimes(equipmentId: number) {
    // 1. 현재 사용 중인 예약 조회
    const currentUsage = await this.prisma.usage.findFirst({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        end_time: null,
      },
      include: {
        reservation: {
          select: {
            desired_time: true,
          },
        },
      },
    });

    // 2. 대기 중인 모든 예약 조회 (순서대로)
    const waitingReservations = await this.prisma.reservation.findMany({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        status: ReservationStatus.WAITING,
      },
      orderBy: {
        reserved_time: 'asc',
      },
    });

    // 3. 예상 시작 시간 계산 시작점 설정
    const nextStartTime = new Date();
    if (currentUsage) {
      const remainingTime = currentUsage.reservation?.desired_time || 30;
      nextStartTime.setMinutes(nextStartTime.getMinutes() + remainingTime);
    }

    // 4. 각 예약에 대해 새로운 예상 시작 시간 계산 및 업데이트
    const updates = waitingReservations.map((reservation) => {
      const estimatedStart = new Date(nextStartTime);
      nextStartTime.setMinutes(nextStartTime.getMinutes() + reservation.desired_time);

      return this.prisma.reservation.update({
        where: { id: reservation.id },
        data: { estimated_start: estimatedStart },
      });
    });

    // 5. 모든 업데이트를 트랜잭션으로 실행
    if (updates.length > 0) {
      await this.prisma.$transaction(updates);
    }

    return waitingReservations;
  }

  /**
   * 운동기구 예약 생성
   * @param userId 사용자 ID
   * @param equipmentId 운동기구 ID
   * @param desiredTime 희망 운동 시간 (분)
   * @param latePolicy 지각 정책 ('SKIP': 예약 취소, 'MOVE_TO_NEXT': 다음 사람과 순서 교체)
   * @returns 생성된 예약 정보
   */
  async createReservation(
    userId: number,
    equipmentId: number,
    desiredTime: number,
    latePolicy: 'SKIP' | 'MOVE_TO_NEXT',
  ) {
    // 현재 사용 중인 기구 확인
    const currentUsage = await this.prisma.usage.findFirst({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        end_time: null,
      },
      include: {
        reservation: {
          select: {
            desired_time: true,
          },
        },
      },
    });
    
    // 현재 대기 중인 예약들 조회
    const activeReservations = await this.prisma.reservation.findMany({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        status: ReservationStatus.WAITING,
      },
      orderBy: {
        reserved_time: 'asc',
      },
    });
    
    // 예상 시작 시간 계산
    const estimatedStart = new Date();
    if (currentUsage) {
      const remainingTime = currentUsage.reservation?.desired_time || 30;
      estimatedStart.setMinutes(estimatedStart.getMinutes() + remainingTime);
    }

    activeReservations.forEach((reservation) => {
      estimatedStart.setMinutes(estimatedStart.getMinutes() + reservation.desired_time);
    });

    // 예약 생성
    const initialStatus = (!currentUsage && activeReservations.length === 0)
      ? ReservationStatus.IN_PROGRESS
      : ReservationStatus.WAITING;

    return await this.prisma.reservation.create({
      data: {
        user_id: userId,
        equipment_id: equipmentId,
        desired_time: desiredTime,
        late_policy: latePolicy,
        status: initialStatus,
        is_active: true,
        reserved_time: new Date(),
        estimated_start: estimatedStart,
      },
    });
  }

  /**
   * 예약 상태 업데이트 (지각 정책 적용)
   * @param reservationId 예약 ID
   * @returns 업데이트된 예약 정보
   * @throws BadRequestException 예약을 찾을 수 없거나 이미 비활성화된 경우
   */
  async updateReservationStatus(reservationId: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        equipment: {
          include: {
            reservations: {
              where: {
                is_active: true,
                status: ReservationStatus.WAITING,
              },
              orderBy: {
                reserved_time: 'asc',
              },
            },
          },
        },
      },
    });

    if (!reservation || !reservation.is_active) {
      throw new BadRequestException('Reservation not found or already inactive');
    }

    // 지각 여부 확인 (예상 시작 시간으로부터 3분 경과 여부)
    const now = new Date();
    const estimatedStart = reservation.estimated_start;
    if (!estimatedStart) {
      throw new BadRequestException('Estimated start time not set');
    }

    const lateThreshold = new Date(estimatedStart);
    lateThreshold.setMinutes(lateThreshold.getMinutes() + this.LATE_THRESHOLD_MINUTES);
    const isLate = now > lateThreshold;

    if (isLate) {
      if (reservation.late_policy === 'SKIP') {
        // 예약 취소
        await this.prisma.reservation.update({
          where: { id: reservationId },
          data: {
            is_active: false,
            status: ReservationStatus.SKIPPED,
          },
        });

        // 나머지 예약들의 예상 시작 시간 재계산
        await this.recalculateEstimatedStartTimes(reservation.equipment_id);

        return await this.prisma.reservation.findUnique({
          where: { id: reservationId },
        });
      } else {
        // 다음 순서의 예약 찾기
        const reservations = reservation.equipment.reservations;
        const currentIndex = reservations.findIndex((r) => r.id === reservationId);
        
        // 마지막 순서이거나 다음 예약이 없는 경우 그대로 유지
        if (currentIndex === -1 || currentIndex === reservations.length - 1) {
          return reservation;
        }

        const nextReservation = reservations[currentIndex + 1];

        // 현재 예약의 시간을 다음 예약의 시간으로, 다음 예약의 시간을 현재 예약의 시간으로 교체
        const currentEstimatedStart = reservation.estimated_start;
        const nextEstimatedStart = nextReservation.estimated_start;

        // 트랜잭션으로 두 예약의 시간을 동시에 업데이트
        await this.prisma.$transaction([
          this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
              estimated_start: nextEstimatedStart,
              reserved_time: new Date(), // 예약 시간 갱신
            },
          }),
          this.prisma.reservation.update({
            where: { id: nextReservation.id },
            data: {
              estimated_start: currentEstimatedStart,
            },
          }),
        ]);

        // 업데이트된 예약 정보 반환
        return await this.prisma.reservation.findUnique({
          where: { id: reservationId },
          include: {
            equipment: {
              select: {
                equip_name: true,
                equip_type: true,
              },
            },
          },
        });
      }
    }

    // 지각이 아닌 경우 상태를 IN_PROGRESS로 변경
    return await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.IN_PROGRESS,
      },
    });
  }

  /**
   * 사용자의 현재 활성화된 예약 목록 조회
   * @param userId 사용자 ID
   * @returns 대기 중인 예약 목록
   */
  async getUserActiveReservations(userId: number) {
    return await this.prisma.reservation.findMany({
      where: {
        user_id: userId,
        is_active: true,
        status: ReservationStatus.WAITING,
      },
      include: {
        equipment: {
          select: {
            equip_name: true,
            equip_type: true,
          },
        },
      },
      orderBy: {
        reserved_time: 'asc',
      },
    });
  }

  /**
   * 예약된 운동 시작
   * @param reservationId 예약 ID
   * @returns 업데이트된 예약 정보와 생성된 운동 기록
   */
  async startReservation(reservationId: number) {
    // 예약 정보 확인
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        usage: true,
      },
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.WAITING) {
      throw new BadRequestException('Reservation is not in waiting status');
    }

    if (reservation.usage) {
      throw new BadRequestException('Exercise already started');
    }

    // 트랜잭션으로 예약 상태 변경과 운동 기록 생성을 동시에 처리
    return await this.prisma.$transaction(async (tx) => {
      // 예약 상태 변경
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.IN_PROGRESS,
        },
      });

      // Usage 기록 생성
      const usage = await tx.usage.create({
        data: {
          user_id: reservation.user_id,
          equipment_id: reservation.equipment_id,
          reservation_id: reservationId,
          start_time: new Date(),
          is_active: true,
        },
      });

      return {
        reservation: updatedReservation,
        usage: usage
      };
    });
  }

  /**
   * 모든 예약 데이터 삭제 (테스트용)
   */
  async deleteAllReservations() {
    // 트랜잭션으로 처리하여 데이터 일관성 유지
    return await this.prisma.$transaction(async (tx) => {
      // 먼저 Usage 테이블의 데이터 삭제
      await tx.usage.deleteMany();
      
      // 그 다음 Reservation 테이블의 데이터 삭제
      const deletedReservations = await tx.reservation.deleteMany();
      
      return {
        message: '모든 예약 데이터가 삭제되었습니다.',
        count: deletedReservations.count
      };
    });
  }
} 