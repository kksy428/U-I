import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Circle, Rect, Svg } from 'react-native-svg';

// useInterval 커스텀 훅
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// 로고 컴포넌트
const QoqoLogo = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 61 61" fill="none">
    <Circle cx="20.5" cy="40.5005" r="20" fill="#101010" />
    <Circle cx="40.5001" cy="20.5" r="20" fill="#101010" />
    <Circle cx="40.5001" cy="40.5005" r="20" fill="#101010" />
    <Circle cx="20.5" cy="20.5" r="20" fill="#101010" />
    <Circle cx="20.5" cy="20.5002" r="11.6667" fill="white" />
    <Circle cx="40.5" cy="20.5002" r="11.6667" fill="white" />
    <Circle cx="40.5" cy="40.4997" r="11.6667" fill="white" />
    <Circle cx="20.5" cy="40.4997" r="11.6667" fill="white" />
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

interface WaitingUser {
  id: number;
  name: string;
  phoneLastFour: string;
  waitingTime: string;
  gymName: string;
  selectedTime: number;
  skipIfAbsent: boolean;
}

interface GymMember {
  id: number;
  name: string;
  phoneLastFour: string;
  gymName: string;
}

interface TimerState {
  minutes: number;
  seconds: number;
  milliseconds: number;
  isRunning: boolean;
}

const EquipmentDetailScreen: React.FC = () => {
  const params = useLocalSearchParams<{ equipment?: string }>();
  const equipment = params.equipment ? JSON.parse(params.equipment) : null;
  const currentUserGym = "코코짐";

  const [timer, setTimer] = useState<TimerState>({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
  const [gymMembers] = useState<GymMember[]>([
    { id: 1, name: '심상한김', phoneLastFour: '5795', gymName: '코코짐' },
    { id: 2, name: '김코코', phoneLastFour: '9485', gymName: '코코짐' },
    { id: 3, name: 'Bibian', phoneLastFour: '9604', gymName: '코코짐' },
    { id: 4, name: 'Daniel', phoneLastFour: '1234', gymName: '코코짐' },
    { id: 5, name: '운동하지', phoneLastFour: '3457', gymName: '코코짐' },
    { id: 6, name: '김정룡', phoneLastFour: '0963', gymName: '코코짐' },
    { id: 7, name: '박정원', phoneLastFour: '3893', gymName: '코코짐' },
    { id: 8, name: '유리셀', phoneLastFour: '1502', gymName: '코코짐' },
    { id: 9, name: '로디드리', phoneLastFour: '3947', gymName: '코코짐' },
    { id: 10, name: '이민호', phoneLastFour: '2548', gymName: '파워짐' },
  ]);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(10);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GymMember[]>([]);
  const [currentUser, setCurrentUser] = useState<WaitingUser | null>(null);
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [skipIfAbsent, setSkipIfAbsent] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [nextUser, setNextUser] = useState<WaitingUser | null>(null);
  const [startDelayTimer, setStartDelayTimer] = useState<TimerState>({ minutes: 0, seconds: 120, milliseconds: 0, isRunning: false });

  // 타이머 완료 시 처리
  const handleTimerComplete = () => {
    console.log('타이머 완료! 다음 대기자로 넘어갑니다.');
    if (waitingUsers.length > 0) {
      const next = waitingUsers[0];
      setNextUser(next);
      setShowStartModal(true);
      setStartDelayTimer({ minutes: 2, seconds: 0, milliseconds: 0, isRunning: true });
    } else {
      setCurrentUser(null);
      setTimer({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });
      Alert.alert('대기열 완료', '현재 대기 중인 회원이 없습니다.');
    }
  };

  // 2분 대기 타이머 완료 시 처리
  const handleStartDelayComplete = () => {
    console.log('2분 대기 완료! 다음 대기자로 넘어갑니다.');
    setShowStartModal(false);
    
    if (waitingUsers.length > 0) {
      const next = waitingUsers[0];
      if (next.skipIfAbsent) {
        // 건너뛰기 설정된 경우
        setWaitingUsers(prev => prev.slice(1));
        // 다음 대기자가 있는지 확인
        if (waitingUsers.length > 1) {
          const nextNext = waitingUsers[1];
          setNextUser(nextNext);
          setShowStartModal(true);
          setStartDelayTimer({ minutes: 2, seconds: 0, milliseconds: 0, isRunning: true });
        } else {
          // 더 이상 대기자가 없음
          setCurrentUser(null);
          setNextUser(null);
          setTimer({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });
          Alert.alert('대기열 완료', '현재 대기 중인 회원이 없습니다.');
        }
      } else {
        // 건너뛰기 설정 안된 경우 - 바로 시작
        setCurrentUser(next);
        setWaitingUsers(prev => prev.slice(1));
        setNextUser(null);
        setTimer({ minutes: next.selectedTime, seconds: 0, milliseconds: 0, isRunning: true });
      }
    } else {
      setCurrentUser(null);
      setNextUser(null);
      setTimer({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });
      Alert.alert('대기열 완료', '현재 대기 중인 회원이 없습니다.');
    }
  };

  // 메인 타이머 (100ms 간격으로 밀리초 표시)
  useInterval(() => {
    if (timer.isRunning) {
      setTimer(prev => {
        if (prev.milliseconds > 0) {
          return { ...prev, milliseconds: prev.milliseconds - 1 };
        } else if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1, milliseconds: 9 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59, milliseconds: 9 };
        } else {
          handleTimerComplete();
          return { ...prev, isRunning: false };
        }
      });
    }
  }, 100);

  // 2분 대기 타이머
  useInterval(() => {
    if (startDelayTimer.isRunning) {
      setStartDelayTimer(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else {
          handleStartDelayComplete();
          return { ...prev, isRunning: false };
        }
      });
    }
  }, 1000);

  // 현재 사용자 및 기구 이름 설정
  useEffect(() => {
    setSelectedEquipment(equipment?.name || '');
  }, [equipment?.name]);

  // 전화번호 검색
  useEffect(() => {
    if (phoneSearchQuery.length > 0) {
      const filtered = gymMembers.filter(member =>
        member.phoneLastFour.includes(phoneSearchQuery) &&
        member.gymName === currentUserGym
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(gymMembers.filter(member => member.gymName === currentUserGym));
    }
  }, [phoneSearchQuery, gymMembers, currentUserGym]);

  // 회원 선택 시 시간 설정 모달 열기
  const handleMemberSelect = (member: GymMember) => {
    setSelectedMember(member);
    setShowTimeModal(true);
  };

  // 대기 등록
  const [skipOption, setSkipOption] = useState('next'); // 'next' 또는 'delete'

  // handleWaitingSubmit 함수 수정
  const handleWaitingSubmit = (selectedTime: number, skipOption: string) => {
    if (!selectedMember) {
      Alert.alert('알림', '회원을 선택해주세요.');
      return;
    }
  
    const isAlreadyWaiting = waitingUsers.some(user => user.id === selectedMember.id);
    const isCurrentUser = currentUser && currentUser.id === selectedMember.id;
    
    if (isAlreadyWaiting || isCurrentUser) {
      Alert.alert('알림', '이미 대기 중이거나 사용 중인 회원입니다.');
      return;
    }
  
    const newUser: WaitingUser = {
      id: selectedMember.id,
      name: selectedMember.name,
      phoneLastFour: selectedMember.phoneLastFour,
      waitingTime: '대기중',
      gymName: selectedMember.gymName,
      selectedTime: selectedTime,
      skipIfAbsent: skipOption === 'next', // 'next'면 true, 'delete'면 false
    };
  
    // 현재 사용자도 없고, 대기자도 없고, 다음 사용자도 없는 경우 - 바로 시작
    if (!currentUser && waitingUsers.length === 0 && !nextUser) {
      setCurrentUser({
        ...newUser,
        waitingTime: '사용중'
      });
      setTimer({ minutes: selectedTime, seconds: 0, milliseconds: 0, isRunning: true });
      Alert.alert('완료', `${newUser.name}님이 ${selectedEquipment} 사용을 시작합니다.`);
    } else {
      // 대기자 목록에 추가
      setWaitingUsers(prev => [...prev, newUser]);
      Alert.alert('완료', `${newUser.name}님이 대기열에 등록되었습니다.`);
    }
  
    setShowTimeModal(false);
    setPhoneSearchQuery('');
    setSelectedMember(null);
    setSkipOption('next'); // 기본값으로 초기화
    setSelectedTime(10);
  };

  const handleStartPress = () => {
    setShowStartModal(false);
    setStartDelayTimer({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });

    if (nextUser) {
      // 대기자 목록에서 제거하고 현재 사용자로 설정
      setWaitingUsers(prev => prev.slice(1));
      setCurrentUser({
        ...nextUser,
        waitingTime: '사용중'
      });
      setNextUser(null);
      // 타이머 시작
      setTimer({ minutes: nextUser.selectedTime, seconds: 0, milliseconds: 0, isRunning: true });
    }
  };

  // 타이머 표시 형식
  const formatTimer = () => {
    const minutes = String(timer.minutes).padStart(2, '0');
    const seconds = String(timer.seconds).padStart(2, '0');
    const milliseconds = String(timer.milliseconds);
    return `${minutes}:${seconds}:${milliseconds}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <QoqoLogo size={24} />
          <Text style={styles.headerTitle}>qoqo</Text>
        </View>
      </View>

      {/* 메인 컨테이너 */}
      <SafeAreaView style={styles.container}>

  {/* 메인 컨테이너 */}
  <View style={styles.mainContainer}>
    {/* 왼쪽: 타이머, 운동기구, 하단 대기자 목록 */}
    <View style={styles.leftPanel}>
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentName}>{equipment?.name || selectedEquipment}</Text>
      </View>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTimer()}</Text>
      </View>
      {/* 하단 대기자 목록 (왼쪽 메인 영역 하단) */}
      <View style={styles.bottomPanel}>
        <ScrollView
          horizontal
          style={styles.waitingQueue}
          contentContainerStyle={styles.waitingQueueContent}
          showsHorizontalScrollIndicator={false}
        >
          {currentUser && (
            <View style={styles.queueItem}>
              <View style={styles.userCircle}>
                <Text style={styles.userInitial}>{currentUser.name.charAt(0)}</Text>
              </View>
              <Text style={styles.queueUserName}>{currentUser.name}</Text>
              <Text style={styles.queueStatus}>사용중</Text>
            </View>
          )}
          {waitingUsers.map((user, index) => (
            <View key={user.id} style={styles.queueItem}>
              <View style={[styles.userCircle, styles.waitingCircle]}>
                <Text style={styles.userInitial}>{user.name.charAt(0)}</Text>
              </View>
              <Text style={styles.queueUserName}>{user.name}</Text>
              <Text style={styles.queueStatus}>대기 {index + 1}번</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
    {/* 오른쪽: 회원 리스트 */}
    <View style={styles.rightPanel}>
      <Text style={styles.memberListTitle}>줄 서기</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="번호 뒷자리로 나를 찾아보세요"
        value={phoneSearchQuery}
        onChangeText={setPhoneSearchQuery}
        keyboardType="numeric"
        maxLength={4}
      />
      <ScrollView style={styles.memberList}>
        {searchResults.map(member => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberItem}
            onPress={() => handleMemberSelect(member)}
          >
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberPhone}>010 - **** - {member.phoneLastFour}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </View>
  </SafeAreaView>

      {/* 시간 설정 모달 */}
      <Modal
  visible={showTimeModal}
  animationType="slide"
  transparent={true}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>시간 설정</Text>
      <View style={styles.timeSelectRow}>
        {[10, 15, 20, 25, 30].map(min => (
          <TouchableOpacity
            key={min}
            style={[
              styles.timeOption,
              selectedTime === min && styles.timeOptionSelected
            ]}
            onPress={() => setSelectedTime(min)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.timeOptionText,
                selectedTime === min && styles.timeOptionTextSelected
              ]}
            >
              {min}min
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.skipOptionContainer}>
        <Text style={styles.skipOptionTitle}>순번 설정</Text>
        <TouchableOpacity
          style={[
            styles.skipOptionItem,
            skipOption === 'next' && styles.skipOptionItemSelected
          ]}
          onPress={() => setSkipOption('next')}
        >
          <Text style={[
            styles.skipOptionText,
            skipOption === 'next' && styles.skipOptionTextSelected
          ]}>
            지각하면 다음 순서로 넘겨주세요
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.skipOptionItem,
            skipOption === 'delete' && styles.skipOptionItemSelected
          ]}
          onPress={() => setSkipOption('delete')}
        >
          <Text style={[
            styles.skipOptionText,
            skipOption === 'delete' && styles.skipOptionTextSelected
          ]}>
            지각하면 삭제 해주세요
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowTimeModal(false)}
        >
          <Text style={styles.closeButtonText}>나가기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => handleWaitingSubmit(selectedTime, skipOption)}
        >
          <Text style={styles.submitButtonText}>줄 설래요!</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

      {/* start 버튼 모달 (2분 대기) */}
      <Modal
        visible={showStartModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {nextUser?.name}님의 차례입니다.
            </Text>
            <Text style={styles.modalSubtitle}>
              {startDelayTimer.minutes}:{startDelayTimer.seconds < 10 ? `0${startDelayTimer.seconds}` : startDelayTimer.seconds}
            </Text>
            <Text style={styles.modalSubtitle}>
              start 버튼을 누르면 {nextUser?.selectedTime}분 타이머가 시작됩니다.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartPress}
            >
              <Text style={styles.startButtonText}>start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 600;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 24,
    marginRight: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    padding: 40,
    justifyContent: 'flex-start',
  },
  rightPanel: {
    width: isTablet ? 280 : 220, 
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  bottomPanel: {
    backgroundColor: '#f8f8f8',
    borderTopWidth: 5,
    borderTopColor: '#28D8AF',
  },
  equipmentInfo: {
    alignItems: 'center',
  },
  equipmentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 889,
  },
  timerText: {
    color: '#28D8AF',
    textAlign: 'center',
    marginVertical: 50,
    fontSize: isTablet ? 200 : 100, 
    fontFamily: 'Pixelify Sans',
    fontWeight: '400',
    letterSpacing: 10,
  },
  waitingQueue: {
    padding: 30,
  },
  waitingQueueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    paddingHorizontal: 20,
  },
  queueItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  userCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#28D8AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  waitingCircle: {
    backgroundColor: '#e0e0e0',
  },
  userInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  queueUserName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  queueStatus: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  memberListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  memberList: {
    flex: 1,
  },
  memberItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  memberInfo: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  timeSelectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  timeOptionSelected: {
    backgroundColor: '#28D8AF',
  },
  timeOptionText: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  timeOptionTextSelected: {
    color: '#fff',
  },
  skipOptionContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  skipOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  skipOptionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  skipOptionButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  skipOptionButtonActive: {
    backgroundColor: '#28D8AF',
  },
  skipOptionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  submitButton: {
    backgroundColor: '#28D8AF',
    borderRadius: 4,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#28D8AF',
    borderRadius: 4,
    padding: 16,
    minWidth: 120,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipOptionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  skipOptionItemSelected: {
    backgroundColor: '#e8f5e8',
    borderColor: '#28D8AF',
  },
  skipOptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  skipOptionTextSelected: {
    color: '#28D8AF',
    fontWeight: '500',
  },
});
export default EquipmentDetailScreen;
