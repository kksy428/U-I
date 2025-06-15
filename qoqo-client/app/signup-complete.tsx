import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Rect, Svg } from 'react-native-svg';

const QoqoLogo = ({ size = 61 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 61 61" fill="none">
    <Circle cx="20.5" cy="40.5005" r="20" fill="#101010"/>
    <Circle cx="40.5001" cy="20.5" r="20" fill="#101010"/>
    <Circle cx="40.5001" cy="40.5005" r="20" fill="#101010"/>
    <Circle cx="20.5" cy="20.5" r="20" fill="#101010"/>
    <Circle cx="20.5" cy="20.5002" r="11.6667" fill="white"/>
    <Circle cx="40.5" cy="20.5002" r="11.6667" fill="white"/>
    <Circle cx="40.5" cy="40.4997" r="11.6667" fill="white"/>
    <Circle cx="20.5" cy="40.4997" r="11.6667" fill="white"/>
    <Rect 
      x="17.1666" 
      y="24.7485" 
      width="9.11901" 
      height="18.238" 
      rx="4.5595" 
      transform="rotate(-45 17.1666 24.7485)" 
      fill="#28D8AF"
    />
    <Rect 
      x="17.1666" 
      y="45.2817" 
      width="9.11901" 
      height="18.238" 
      rx="4.5595" 
      transform="rotate(-45 17.1666 45.2817)" 
      fill="#28D8AF"
    />
  </Svg>
);

export default function SignupCompleteScreen() {
  const handleLogin = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <QoqoLogo size={80} />
      <Text style={styles.logoText}>qoqo</Text>
      <Text style={styles.title}>축하해요!</Text>
      <Text style={styles.subtitle}>회원가입이 완료되었어요</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인하러 가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Righteous',
    color: '#000',
    marginTop: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'normal',
    fontFamily: 'Pretendard',
    color: '#000',
    marginTop: 30,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#000',
    marginTop: 10,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#28D8AF',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Pretendard',
  },
});
