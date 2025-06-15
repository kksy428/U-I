import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Button,
  Modal,
} from 'react-native';
import { Circle, Rect, Svg, Ellipse, Path } from 'react-native-svg';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// API 응답 타입 정의
interface UserResponse {
  gymName: string;
  // 다른 사용자 정보 필드들...
}

// 운동 기구 데이터 타입
interface ExerciseEquipment {
  id: number;
  equip_name: string;
  equip_type: string;
  equip_image: string;
}

// 로고 SVG 컴포넌트
const QoqoLogo = ({ size = 26 }: { size?: number }) => (
  <Svg
    width={26}
    height={26}
    viewBox="0 0 26 26"
    fill="none"
    style={{ width: 26, height: 26, aspectRatio: 1 }}
  >
    <Ellipse cx="8.66666" cy="17.3337" rx="8.66666" ry="8.66667" fill="#101010" />
    <Ellipse cx="17.3334" cy="8.66667" rx="8.66666" ry="8.66667" fill="#101010" />
    <Ellipse cx="17.3334" cy="17.3337" rx="8.66666" ry="8.66667" fill="#101010" />
    <Ellipse cx="8.66666" cy="8.66667" rx="8.66666" ry="8.66667" fill="#101010" />
    <Ellipse cx="8.66663" cy="8.66688" rx="5.05555" ry="5.05555" fill="white" />
    <Ellipse cx="17.3334" cy="8.66688" rx="5.05555" ry="5.05555" fill="white" />
    <Ellipse cx="17.3334" cy="17.3329" rx="5.05555" ry="5.05555" fill="white" />
    <Ellipse cx="8.66663" cy="17.3329" rx="5.05555" ry="5.05555" fill="white" />
    <Rect width="3.95157" height="7.90313" rx="1.97578" transform="matrix(0.707106 -0.707107 0.707106 0.707107 7.22217 10.5078)" fill="#28D8AF" />
    <Rect width="3.95157" height="7.90313" rx="1.97578" transform="matrix(0.707106 -0.707107 0.707106 0.707107 7.22217 19.4053)" fill="#28D8AF" />
  </Svg>
);

// Add the HamburgerIcon SVG component
const HamburgerIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    style={{ width: 24, height: 24, aspectRatio: 1 }}
  >
    <Path d="M4 18C3.71667 18 3.47934 17.904 3.288 17.712C3.09667 17.52 3.00067 17.2827 3 17C2.99934 16.7173 3.09534 16.48 3.288 16.288C3.48067 16.096 3.718 16 4 16H20C20.2833 16 20.521 16.096 20.713 16.288C20.905 16.48 21.0007 16.7173 21 17C20.9993 17.2827 20.9033 17.5203 20.712 17.713C20.5207 17.9057 20.2833 18.0013 20 18H4ZM4 13C3.71667 13 3.47934 12.904 3.288 12.712C3.09667 12.52 3.00067 12.2827 3 12C2.99934 11.7173 3.09534 11.48 3.288 11.288C3.48067 11.096 3.718 11 4 11H20C20.2833 11 20.521 11.096 20.713 11.288C20.905 11.48 21.0007 11.7173 21 12C20.9993 12.2827 20.9033 12.5203 20.712 12.713C20.5207 12.9057 20.2833 13.0013 20 13H4ZM4 8C3.71667 8 3.47934 7.904 3.288 7.712C3.09667 7.52 3.00067 7.28267 3 7C2.99934 6.71733 3.09534 6.48 3.288 6.288C3.48067 6.096 3.718 6 4 6H20C20.2833 6 20.521 6.096 20.713 6.288C20.905 6.48 21.0007 6.71733 21 7C20.9993 7.28267 20.9033 7.52033 20.712 7.713C20.5207 7.90567 20.2833 8.00133 20 8H4Z" fill="black" />
  </Svg>
);

// 헬스장 이름 (예시: 회원가입 시 입력한 값)
const HomeScreen: React.FC = () => {
  const [equipmentData, setEquipmentData] = useState<Record<string, ExerciseEquipment[]>>({
    '하체': [],
    '가슴': [],
    '등': [],
    '팔': []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gymName, setGymName] = useState<string>("");
  const [email, setEmail] = useState<string>('');
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleMenuPress = () => setMenuVisible(!menuVisible);
  const handleLogoutMenu = () => {
    setMenuVisible(false);
    setLogoutModalVisible(true);
  };

  useEffect(() => {
    const loadEmailAndFetch = async () => {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        fetchData(savedEmail);
      }
    };
    loadEmailAndFetch();
  }, []);

  const fetchData = async (email: string) => {
    try {
      // 현재 로그인한 사용자의 헬스장 정보를 가져옴
      const userResponse = await axios.get(`${API_BASE_URL}/user/${email}`);
      const userGymName = userResponse.data.gym_name;
      setGymName(userGymName);

      // 각 종류별로 운동기구 정보를 가져옴
      const types = ['하체', '가슴', '등', '팔'];
      const equipmentByType: Record<string, ExerciseEquipment[]> = {};
      
      await Promise.all(
        types.map(async (type) => {
          const response = await axios.get<ExerciseEquipment[]>(`${API_BASE_URL}/equipment/type/${type}`);
          equipmentByType[type] = response.data;
        })
      );

      setEquipmentData(equipmentByType);
      setIsLoading(false);
    } catch (err) {
      console.error('데이터를 불러오는데 실패했습니다:', err);
      setError('데이터를 불러오는데 실패했습니다.');
      setIsLoading(false);
    }
  };

  const renderEquipmentItem = (item: ExerciseEquipment) => (
    <TouchableOpacity
      key={item.id}
      style={styles.equipmentItem}
      onPress={() => {
        router.push({
          pathname: './EquipmentDetailScreen',
          params: { equipment: JSON.stringify(item) }
        });
      }}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: `${API_BASE_URL}${item.equip_image}?t=${Date.now()}` }} 
          style={styles.equipmentImage} 
          resizeMode="cover"
        />
      </View>
      <Text style={styles.equipmentName}>{item.equip_name}</Text>
    </TouchableOpacity>
  );

  const renderSection = (title: string, type: string) => {
    const items = equipmentData[type] || [];
    if (items.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>● {title}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {items.map(item => renderEquipmentItem(item))}
        </ScrollView>
      </View>
    );
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userInfo');
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    } catch (e) {
      console.error('로그아웃 실패:', e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28D8AF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <QoqoLogo size={26} />
          <Text style={styles.headerTitle}>qoqo</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.gymName}>{gymName}</Text>
          <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
            <HamburgerIcon />
          </TouchableOpacity>
          {menuVisible && (
            <View style={styles.menuDropdown}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuItemText}>센터 이동</Text>
              </TouchableOpacity>
              <View style={styles.menuSeparator} />
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuItemText}>기구 설정</Text>
              </TouchableOpacity>
              <View style={styles.menuSeparator} />
              <TouchableOpacity style={styles.menuItem} onPress={handleLogoutMenu}>
                <Text style={styles.menuItemText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <ScrollView style={styles.scrollContainer}>
        {renderSection('하체 운동 기구', '하체')}
        {renderSection('가슴 운동 기구', '가슴')}
        {renderSection('등 운동 기구', '등')}
        {renderSection('팔 운동 기구', '팔')}
      </ScrollView>
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>정말 로그아웃 하시겠습니까?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleLogout}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  gymName: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: undefined,
  },
  headerButton: {
    fontSize: 12,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  equipmentItem: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 150,
    paddingBottom: 16,
    gap: 16,
    flexShrink: 0,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  equipmentImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b4a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  specialTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  equipmentName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuButton: { padding: 8 },
  menuDropdown: {
    display: 'flex',
    width: 199,
    paddingTop: 22,
    paddingRight: 24,
    paddingBottom: 22,
    paddingLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#101010',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    top: 56,
    right: 0,
    zIndex: 10,
  },
  menuItem: {
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 45,
  },
  menuItemText: {
    color: '#101010',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  menuSeparator: {
    height: 0,
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
    marginVertical: 12,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    display: 'flex',
    width: 384,
    paddingTop: 94,
    paddingRight: 30,
    paddingBottom: 30,
    paddingLeft: 30,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 79,
    borderRadius: 20,
    backgroundColor: '#FFF',
  },
  modalText: {
    width: 276,
    height: 24,
    color: '#393939',
    textAlign: 'center',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '300',
    lineHeight: 24,
    letterSpacing: 0.4,
    marginBottom: -10,
  },
  modalButtons: { flexDirection: 'row', gap: 16 },
  cancelButton: {
    display: 'flex',
    width: 158,
    height: 45,
    paddingVertical: 0,
    paddingHorizontal: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    marginRight: 8,
    minWidth: 80,
  },
  cancelButtonText: {
    color: '#101010',
    textAlign: 'center',
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 16,
  },
  confirmButton: {
    display: 'flex',
    width: 158,
    height: 45,
    paddingVertical: 0,
    paddingHorizontal: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#28D8AF',
    minWidth: 80,
  },
  confirmButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 16,
  },
});

export default HomeScreen;