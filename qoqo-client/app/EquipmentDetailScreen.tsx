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
  Image,
} from 'react-native';
import { Circle, Rect, Svg } from 'react-native-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

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
  username: string;
  phoneNum: string;
  phoneLastFour: string;
  waitingTime: string;
  gymName: string;
  selectedTime: number;
  latePolicy: string;
  status: string;
  userImage?: string;
}

interface GymMember {
  id: number;
  username: string;
  phoneNum: string;
  gymName: string;
  userImage?: string;
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
  const [currentUserGym, setCurrentUserGym] = useState<string>("");
  const [gymMembers, setGymMembers] = useState<GymMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timer, setTimer] = useState<TimerState>({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
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
  const [errorMessage, setErrorMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 현재 로그인한 사용자의 체육관 정보와 회원 목록을 가져옵니다
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        setIsLoading(true);
        // 로그인한 사용자의 email을 AsyncStorage에서 불러옴
        const savedEmail = await AsyncStorage.getItem('userEmail');
        if (!savedEmail) throw new Error('로그인 정보가 없습니다.');
        // email로 사용자 정보 조회
        const userResponse = await axios.get(`${API_BASE_URL}/user/${savedEmail}`);
        const userData = userResponse.data as any;
        setCurrentUserGym(userData.gym_name);
        // 해당 체육관의 회원 목록을 가져옵니다
        const membersResponse = await axios.get(`${API_BASE_URL}/equipment/gym/${userData.gym_name}/users`);
        const members = membersResponse.data.map((member: any) => ({
          id: member.id,
          username: member.username,
          phoneNum: member.phone_num,
          gymName: member.gym_name,
          userImage: member.user_image,
        }));
        setGymMembers(members);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error('Error fetching gym data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGymData();
  }, []);

  // 운동 상태 업데이트 함수
  const fetchExerciseStatus = async (eventType?: 'START_EXERCISE' | 'END_EXERCISE' | 'ARRIVE' | 'LATE') => {
    if (!equipment) return;
    try {
      // 1. 먼저 운동 상태 업데이트 (eventType이 있는 경우에만)
      if (eventType) {
        const statusEventResponse = await axios.put(
          `${API_BASE_URL}/reservations/equipment/${equipment.id}/status-event`,
          { eventType }
        );
        const statusEventData = statusEventResponse.data as any;
      }
      
      // 2. 업데이트된 대기열 정보 가져오기
      const queueResponse = await axios.get(`${API_BASE_URL}/reservations/equipment/${equipment.id}/queue`);
      const queueData = queueResponse.data as any;
      
      // 현재 사용자와 대기자 목록 업데이트
      if (queueData.currentUser) {
        setCurrentUser({
          id: queueData.currentUser.id,
          username: queueData.currentUser.username,
          phoneNum: queueData.currentUser.phone_num,
          phoneLastFour: queueData.currentUser.phone_num.slice(-4),
          waitingTime: '0',
          gymName: queueData.currentUser.gym_name,
          selectedTime: queueData.currentUser.selectedTime,
          latePolicy: queueData.currentUser.latePolicy,
          status: queueData.currentUser.status,
          userImage: queueData.currentUser.user_image
        });
      } else {
        setCurrentUser(null);
      }
      // 대기자 목록 업데이트
      const waitingUsers = queueData.waitingUsers.map((user: any) => ({
        id: user.id,
        username: user.username,
        phoneNum: user.phone_num,
        phoneLastFour: user.phone_num.slice(-4),
        waitingTime: '0',
        gymName: user.gym_name,
        selectedTime: user.selectedTime,
        latePolicy: user.latePolicy,
        status: user.status,
        userImage: user.user_image
      }));
      setWaitingUsers(waitingUsers);
      return queueData;
    } catch (error) {
      console.error('Error fetching exercise status:', error);
      Alert.alert('오류', '운동 상태를 불러오는데 실패했습니다.');
      return null;
    }
  };

  // 운동 상태 주기적 업데이트
  useEffect(() => {
    // 초기 로드 시 상태 가져오기 (eventType 없이)
    fetchExerciseStatus();

    // 5초마다 운동 상태 업데이트 (eventType 없이)
    const intervalId = setInterval(() => fetchExerciseStatus(), 5000);
    return () => clearInterval(intervalId);
  }, [equipment]);

  // 타이머 완료 시 처리
  const handleTimerComplete = async () => {
    if (!equipment) return;
    try {
      // fetchExerciseStatus를 사용하여 운동 종료 처리 및 상태 업데이트
      const queueData = await fetchExerciseStatus('END_EXERCISE');
      // 최신 대기열 데이터로 2분 타이머 시작 조건 평가
      if (queueData && queueData.waitingUsers && queueData.waitingUsers.length > 0) {
        const next = queueData.waitingUsers[0];
        setNextUser({
          id: next.id,
          username: next.username,
          phoneNum: next.phoneNum,
          phoneLastFour: next.phoneNum ? next.phoneNum.slice(-4) : '',
          waitingTime: '0',
          gymName: next.gymName,
          selectedTime: next.selectedTime,
          latePolicy: next.latePolicy,
          status: next.status,
          userImage: next.userImage
        });
        setShowStartModal(true);
        setStartDelayTimer({ minutes: 2, seconds: 0, milliseconds: 0, isRunning: true });
      } else {
        // 대기 중인 사용자가 없거나 상태가 다른 경우
        setCurrentUser(null);
        setNextUser(null);
        Alert.alert('알림', '줄을 서주세요.');
      }
    } catch (error) {
      console.error('Error ending exercise:', error);
      Alert.alert('오류', '운동 종료에 실패했습니다.');
    }
  };

  // 2분 대기 타이머 완료 시 처리
  const handleStartDelayComplete = async () => {
    if (!equipment) return;
    try {
      // LATE 이벤트 발생 및 상태 업데이트
      const queueData = await fetchExerciseStatus('LATE');

      // 대기열이 없으면 팝업만 닫고 함수 종료
      if (!queueData || !queueData.waitingUsers || queueData.waitingUsers.length === 0) {
        setShowStartModal(false);
        setStartDelayTimer({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });
        setCurrentUser(null);
        setNextUser(null);
        return;
      }

      // 다음 대기자 처리
      const next = queueData.waitingUsers[0];
      setNextUser({
        id: next.id,
        username: next.username,
        phoneNum: next.phoneNum,
        phoneLastFour: next.phoneNum ? next.phoneNum.slice(-4) : '',
        waitingTime: '0',
        gymName: next.gymName,
        selectedTime: next.selectedTime,
        latePolicy: next.latePolicy,
        status: next.status,
        userImage: next.userImage
      });
      setShowStartModal(true);
      setStartDelayTimer({ minutes: 2, seconds: 0, milliseconds: 0, isRunning: true });
    } catch (error) {
      console.error('Error handling late status:', error);
      Alert.alert('오류', '지각 확인 처리에 실패했습니다.');
    }
  };

  // 도착 후 start 버튼 클릭 시 처리
  const handleStartPress = async () => {
    if (!equipment) return;
    try {
      // 도착 이벤트 발생 및 상태 업데이트
      const queueData = await fetchExerciseStatus('ARRIVE');
      
      // 대기열이 비어있거나 currentUser가 없으면 팝업만 닫고 함수 종료
      if (!queueData || !queueData.currentUser) {
        setShowStartModal(false);
        setStartDelayTimer({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });
        return;
      }

      setShowStartModal(false);
      setStartDelayTimer({ minutes: 0, seconds: 0, milliseconds: 0, isRunning: false });

      // 최신 currentUser로 타이머 시작
      setTimer({ 
        minutes: queueData.currentUser.selectedTime, 
        seconds: 0, 
        milliseconds: 0, 
        isRunning: true 
      });
    } catch (error) {
      console.error('Error starting exercise:', error);
      Alert.alert('오류', '운동 시작에 실패했습니다.');
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
    setSelectedEquipment(equipment?.equip_name || '');
  }, [equipment?.equip_name]);

  // 전화번호 검색
  useEffect(() => {
    if (phoneSearchQuery) {
      const filteredMembers = gymMembers.filter(member =>
        member.phoneNum.slice(-4).startsWith(phoneSearchQuery)
      );
      setSearchResults(filteredMembers);
    } else {
      setSearchResults([]);
    }
  }, [phoneSearchQuery, gymMembers]);

  // 회원 선택 시 시간 설정 모달 열기
  const handleMemberSelect = (member: GymMember) => {
    setSelectedMember(member);
    setShowTimeModal(true);
  };

  // 대기 등록
  const [skipOption, setSkipOption] = useState('next'); // 'next' 또는 'delete'

  // 예약 생성 처리
  const handleWaitingSubmit = async () => {
    if (!selectedMember || !equipment) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reservations`,
        {
          userId: selectedMember.id,
          equipmentId: equipment.id,
          desiredTime: selectedTime,
          latePolicy: skipOption === 'delete' ? 'CANCELLED' : 'MOVE_TO_NEXT',
        }
      );
      const reservationData = response.data as any;
      
      // 예약 생성 성공 시 모달 닫기
      setShowTimeModal(false);
      setSelectedMember(null);
      setPhoneSearchQuery('');
      setSearchResults([]);

      // 대기열 조회하여 현재 사용자 확인
      const queueResponse = await axios.get(`${API_BASE_URL}/reservations/equipment/${equipment.id}/queue`);
      const queueData = queueResponse.data as any;

      // 현재 사용자가 있고, 그 사용자가 방금 예약한 사용자인 경우
      if (queueData.currentUser && queueData.currentUser.id === selectedMember.id) {
        // 타이머 시작
        setTimer({
          minutes: selectedTime,
          seconds: 0,
          milliseconds: 0,
          isRunning: true
        });
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('오류', '예약 생성에 실패했습니다.');
    }
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
          <QoqoLogo size={26} />
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
        <Text style={styles.equipmentName}>{equipment?.equip_name || selectedEquipment}</Text>
      </View>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          <Text style={styles.timerTextBlack}>
            {String(timer.minutes).padStart(2, '0')}:
            {String(timer.seconds).padStart(2, '0')}:
          </Text>
          <Text style={styles.timerTextMint}>
            {String(timer.milliseconds).padStart(2, '0')}
          </Text>
        </Text>
      </View>
      {/* 하단 대기자 목록 (왼쪽 메인 영역 하단) */}
      <View style={styles.bottomPanel}>
        <ScrollView
          horizontal
          style={styles.waitingQueue}
          contentContainerStyle={styles.waitingQueueContent}
          showsHorizontalScrollIndicator={false}
        >
          {currentUser ? (
            <View style={styles.queueItem}>
              <View style={styles.userCircle}>
                {currentUser.userImage ? (
                  <Image
                    source={{ uri: API_BASE_URL + currentUser.userImage }}
                    style={styles.userImage}
                  />
                ) : (
                  <Text style={styles.userInitial}>{currentUser.username.charAt(0)}</Text>
                )}
              </View>
              <Text style={styles.queueUserName}>{currentUser.username}</Text>
              <Text style={[
                styles.queueStatus,
                currentUser.status === 'IN_PROGRESS' && styles.statusInProgress,
                currentUser.status === 'WAITING' && styles.statusWaiting,
                currentUser.status === 'ONE_SKIPPED' && styles.statusSkipped
              ]}>
                {currentUser.status === 'IN_PROGRESS' ? '사용중' :
                 currentUser.status === 'WAITING' ? '대기중' :
                 currentUser.status === 'ONE_SKIPPED' ? '한번 스킵' : '대기중'}
              </Text>
            </View>
          ) : (
            <View style={styles.queueItem}>
              <View style={[styles.userCircle, styles.emptyCircle]}>
                <Text style={styles.emptyCircleText}>+</Text>
              </View>
              <Text style={styles.queueUserName}>사용자 없음</Text>
              <Text style={styles.queueStatus}>대기 가능</Text>
            </View>
          )}
          {waitingUsers.map((user, index) => (
            <View key={user.id} style={styles.queueItem}>
              <View style={[styles.userCircle, styles.waitingCircle]}>
                {user.userImage ? (
                  <Image
                    source={{ uri: API_BASE_URL + user.userImage }}
                    style={styles.userImage}
                  />
                ) : (
                  <Text style={styles.userInitial}>{user.username.charAt(0)}</Text>
                )}
              </View>
              <Text style={styles.queueUserName}>{user.username}</Text>
              <Text style={[
                styles.queueStatus,
                user.status === 'WAITING' && styles.statusWaiting,
                user.status === 'ONE_SKIPPED' && styles.statusSkipped
              ]}>
                {user.status === 'WAITING' ? `대기 ${index + 1}번` :
                 user.status === 'ONE_SKIPPED' ? `한번 스킵 (${index + 1}번)` : `대기 ${index + 1}번`}
              </Text>
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
        {(phoneSearchQuery ? searchResults : gymMembers).map(member => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberItem}
            onPress={() => handleMemberSelect(member)}
          >
            {member.userImage && (
              <Image
                source={{ uri: API_BASE_URL + member.userImage }}
                style={styles.memberAvatar}
              />
            )}
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.username}</Text>
              <Text style={styles.memberPhone}>
                {member.phoneNum
                  ? `${member.phoneNum.slice(0, 3)} - **** - ${member.phoneNum.slice(-4)}`
                  : '번호 없음'}
              </Text>
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
            {/* 1. 유저 정보 */}
            {selectedMember && (
              <View style={styles.userInfoRow}>
                {selectedMember.userImage ? (
                  <Image source={{ uri: API_BASE_URL + selectedMember.userImage }} style={styles.userAvatar} />
                ) : (
                  <View style={styles.userAvatarPlaceholder} />
                )}
                <View style={styles.userInfoText}>
                  <Text style={styles.userName}>{selectedMember.username}</Text>
                  <Text style={styles.userPhone}>
                    {selectedMember.phoneNum
                      ? `${selectedMember.phoneNum.slice(0, 3)}-****-${selectedMember.phoneNum.slice(-4)}`
                      : ''}
                  </Text>
                </View>
              </View>
            )}
            {/* 2. 시간 설정 */}
            <Text style={styles.sectionLabel}>시간 설정</Text>
            <View style={styles.timeSelectRow}>
              {[1, 15, 20, 25, 30].map(min => (
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
            {/* 3. 순번 설정 */}
            <Text style={styles.sectionLabel}>순번 설정</Text>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText}>
                  {skipOption === 'next'
                    ? '지각하면 다음 순서로 넘겨주세요'
                    : '지각하면 삭제 해주세요'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              {dropdownOpen && (
                <View style={styles.dropdownListAbsolute}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => { setSkipOption('next'); setDropdownOpen(false); }}
                  >
                    <Text style={styles.dropdownItemText}>지각하면 다음 순서로 넘겨주세요</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => { setSkipOption('delete'); setDropdownOpen(false); }}
                  >
                    <Text style={styles.dropdownItemText}>지각하면 삭제 해주세요</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {/* 4. 하단 버튼 */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.closeButtonWide}
                onPress={() => { setShowTimeModal(false); setErrorMessage(''); }}
              >
                <Text style={styles.closeButtonText}>나가기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButtonWide}
                onPress={handleWaitingSubmit}
                disabled={!selectedTime}
              >
                <Text style={styles.submitButtonText}>줄 설래요!</Text>
              </TouchableOpacity>
            </View>
            {errorMessage && (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}
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
              {nextUser?.username}님의 차례입니다.
            </Text>
            {startDelayTimer.minutes > 0 || startDelayTimer.seconds > 0 ? (
              <>
                <Text style={styles.modalSubtitle}>
                  {startDelayTimer.minutes}:{startDelayTimer.seconds < 10 ? `0${startDelayTimer.seconds}` : startDelayTimer.seconds}
                </Text>
                <Text style={styles.modalSubtitle}>
                  start 버튼을 누르면 {nextUser?.selectedTime}분 타이머가 시작됩니다.
                </Text>
              </>
            ) : (
              <Text style={[styles.modalSubtitle, styles.warningText]}>
                지각입니다. 다음 차례로 넘어갑니다.
              </Text>
            )}
            <TouchableOpacity
              style={[
                styles.startButton,
                (startDelayTimer.minutes === 0 && startDelayTimer.seconds === 0) && styles.startButtonWarning
              ]}
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
    gap: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: '#101010',
    textAlign: 'center',
    fontFamily: 'Righteous',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 29.8,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    flexDirection: 'column',
    padding: 40,
    backgroundColor: '#fff',
  },
  rightPanel: {
    width: isTablet ? 320 : 220, 
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  bottomPanel: {
    backgroundColor: '#fff',
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
    fontFamily: 'Pretendard',
  },
  timerContainer: {
    flex: 1.3,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 889,
  },
  timerText: {
    fontFamily: 'PixelifySans',
    fontSize: isTablet ? 140 : 80,
    letterSpacing: 10,
    textAlign: 'center',
    flexDirection: 'row',
  },
  timerTextBlack: {
    color: '#101010',
  },
  timerTextMint: {
    color: '#28D8AF',
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
    fontFamily: 'Inter',
  },
  queueStatus: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  memberListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  memberList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Inter',
  },
  memberPhone: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Inter',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 712,
    height: 400,
    maxWidth: 712,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  timeSelectRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeOptionSelected: {
    backgroundColor: '#28D8AF',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'normal',
    fontFamily: 'Inter',
  },
  timeOptionTextSelected: {
    color: '#fff',
    fontFamily: 'Inter',
  },
  skipOptionContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  skipOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontWeight: 'normal',
    fontFamily: 'Inter',
  },
  closeButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 4,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  skipOptionTextSelected: {
    color: '#28D8AF',
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  emptyCircle: {
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#28D8AF',
    borderStyle: 'dashed',
  },
  emptyCircleText: {
    color: '#28D8AF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusInProgress: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusWaiting: {
    color: '#2196F3',
  },
  statusSkipped: {
    color: '#FF9800',
  },
  warningText: {
    color: '#FF5722',
    fontWeight: 'bold',
  },
  startButtonWarning: {
    backgroundColor: '#FF5722',
  },
  errorMessage: {
    color: '#FF5722',
    textAlign: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 5,
    fontFamily: 'Inter',
  },
  submitButtonTextDisabled: {
    opacity: 0.5,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  userAvatar: {
    width: 48, height: 48, borderRadius: 24, marginRight: 16,
  },
  userAvatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24, marginRight: 16, backgroundColor: '#eee',
  },
  userInfoText: { flexDirection: 'column' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#222', fontFamily: 'Inter' },
  userPhone: { fontSize: 14, color: '#888', fontFamily: 'Inter' },
  sectionLabel: {
    fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 8, marginTop: 8, textAlign: 'left', width: '100%', fontFamily: 'Inter'
  },
  dropdownWrapper: {
    width: '100%',
    minHeight: 56,
    marginBottom: 8,
    position: 'relative',
  },
  dropdownListAbsolute: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
  },
  dropdownText: { fontSize: 16, color: '#222' },
  dropdownArrow: { fontSize: 16, color: '#888' },
  dropdownItem: { padding: 12 },
  dropdownItemText: { fontSize: 16, color: '#222' },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    marginTop: 24,
  },
  closeButtonWide: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonWide: {
    flex: 1,
    backgroundColor: '#28D8AF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
export default EquipmentDetailScreen;
