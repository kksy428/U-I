import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import { Circle, Rect, Svg } from 'react-native-svg';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 600;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError('아이디와 비밀번호를 모두 입력해주세요.');
        return;
      }

      // 로그인 API 호출
      const response = await axios.post(`${API_BASE_URL}/user/login`, {
        email,
        password
      });

      if (
        response.data &&
        typeof response.data === 'object' &&
        'message' in response.data &&
        response.data.message === 'Login successful'
      ) {
        await AsyncStorage.setItem('userEmail', email);
        setError('');
        // 로그인 성공 시 로딩화면으로 이동
        router.replace('/login-loading');
      } else if (
        response.data &&
        typeof response.data === 'object' &&
        'message' in response.data &&
        response.data.message === 'Invalid ID or Password'
      ) {
        setError('아이디와 비밀번호를 확인해주세요');
      }
    } catch (error: any) {
      if (error && error.response) {
        const msg = error.response.data?.message;
        if (msg === 'Invalid ID or Password') {
          setError('아이디와 비밀번호를 확인해주세요');
        } else {
          setError(msg || '로그인에 실패했습니다.');
        }
      } else {
        setError('서버와의 통신 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.outerContent}>
        <View style={styles.logoSection}>
          <QoqoLogo size={80} />
          <Text style={styles.logoText}>qoqo</Text>
          <Text style={styles.subtitle}>코코와 함께</Text>
          <Text style={styles.subtitle}>만드는 새로운 센터 문화</Text>
        </View>
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ID</Text>
            <TextInput
              style={[styles.input, error ? { borderColor: '#FF4D4F' } : null]}
              placeholder="아이디를 입력하세요"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.input, error ? { borderColor: '#FF4D4F' } : null]}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>

          <View style={styles.signupSection}>
            <Text style={styles.signupText}>코코가 처음이시라면? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signupLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  outerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isTablet ? 120 : 24,
    gap: isTablet ? 100 : 40,
  },
  logoSection: {
    width: isTablet ? 220 : 140,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 5,
    marginRight: isTablet ? 60 : 24,
  },
  logoText: {
    fontSize: isTablet ? 40 : 32,
    fontWeight: 'bold',
    fontFamily: 'Righteous',
    color: '#000000',
    marginTop: -10,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: isTablet ? 20 : 16,
    fontFamily: 'Pretendard',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
    maxWidth: 400,
    minWidth: isTablet ? 320 : 220,
    gap: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isTablet ? 40 : 24,
  },
  inputContainer: {
    marginBottom: 20,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
    color: '#000000',
    fontFamily: 'Inter',
  },
  loginButton: {
    backgroundColor: '#28D8AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#666666',
    justifyContent: 'left',
    alignItems: 'left',
  },
  signupLink: {
    fontSize: 14,
    color: '#28D8AF',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: 'Inter',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 14,
    marginTop: -15,
    marginBottom: 15,
    fontFamily: 'Inter',
  },
});
