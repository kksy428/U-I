import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function LoginScreen() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!id || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    // 여기서 실제 로그인 로직 대신 임시로 성공 처리
    setError('');
    // 로그인 성공 시 로딩화면으로 이동
    router.replace('/login-loading');
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
      
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← 로그인 화면</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
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
              placeholder="닉네임을 입력하세요"
              value={id}
              onChangeText={setId}
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
              onChangeText={setPassword}
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
            <Text style={styles.signupText}>코코가 처음이신가요? </Text>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    lineHeight: 24,
  },
  formSection: {
    width: '100%',
    maxWidth: 320,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
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
    fontWeight: '600',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#666666',
  },
  signupLink: {
    fontSize: 14,
    color: '#28D8AF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 14,
    marginTop: -15,
    marginBottom: 15,
  },
});
