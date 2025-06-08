// 운동 기구 관련 타입
export interface ExerciseEquipment {
    id: number;
    name: string;
    image: any;
    price?: string;
    tag?: string;
    categories: string[];
  }
  
  // 회원 정보 타입
  export interface Member {
    id: string;
    name: string;
    phoneLastFour: string;
    profileImage?: string;
    gymName: string; // 소속 헬스장
  }
  
  // 대기자 정보 타입
  export interface WaitingUser {
    id: string;
    name: string;
    phoneLastFour: string;
    waitTime: number; // 대기 시간 (분)
    exerciseType: string; // 운동 종류
    profileImage?: string;
    startTime: Date; // 대기 시작 시간
  }
  
  // 헬스장 정보 타입
  export interface Gym {
    id: string;
    name: string;
    address: string;
    phone: string;
  }
  
  // API 응답 타입
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  // 네비게이션 타입
  export type RootStackParamList = {
    Home: undefined;
    EquipmentDetail: {
      equipment: ExerciseEquipment;
    };
  };
  
  // 운동 카테고리 타입
  export type ExerciseCategory = 
    | '하체운동기구'
    | '가슴운동기구'
    | '등운동기구'
    | '팔운동기구'
    | '어깨운동기구'
    | '복근운동기구';