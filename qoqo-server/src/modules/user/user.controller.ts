import { Body, Controller, Post, BadRequestException, Param, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserStep1Dto, CreateUserStep2Dto, LoginDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 회원가입 첫 번째 단계
  @Post('signup/step1')
  async signUpStep1(@Body() dto: CreateUserStep1Dto) {
    // 비밀번호 확인 체크
    if (dto.password !== dto.password_confirm) {
      throw new BadRequestException('Passwords do not match');
    }
    
    // ID 중복 체크
    const isAvailable = await this.userService.checkUserIdAvailable(dto.email);
    if (!isAvailable) {
      throw new BadRequestException('ID already exists');
    }

    // 임시 저장
    await this.userService.saveTemporaryUser(dto);
    return { message: 'First step successful', email: dto.email };
  }

  // 회원가입 두 번째 단계
  @Post('signup/step2/:email')
  async signUpStep2(
    @Param('email') email: string,
    @Body() dto: CreateUserStep2Dto
  ) {
    const result = await this.userService.completeUserRegistration(email, dto);
    if (!result) {
      throw new BadRequestException('Failed to complete registration');
    }
    return { message: 'Registration successful' };
  }

  // 로그인
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const valid = await this.userService.validateUser(dto);
    if (!valid) throw new BadRequestException('Invalid ID or Password');
    return { message: 'Login successful' };
  }

  // 로그아웃
  @Post('logout')
  async logout() {
    return { message: 'Logout successful' };
  }

  // 사용자 정보 가져오기
  @Get(':email')
  async getUserInfo(@Param('email') email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return { gym_name: user.gym_name };
  }
}
