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
   * 현재 운동기구의 사용 정보와 남은 시간을 조회
   * @param equipmentId 운동기구 ID
   * @returns {
   *   id: 사용 정보 ID
   *   startTime: 시작 시간
   *   totalMinutes: 전체 예약 시간
   *   user: 현재 사용자 정보
   * }
   */
  async getCurrentUsage(equipmentId: number) {
    const currentUsage = await this.prisma.usage.findFirst({
      where: {
        equipment_id: equipmentId,
        is_active: true,
        end_time: { equals: null }
      },
      include: {
        user: true,
        equipment: true
      }
    });

    if (!currentUsage) {
      return null;
    }

    const reservation = await this.prisma.reservation.findFirst({
      where: {
        equipment_id: equipmentId,
        user_id: currentUsage.user_id,
        status: 'IN_PROGRESS'
      }
    });

    const totalMinutes = reservation?.desired_time || 30;

    return {
      id: currentUsage.id,
      startTime: currentUsage.start_time,
      totalMinutes,
      user: {
        username: currentUsage.user.username,
        phone_num: currentUsage.user.phone_num,
        user_image: currentUsage.user.user_image
      }
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

  // 특정 헬스장의 회원 목록 가져오기
  async getGymUsers(gymName: string) {
    return await this.prisma.user.findMany({
      where: {
        gym_name: gymName,
      },
      select: {
        id: true,
        username: true,
        phone_num: true,
        user_image: true,
      },
    });
  }
} 