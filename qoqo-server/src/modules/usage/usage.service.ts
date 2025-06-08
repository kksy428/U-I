import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 운동 기록 관리 서비스
 * - 운동 기록 저장
 * - 사용자별 운동 기록 조회
 * - 운동 통계 조회
 */
@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  /**
   * 사용자의 운동 기록을 저장
   * @param userId 사용자 ID
   * @param equipmentId 운동기구 ID
   * @param startTime 운동 시작 시간
   * @param endTime 운동 종료 시간
   * @returns 저장된 운동 기록
   */
  async saveUsageRecord(
    userId: number,
    equipmentId: number,
    startTime: Date,
    endTime: Date,
  ) {
    return await this.prisma.usage.create({
      data: {
        user_id: userId,
        equipment_id: equipmentId,
        start_time: startTime,
        end_time: endTime,
        is_active: false,
      },
    });
  }

  /**
   * 사용자의 전체 운동 기록 조회
   * @param userId 사용자 ID
   * @returns 완료된 모든 운동 기록 목록
   */
  async getUserUsageHistory(userId: number) {
    return await this.prisma.usage.findMany({
      where: {
        user_id: userId,
        end_time: {
          not: null,
        },
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
        start_time: 'desc',
      },
    });
  }

  /**
   * 사용자의 운동 통계 조회 (기구별 총 사용 시간)
   * @param userId 사용자 ID
   * @returns 각 운동기구별 총 사용 시간 통계
   */
  async getUserUsageStats(userId: number) {
    const usages = await this.prisma.usage.findMany({
      where: {
        user_id: userId,
        end_time: {
          not: null,
        },
      },
      include: {
        equipment: {
          select: {
            equip_name: true,
            equip_type: true,
          },
        },
      },
    });

    const stats = new Map<string, { totalMinutes: number; equipType: string }>();

    usages.forEach((usage) => {
      const duration = Math.floor(
        (usage.end_time!.getTime() - usage.start_time.getTime()) / (1000 * 60)
      );
      
      const equipName = usage.equipment.equip_name;
      if (!stats.has(equipName)) {
        stats.set(equipName, { totalMinutes: 0, equipType: usage.equipment.equip_type });
      }
      
      const current = stats.get(equipName)!;
      current.totalMinutes += duration;
    });

    return Array.from(stats.entries()).map(([equipName, data]) => ({
      equipName,
      equipType: data.equipType,
      totalMinutes: data.totalMinutes,
    }));
  }
}