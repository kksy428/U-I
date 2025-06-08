import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [step, setStep] = useState(1); // 1: 정보입력, 2: 회원타입 선택
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [gym, setGym] = useState('');
  const [userType, setUserType] = useState(''); // 'member' 또는 'gym'

  const handleNextStep = () => {
    // 회원가입 유효성 검사
    if (!name || !phoneNumber || !id || !password || !passwordCheck || !gym) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== passwordCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 다음 단계로 이동
    setStep(2);
  };

  const handleSignup = () => {
    if (!userType) {
      alert('회원 타입을 선택해주세요.');
      return;
    }

    // 회원가입 로직
    console.log('Signup data:', {
      name,
      phoneNumber,
      id,
      password,
      gym,
      userType
    });

    // 성공 시 로그인 화면으로 이동
    alert('회원가입이 완료되었습니다!');
    router.replace('/login');
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
            userType === 'member' && styles.userTypeOptionSelected
          ]}
          onPress={() => setUserType('member')}
        >
          <View style={styles.userTypeIcon}>
            <Text style={styles.userTypeEmoji}>🏋️‍♂️</Text>
          </View>
          <Text style={[
            styles.userTypeOptionTitle,
            userType === 'member' && styles.userTypeOptionTitleSelected
          ]}>일반 회원</Text>
          <Text style={[
            styles.userTypeOptionDesc,
            userType === 'member' && styles.userTypeOptionDescSelected
          ]}>헬스장을 이용하는 회원으로 가입합니다</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.userTypeOption, 
            userType === 'gym' && styles.userTypeOptionSelected
          ]}
          onPress={() => setUserType('gym')}
        >
          <View style={styles.userTypeIcon}>
            <Text style={styles.userTypeEmoji}>🏪</Text>
          </View>
          <Text style={[
            styles.userTypeOptionTitle,
            userType === 'gym' && styles.userTypeOptionTitleSelected
          ]}>헬스장 관리자</Text>
          <Text style={[
            styles.userTypeOptionDesc,
            userType === 'gym' && styles.userTypeOptionDescSelected
          ]}>헬스장을 운영하는 관리자로 가입합니다</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>가입하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>
          {step === 1 ? '← 회원가입 화면' : '← 이전'}
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
                <Text style={styles.subtitle}>코코의 이용을 위해</Text>
                <Text style={styles.subtitle}>가입을 부탁해요</Text>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>마지막 단계에요!</Text>
                <Text style={styles.subtitle}>회원 유형을 선택해주세요</Text>
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
  },
  userTypeSubtitle: {
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
    color: '#000000',
    marginBottom: 8,
  },
  userTypeOptionTitleSelected: {
    color: '#28D8AF',
  },
  userTypeOptionDesc: {
    fontSize: isTablet ? 16 : 14, // 태블릿에서 살짝 크게
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
  },
});
