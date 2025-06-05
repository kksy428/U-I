import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Circle, Rect, Svg } from 'react-native-svg';

// 운동 기구 데이터 타입
interface ExerciseEquipment {
  id: number;
  name: string;
  image: any;
  price?: string;
  tag?: string;
}

interface ExerciseEquipment {
  id: number;
  name: string;
  image: any;
  categories: string[];
}

const exerciseData: ExerciseEquipment[] = [
  {
    id: 1,
    name: '디클라인\n벤치 프레스',
    image: require('./asset/de.jpg'),
    categories: ['가슴운동기구', '팔운동기구']
  },
  {
    id: 2,
    name: '체스트\n프레스',
    image: require('./asset/ch.jpg'),
    categories: ['가슴운동기구', '팔운동기구']
  },
  {
    id: 3,
    name: '파워\n레그 프레스',
    image: require('./asset/leg.jpg'),
    categories: ['하체운동기구']
  },
  {
    id: 4,
    name: '시티드\n로우',
    image: require('./asset/sit.jpg'),
    categories: ['등운동기구', '팔운동기구']
  }
];

// 로고 SVG 컴포넌트
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

// 헬스장 이름 (예시: 회원가입 시 입력한 값)
const gymName = "코코짐"; // TODO: 실제 값으로 변경

const HomeScreen: React.FC = () => {

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
        <Image source={item.image} style={styles.equipmentImage} resizeMode="cover" />
        {item.price && (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        )}
        {item.tag && (
          <View style={styles.specialTag}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        )}
      </View>
      <Text style={styles.equipmentName}>{item.name}</Text>
    </TouchableOpacity>
  );
  const renderSection = (title: string, items: ExerciseEquipment[]) => (
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

  const getEquipmentByCategory = (category: string) => {
    return exerciseData.filter(item => item.categories.includes(category));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <QoqoLogo size={24} />
          <Text style={styles.headerTitle}>qoqo</Text>
        </View>
        <Text style={styles.gymName}>{gymName}</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        {renderSection('하체 운동 기구', getEquipmentByCategory('하체운동기구'))}
        {renderSection('가슴 운동 기구', getEquipmentByCategory('가슴운동기구'))}
        {renderSection('등 운동 기구', getEquipmentByCategory('등운동기구'))}
        {renderSection('팔 운동 기구', getEquipmentByCategory('팔운동기구'))}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Righteous',
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default HomeScreen;