import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 운동 기구 관련 서비스
 * - 운동 기구 조회 기능
 * - 운동 기구 사용 현황 조회
 * - 대기열 관리
 */
@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 특정 헬스장의 모든 운동기구 목록을 조회
   * @param gymName 헬스장 이름
   * @returns 해당 헬스장의 모든 운동기구 정보
   */
  async getGymEquipment(gymName: string) {
    return await this.prisma.equipment.findMany({
      where: {
        gym_name: gymName,
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

  /**
   * 특정 운동기구의 대기열 정보를 조회
   * UI 표시를 위해 최근 4명까지만 반환하지만, 실제 대기열에는 제한이 없음
   * @param equipmentId 운동기구 ID
   * @returns 대기 중인 사용자 목록(최근 4명)과 예상 시작 시간
   */
  async getEquipmentQueue(equipmentId: number) {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        status: 'WAITING',
      },
      include: {
        user: {
          select: {
            username: true,
            phone_num: true,
            user_image: true,
          },
        },
      },
      orderBy: {
        reserved_time: 'asc',
      },
      take: 4, // UI 표시용 제한
    });

    return reservations.map((reservation) => ({
      username: reservation.user.username,
      phone_num: reservation.user.phone_num,
      user_image: reservation.user.user_image,
      estimated_start: reservation.estimated_start,
    }));
  }

  /**
   * 현재 운동기구의 사용 정보와 남은 시간을 조회
   * @param equipmentId 운동기구 ID
   * @returns {
   *   isInUse: 사용 중 여부
   *   user?: 현재 사용자 정보
   *   remainingMinutes: 남은 시간 (분)
   *   showTimer: 타이머 표시 여부 (5분 이하 남았을 때)
   *   startTime?: 시작 시간
   *   totalMinutes?: 전체 예약 시간
   * }
   */
  async getCurrentUsage(equipmentId: number) {
    const currentUsage = await this.prisma.usage.findFirst({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        end_time: null,
      },
      include: {
        user: {
          select: {
            username: true,
            phone_num: true,
            user_image: true,
          },
        },
        reservation: {
          select: {
            desired_time: true,
          },
        },
      },
    });

    if (!currentUsage) {
      return {
        isInUse: false,
        remainingMinutes: 0,
        showTimer: false,
      };
    }

    const now = new Date();
    const elapsedMinutes = Math.floor(
      (now.getTime() - currentUsage.start_time.getTime()) / (1000 * 60),
    );

    const totalMinutes = currentUsage.reservation?.desired_time || 30;
    const remainingTotal = Math.max(0, totalMinutes - elapsedMinutes);
    const showTimer = remainingTotal <= 5;

    return {
      isInUse: true,
      user: {
        username: currentUsage.user.username,
        phone_num: currentUsage.user.phone_num,
        user_image: currentUsage.user.user_image,
      },
      remainingMinutes: showTimer ? remainingTotal : null,
      showTimer,
      startTime: currentUsage.start_time,
      totalMinutes,
    };
  }

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

  // 특정 헬스장의 회원 목록 가져오기 (전화번호 뒷자리로 필터링)
  async getGymUsers(gymName: string, phoneNumber?: string) {
    const phoneCondition = phoneNumber
      ? {
          phone_num: {
            endsWith: phoneNumber,
          },
        }
      : {};

    return await this.prisma.user.findMany({
      where: {
        gym_name: gymName,
        ...phoneCondition,
      },
      select: {
        id: true,
        username: true,
        phone_num: true,
        user_image: true,
        role: true,
      },
    });
  }
} 