import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// 앱 시작 시 스플래시 화면 유지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Righteous: require('../assets/fonts/Righteous-Regular.ttf'),
    PixelifySans: require('../assets/fonts/PixelifySans-VariableFont_wght.ttf'),
    Pretendard: require('../assets/fonts/PretendardVariable.ttf'), 
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // 폰트 로딩 완료되면 스플래시 숨김
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // 아직 로딩 중이면 렌더링 안 함
  }

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'qoqo'
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          title: '로그인'
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          headerShown: false,
          title: '회원가입'
        }} 
      />
      <Stack.Screen 
        name="signup-complete" 
        options={{ 
          headerShown: false,
          title: '회원가입 완료' 
        }} 
      />
      <Stack.Screen 
        name="login-loading" 
        options={{ 
          headerShown: false,
          title: '로딩중' 
        }} 
      />
    </Stack>
  );
}
