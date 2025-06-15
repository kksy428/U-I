import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';

export type LatePolicy = 'CANCELLED' | 'MOVE_TO_NEXT';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

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
    latePolicy: 'CANCELLED' | 'MOVE_TO_NEXT',
  ) {
    // getEquipmentQueue로 현재 대기열 상태 확인
    const queueData = await this.getEquipmentQueue(equipmentId);
    
    // currentUser와 waitingUsers 모두 비어있는 경우에만 바로 시작
    const initialStatus = (!queueData.currentUser && queueData.waitingUsers.length === 0)
        ? ReservationStatus.IN_PROGRESS  // 둘 다 비어있으면 바로 운동 중
        : ReservationStatus.WAITING;     // 그 외의 경우는 대기

    return await this.prisma.reservation.create({
        data: {
            user_id: userId,
            equipment_id: equipmentId,
            desired_time: desiredTime,
            late_policy: latePolicy,
            status: initialStatus,
            is_active: true,
            reserved_time: new Date(),
        },
    });
  }

  /**
   * 대기열 관리
   * @param equipmentId 운동기구 ID
   * @param status 변경될 상태
   * @param reservationId 예약 ID
   * @returns 업데이트된 예약 정보
   */
  async manageQueue(equipmentId: number, status: ReservationStatus, reservationId: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        equipment: {
          include: {
            reservations: {
              where: {
                status: { in: [ReservationStatus.WAITING, ReservationStatus.ONE_SKIPPED] }
              },
              orderBy: {
                reserved_time: 'asc'
              }
            }
          }
        }
      }
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // 운동 중이거나 대기 중인 상태는 그대로 유지
    if (status === ReservationStatus.IN_PROGRESS || status === ReservationStatus.WAITING) {
      return {
        message: `Reservation is already in ${status} state`,
        reservation
      };
    }

    switch (status) {
      case ReservationStatus.COMPLETED:
        // 운동 완료 시 Usage 기록 생성 및 예약 삭제
        await this.prisma.$transaction([
          this.prisma.usage.create({
            data: {
              user_id: reservation.user_id,
              equipment_id: equipmentId,
              start_time: new Date(Date.now() - reservation.desired_time * 60000), // 운동 시작 시간 계산
              end_time: new Date(),
              is_active: true
            }
          }),
          this.prisma.reservation.delete({
            where: { id: reservationId }
          })
        ]);

        // 다음 예약이 있다면 기다림 상태로 변경 - 예약자 올 때까지 대기중
        if (reservation.equipment.reservations.length > 0) {
          const nextReservation = reservation.equipment.reservations[0];
          await this.prisma.reservation.update({
            where: { id: nextReservation.id },
            data: { status: ReservationStatus.WAITING }
          });
        }
        break;

      case ReservationStatus.CANCELLED:
        // 예약 취소 시 예약 삭제
        await this.prisma.reservation.delete({
          where: { id: reservationId }
        });

        break;

      case ReservationStatus.SKIPPED:
        // 지각으로 인한 건너뛰기 시 다음 예약과 순서 교체
        if (reservation.equipment.reservations.length > 1) {
          // 자기 자신을 제외한 첫 번째 예약을 찾는다
          const nextReservation = reservation.equipment.reservations.find(r => r.id !== reservation.id);
          if (nextReservation) {
            const currentTime = reservation.reserved_time;
            const nextTime = nextReservation.reserved_time;
            await this.prisma.$transaction([
              this.prisma.reservation.update({
                where: { id: reservationId },
                data: {
                  status: ReservationStatus.ONE_SKIPPED,
                  reserved_time: nextTime,
                }
              }),
              this.prisma.reservation.update({
                where: { id: nextReservation.id },
                data: {
                  status: ReservationStatus.WAITING,
                  reserved_time: currentTime,
                }
              })
            ]);
          }
        } else {
          // 다음 예약이 없는 경우 그냥 삭제
          await this.prisma.reservation.delete({
            where: { id: reservationId }
          });
        }
        break;
    }

    // 업데이트된 예약 정보 반환
    return await this.prisma.reservation.findMany({
      where: {
        equipment_id: equipmentId,
        status: {
          in: [ReservationStatus.WAITING, ReservationStatus.IN_PROGRESS, ReservationStatus.ONE_SKIPPED]
        }
      },
      include: {
        user: true
      },
      orderBy: {
        reserved_time: 'asc'
      }
    });
  }

  /**
   * 운동 상태 변경 이벤트 처리
   * @param equipmentId 운동기구 ID
   * @param eventType 이벤트 타입 ('START_EXERCISE' | 'END_EXERCISE' | 'ARRIVE' | 'LATE')
   * @returns 업데이트된 예약 정보
   */
  async handleExerciseStatusEvent(equipmentId: number, eventType: 'START_EXERCISE' | 'END_EXERCISE' | 'ARRIVE' | 'LATE') {
    // 현재 사용 중인 예약 조회
    const currentReservation = await this.prisma.reservation.findFirst({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        status: {
          in: [ReservationStatus.IN_PROGRESS, ReservationStatus.WAITING, ReservationStatus.ONE_SKIPPED]
        }
      }
    });

    if (!currentReservation) {
      throw new BadRequestException('No active reservation found');
    }

    switch (eventType) {
      case 'START_EXERCISE':
        // 운동 시작 시 상태 확인
        if (currentReservation.status !== ReservationStatus.IN_PROGRESS) {
          throw new BadRequestException('Reservation is not in IN_PROGRESS state');
        }
        return {
          message: 'Exercise is already in progress',
          reservation: currentReservation
        };

      case 'END_EXERCISE':
        // 운동 종료 시 완료 상태로 변경
        await this.manageQueue(equipmentId, ReservationStatus.COMPLETED, currentReservation.id);
        break;

      case 'ARRIVE':
        // 도착 확인 시 운동 중 상태로 변경
        await this.prisma.reservation.update({
          where: { id: currentReservation.id },
          data: { status: ReservationStatus.IN_PROGRESS }
        });
        break;

      case 'LATE':
        // 지각 확인 시 대기열 첫 번째 사람의 지각 정책 적용
        const nextReservation = await this.prisma.reservation.findFirst({
          where: {
            equipment_id: currentReservation.equipment_id,
            status: ReservationStatus.WAITING
          },
          orderBy: {
            reserved_time: 'asc'
          }
        });
        if (nextReservation) {
          if (nextReservation.late_policy === 'CANCELLED') {
            // 건너뛰기 정책: 현재 예약을 취소
            await this.manageQueue(equipmentId, ReservationStatus.CANCELLED, currentReservation.id);
          } else if (nextReservation.late_policy === 'MOVE_TO_NEXT') {
            // 다음으로 넘기기 정책: 현재 예약을 건너뛰고 다음 예약은 대기 상태 유지
            if (currentReservation.status === ReservationStatus.ONE_SKIPPED) {
              // 이미 한 번 건너뛰어진 예약인 경우 삭제
              await this.manageQueue(equipmentId, ReservationStatus.CANCELLED, currentReservation.id);
            } else {
              // 처음 건너뛰는 경우 SKIPPED 상태로 변경
              await this.manageQueue(equipmentId, ReservationStatus.SKIPPED, currentReservation.id);
            }
          }
        }
        break;
    }

    // 업데이트된 전체 대기열 정보 조회 및 반환
    const updatedQueue = await this.prisma.reservation.findMany({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        status: {
          in: [ReservationStatus.IN_PROGRESS, ReservationStatus.WAITING, ReservationStatus.ONE_SKIPPED]
        }
      },
      include: {
        user: true,
        equipment: true
      },
      orderBy: [
        { status: 'asc' }, // IN_PROGRESS가 먼저 오도록
        { reserved_time: 'asc' } // 그 다음 예약 시간 순
      ]
    });

    // 현재 운동 중인 사용자와 대기 중인 사용자 분리
    const currentUser = updatedQueue.find(res => res.status === ReservationStatus.IN_PROGRESS);
    const waitingUsers = updatedQueue.filter(res => res.status === ReservationStatus.WAITING);

    return {
      currentUser,
      waitingUsers,
      queue: updatedQueue
    };
  }

  /**
   * 사용자의 활성 예약 목록 조회
   * @param userId 사용자 ID
   * @returns 활성 예약 목록
   */
  async getUserActiveReservations(userId: number) {
    return await this.prisma.reservation.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      include: {
        equipment: true,
      },
      orderBy: {
        reserved_time: 'desc',
      },
    });
  }

  /**
   * 현재 운동 상태 조회
   * @param equipmentId 운동기구 ID
   * @returns 현재 운동 상태 정보
   */
  async getCurrentExerciseStatus(equipmentId: number) {
    // 현재 사용 중인 예약 조회
    const currentReservation = await this.prisma.reservation.findFirst({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        status: {
          in: [ReservationStatus.IN_PROGRESS]
        }
      },
      include: {
        user: true,
        equipment: {
          include: {
            reservations: {
              where: {
                is_active: true,
                status: ReservationStatus.WAITING
              },
              orderBy: {
                reserved_time: 'asc'
              },
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!currentReservation) {
      return {
        status: 'IDLE',
        currentUser: null,
        waitingUsers: []
      };
    }

    return {
      status: currentReservation.status,
      currentUser: currentReservation.user,
      waitingUsers: currentReservation.equipment.reservations.map(res => res.user)
    };
  }

  /**
   * 모든 예약 삭제 (개발용)
   */
  async deleteAllReservations() {
    await this.prisma.reservation.deleteMany({});
  }

  /**
   * 운동기구의 대기열 조회
   * @param equipmentId 운동기구 ID
   * @returns 대기열 정보
   */
  async getEquipmentQueue(equipmentId: number) {
    // 현재 사용 중인 예약과 대기 중인 예약들을 조회
    const reservations = await this.prisma.reservation.findMany({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        status: {
          in: [ReservationStatus.IN_PROGRESS, ReservationStatus.WAITING, ReservationStatus.ONE_SKIPPED]
        }
      },
      include: {
        user: true,
        equipment: true
      },
      orderBy: [
        { status: 'asc' }, // IN_PROGRESS가 먼저 오도록
        { reserved_time: 'asc' } // 그 다음 예약 시간 순
      ]
    });

    // 현재 운동 중인 사용자와 대기 중인 사용자 분리
    const currentUser = reservations.find(res => res.status === ReservationStatus.IN_PROGRESS);
    const waitingUsers = reservations.filter(res => 
      res.status === ReservationStatus.WAITING || 
      res.status === ReservationStatus.ONE_SKIPPED
    );

    return {
      currentUser: currentUser ? {
        ...currentUser.user,
        selectedTime: currentUser.desired_time,
        latePolicy: currentUser.late_policy,
        status: currentUser.status
      } : null,
      waitingUsers: waitingUsers.map(res => ({
        ...res.user,
        selectedTime: res.desired_time,
        latePolicy: res.late_policy,
        status: res.status
      })),
      queue: reservations
    };
  }
} 