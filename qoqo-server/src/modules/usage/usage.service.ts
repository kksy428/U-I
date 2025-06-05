import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

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

  // 특정 운동기구의 대기열 정보 가져오기
  async getEquipmentQueue(equipmentId: number) {
    // 현재 활성화된 예약 목록을 가져옴 (최대 4개)
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
      take: 4,
    });

    return reservations.map((reservation) => ({
      username: reservation.user.username,
      phone_num: reservation.user.phone_num,
      user_image: reservation.user.user_image,
      estimated_start: reservation.estimated_start,
    }));
  }

  // 현재 운동기구 사용 정보와 남은 시간 가져오기
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

    // 시작 시간부터 현재까지의 경과 시간 계산 (분 단위)
    const now = new Date();
    const elapsedMinutes = Math.floor(
      (now.getTime() - currentUsage.start_time.getTime()) / (1000 * 60),
    );

    // 예약된 사용 시간 (없으면 기본값 30분)
    const totalMinutes = currentUsage.reservation?.desired_time || 30;
    
    // 남은 전체 시간
    const remainingTotal = Math.max(0, totalMinutes - elapsedMinutes);
    
    // 5분 이하로 남았는지 확인
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

  // 특정 헬스장의 운동기구 정보 가져오기
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
} 