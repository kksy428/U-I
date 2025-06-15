import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Circle, Rect, Svg } from 'react-native-svg';
import axios from 'axios';
import { API_BASE_URL } from '../config';

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
  const [step, setStep] = useState(1); // 1: 정보입력, 2: 회원타입 선택
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [gym, setGym] = useState('');
  const [role, setRole] = useState(''); // 'member' 또는 'gym'
  
  // 각 필드별 에러 상태
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    passwordCheck: '',
    gym: '',
    role: '',
    general: '' // 일반적인 에러 메시지
  });

  const clearErrors = () => {
    setErrors({
      name: '',
      phoneNumber: '',
      email: '',
      password: '',
      passwordCheck: '',
      gym: '',
      role: '',
      general: ''
    });
  };

  const handleNextStep = async () => {
    try {
      clearErrors();
      let hasError = false;
      const newErrors = { ...errors };

      // 회원가입 유효성 검사
      if (!name) {
        newErrors.name = '이름을 입력해주세요';
        hasError = true;
      }
      if (!phoneNumber) {
        newErrors.phoneNumber = '핸드폰 번호를 입력해주세요';
        hasError = true;
      }
      if (!email) {
        newErrors.email = '아이디를 입력해주세요';
        hasError = true;
      }
      if (!password) {
        newErrors.password = '비밀번호를 입력해주세요';
        hasError = true;
      }
      if (!passwordCheck) {
        newErrors.passwordCheck = '비밀번호 확인을 입력해주세요';
        hasError = true;
      }
      if (!gym) {
        newErrors.gym = '헬스장 이름을 입력해주세요';
        hasError = true;
      }
      if (password !== passwordCheck) {
        newErrors.passwordCheck = '비밀번호가 일치하지 않습니다';
        hasError = true;
      }

      if (hasError) {
        setErrors(newErrors);
        return;
      }

      // Step 1 API 호출
      const response = await axios.post(`${API_BASE_URL}/user/signup/step1`, {
        username: name,
        phone_num: phoneNumber,
        email: email,
        password: password,
        password_confirm: passwordCheck,
        gym_name: gym
      });

      if (response.data.message === 'First step successful') {
        clearErrors();
        setStep(2);
      }
    } catch (error) {
      if (error.response) {
        setErrors({
          ...errors,
          general: error.response.data.message || '회원가입 중 오류가 발생했습니다.'
        });
      } else {
        setErrors({
          ...errors,
          general: '서버와의 통신 중 오류가 발생했습니다.'
        });
      }
    }
  };

  const handleSignup = async () => {
    try {
      clearErrors();
      if (!role) {
        setErrors({
          ...errors,
          role: '회원 타입을 선택해주세요'
        });
        return;
      }

      // Step 2 API 호출
      const response = await axios.post(`${API_BASE_URL}/user/signup/step2/${email}`, {
        role: role
      });

      if (response.data.message === 'Registration successful') {
        // 성공 시 로그인 화면으로 이동
        alert('회원가입이 완료되었습니다!');
        router.replace('/login');
      }
    } catch (error) {
      if (error.response) {
        setErrors({
          ...errors,
          general: error.response.data.message || '회원가입 중 오류가 발생했습니다.'
        });
      } else {
        setErrors({
          ...errors,
          general: '서버와의 통신 중 오류가 발생했습니다.'
        });
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  const renderInfoForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="이름을 입력해주세요"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors({ ...errors, name: '' });
            }}
            placeholderTextColor="#999"
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
            placeholder="핸드폰 번호를 입력해주세요"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setErrors({ ...errors, phoneNumber: '' });
            }}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>ID</Text>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="아이디를 입력해주세요"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors({ ...errors, email: '' });
          }}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: '', passwordCheck: '' });
            }}
            secureTextEntry
            placeholderTextColor="#999"
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Check</Text>
          <TextInput
            style={[styles.input, errors.passwordCheck ? styles.inputError : null]}
            placeholder="비밀번호를 확인해주세요"
            value={passwordCheck}
            onChangeText={(text) => {
              setPasswordCheck(text);
              setErrors({ ...errors, passwordCheck: '' });
            }}
            secureTextEntry
            placeholderTextColor="#999"
          />
          {errors.passwordCheck ? <Text style={styles.errorText}>{errors.passwordCheck}</Text> : null}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>GYM</Text>
        <TextInput
          style={[styles.input, errors.gym ? styles.inputError : null]}
          placeholder="사용중인 헬스장의 이름을 입력해주세요"
          value={gym}
          onChangeText={(text) => {
            setGym(text);
            setErrors({ ...errors, gym: '' });
          }}
          placeholderTextColor="#999"
        />
        {errors.gym ? <Text style={styles.errorText}>{errors.gym}</Text> : null}
      </View>

      {errors.general ? <Text style={styles.generalErrorText}>{errors.general}</Text> : null}

      <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderUserTypeSelection = () => (
    <View style={styles.userTypeSection}>
      <Text style={styles.userTypeTitle}>회원 유형을 선택해주세요</Text>
      <Text style={styles.userTypeSubtitle}>어떤 목적으로 qoqo를 사용하시나요?</Text>
      
      <View style={styles.userTypeOptions}>
        <TouchableOpacity 
          style={[
            styles.userTypeOption, 
            role === 'user' && styles.userTypeOptionSelected
          ]}
          onPress={() => setRole('user')}
        >
          <View style={styles.userTypeIcon}>
            <Text style={styles.userTypeEmoji}>🏋️‍♂️</Text>
          </View>
          <Text style={[
            styles.userTypeOptionTitle,
            role === 'user' && styles.userTypeOptionTitleSelected
          ]}>일반 회원</Text>
          <Text style={[
            styles.userTypeOptionDesc,
            role === 'user' && styles.userTypeOptionDescSelected
          ]}>헬스장을 이용하는 회원으로 가입합니다</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.userTypeOption, 
            role === 'trainer' && styles.userTypeOptionSelected
          ]}
          onPress={() => setRole('trainer')}
        >
          <View style={styles.userTypeIcon}>
            <Text style={styles.userTypeEmoji}>🏪</Text>
          </View>
          <Text style={[
            styles.userTypeOptionTitle,
            role === 'trainer' && styles.userTypeOptionTitleSelected
          ]}>헬스장 관리자</Text>
          <Text style={[
            styles.userTypeOptionDesc,
            role === 'trainer' && styles.userTypeOptionDescSelected
          ]}>헬스장을 운영하는 관리자로 가입합니다</Text>
        </TouchableOpacity>
      </View>

      {errors.role ? <Text style={styles.errorText}>{errors.role}</Text> : null}
      {errors.general ? <Text style={styles.generalErrorText}>{errors.general}</Text> : null}

      <TouchableOpacity 
        style={[styles.signupButton, !role && styles.signupButtonDisabled]} 
        onPress={handleSignup}
        disabled={!role}
      >
        <Text style={styles.signupButtonText}>가입하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>
          {step === 1 ? '← 로그인 화면' : '← 이전'}
        </Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.logoSection}>
            <QoqoLogo size={80} />
            <Text style={styles.logoText}>qoqo</Text>
            {step === 1 ? (
              <>
                <Text style={styles.subtitle}>반가워요!</Text>
                <Text style={styles.subtitle}>코코의 이용을 위해</Text>
                <Text style={styles.subtitle}>가입을 부탁해요</Text>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>마지막 단계에요!</Text>
                <Text style={styles.subtitle}>회원 유형을</Text>
                <Text style={styles.subtitle}>선택해주세요</Text>
              </>
            )}
          </View>

          {step === 1 ? renderInfoForm() : renderUserTypeSelection()}
        </View>
      </ScrollView>
    </View>
  );
}
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 600;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 40,
    zIndex: 1,
    backgroundColor: '#FFFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '000000',
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
    fontFamily: 'Righteous',
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: -10,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: 'Pretendard',
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    lineHeight: 21
  },
  formSection: {
    flex: 1,
    maxWidth: 500,
    minWidth: isTablet ? 320 : 220,
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
  nextButton: {
    backgroundColor: '#28D8AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // 회원 타입 선택 관련 스타일
  userTypeSection: {
    flex: 1,
    maxWidth: 500,
    width: '90%', // 화면 크기가 큰 기기에서도 중앙에 오게
    alignSelf: 'center', // 중앙 정렬
    gap: 30,
    marginTop: 20, // 위 여백 추가
  },
  userTypeTitle: {
    fontSize: isTablet ? 28 : 24, // 태블릿에서 살짝 크게
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Pretendard',
  },
  userTypeSubtitle: {
    fontFamily: 'Inter',
    fontSize: isTablet ? 18 : 16, // 태블릿에서 살짝 크게
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  userTypeOptions: {
    gap: 20,
  },
  userTypeOption: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: isTablet ? 28 : 24, // 태블릿에서 살짝 넓게
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  userTypeOptionSelected: {
    borderColor: '#28D8AF',
    backgroundColor: '#F0FDF9',
  },
  userTypeIcon: {
    marginBottom: 16,
  },
  userTypeEmoji: {
    fontSize: isTablet ? 56 : 48, // 태블릿에서 살짝 크게
  },
  userTypeOptionTitle: {
    fontSize: isTablet ? 22 : 20, // 태블릿에서 살짝 크게
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: '#000000',
    marginBottom: 8,
  },
  userTypeOptionTitleSelected: {
    color: '#28D8AF',
  },
  userTypeOptionDesc: {
    fontSize: isTablet ? 16 : 14, // 태블릿에서 살짝 크게
    fontFamily: 'Inter',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  userTypeOptionDescSelected: {
    color: '#059669',
  },
  signupButton: {
    backgroundColor: '#28D8AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 16, // 태블릿에서 살짝 크게
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  generalErrorText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 10,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF0000',
  },
});
