import { IsNotEmpty, IsString } from 'class-validator';

// 회원가입 첫 단계 DTO
export class CreateUserStep1Dto {
  @IsString()
  @IsNotEmpty()
  username: string;         //사용자 이름

  @IsString()
  @IsNotEmpty()
  phone_num: string;        //사용자 전화번호

  @IsString()
  @IsNotEmpty()
  email: string;          //사용자 이메일(아이디)

  @IsString()
  @IsNotEmpty()
  password: string;         //사용자 비밀번호

  @IsString()
  @IsNotEmpty()
  password_confirm: string; //비밀번호 확인

  @IsString()
  @IsNotEmpty()
  gym_name: string;         //사용자 소속 체육관 이름
}

// 회원가입 두번째 단계 DTO
export class CreateUserStep2Dto {
  @IsString()
  @IsNotEmpty()
  role: string;             //사용자 역할
}

// 최종 사용자 생성을 위한 DTO (서비스 내부용)
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  phone_num: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  gym_name: string;

  @IsString()
  user_image: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;          //사용자 이메일(아이디)

  @IsString()
  @IsNotEmpty()
  password: string;         //사용자 비밀번호
}
