import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, CreateUserStep1Dto, CreateUserStep2Dto, LoginDto } from './user.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  private temporaryUsers = new Map<string, Omit<CreateUserStep1Dto, 'password_confirm'>>();

  constructor(private prisma: PrismaService) {}

  // 랜덤 프로필 이미지 선택
  private getRandomProfileImage(): string {
    const profileImagesDir = path.join(process.cwd(), 'public', 'images', 'users');
    try {
      const files = fs.readdirSync(profileImagesDir);
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg'].includes(ext) && file !== 'default.jpg';
      });
      
      if (imageFiles.length === 0) {
        console.warn('사용 가능한 프로필 이미지가 없습니다. 기본 이미지를 사용합니다.');
        return '/images/users/default.jpg';
      }
      
      const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
      const imagePath = `/images/users/${randomImage}`;
      
      // 파일 존재 여부 확인
      const fullPath = path.join(process.cwd(), 'public', imagePath);
      if (!fs.existsSync(fullPath)) {
        console.error(`선택된 이미지 파일이 존재하지 않습니다: ${imagePath}`);
        return '/images/users/default.jpg';
      }
      
      return imagePath;
    } catch (error) {
      console.error('프로필 이미지 선택 중 오류 발생:', error);
      return '/images/users/default.jpg';
    }
  }

  // 이메일(아이디) 중복 체크
  async checkUserIdAvailable(email: string): Promise<boolean> {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    return !existing;
  }

  // 첫 단계 임시 저장
  async saveTemporaryUser(dto: CreateUserStep1Dto): Promise<void> {
    const { password_confirm, ...userData } = dto;
    this.temporaryUsers.set(dto.email, userData);
  }

  // 회원가입 완료
  async completeUserRegistration(email: string, dto: CreateUserStep2Dto) {
    const tempUser = this.temporaryUsers.get(email);
    if (!tempUser) {
      return null; // 임시 저장된 사용자 정보가 없음
    }

    // 최종 사용자 데이터 생성
    const userData: CreateUserDto = {
      ...tempUser,
      role: dto.role,
      user_image: this.getRandomProfileImage() // 랜덤 프로필 이미지 할당
    };

    // DB에 저장
    const result = await this.prisma.user.create({
      data: userData,
    });

    // 임시 저장 데이터 삭제
    this.temporaryUsers.delete(email);

    return result;
  }

  async validateUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    return user && user.password === dto.password;
  }

  // 사용자 정보 가져오기
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        gym_name: true,
        user_image: true
      }
    });
  }
}
