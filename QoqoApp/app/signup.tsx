import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [gym, setGym] = useState('');

  const handleSignup = () => {
    // 회원가입 유효성 검사
    if (!name || !phoneNumber || !id || !password || !passwordCheck || !gym) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== passwordCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 회원가입 로직
    console.log('Signup data:', {
      name,
      phoneNumber,
      id,
      password,
      gym
    });

    // 성공 시 로그인 화면으로 이동
    alert('회원가입이 완료되었습니다!');
    router.replace('/login');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← 회원가입 화면</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.logoSection}>
            <QoqoLogo size={80} />
            <Text style={styles.logoText}>qoqo</Text>
            <Text style={styles.subtitle}>코코의 이용을 위해</Text>
            <Text style={styles.subtitle}>가입을 부탁해요</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="이름을 입력해주세요"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="핸드폰 번호를 입력해주세요"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ID</Text>
              <TextInput
                style={styles.input}
                placeholder="닉네임을 만들어주세요"
                value={id}
                onChangeText={setId}
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 만들어주세요"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Check</Text>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 확인해요"
                  value={passwordCheck}
                  onChangeText={setPasswordCheck}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>GYM</Text>
              <TextInput
                style={styles.input}
                placeholder="사용중인 헬스장의 이름을 입력해주세요"
                value={gym}
                onChangeText={setGym}
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <Text style={styles.signupButtonText}>가입하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    width: 1280,
    paddingTop: 120,
    paddingHorizontal: 40,
    paddingBottom: 150,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 150,
    justifyContent: 'center',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 100,
  },
  logoSection: {
    width: 177,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 5,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 40,
  },

  subtitle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    lineHeight: 21
  },
  formSection: {
    flex: 1,
    maxWidth: 400,
    gap: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
  },
  inputContainer: {
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000000',
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
  signupButton: {
    backgroundColor: '#28D8AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});