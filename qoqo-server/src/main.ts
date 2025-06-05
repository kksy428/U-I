import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CORS 설정
  app.enableCors();
  
  // 정적 파일 서빙 설정
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
