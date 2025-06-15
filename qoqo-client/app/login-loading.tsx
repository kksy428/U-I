import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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

export default function LoginLoadingScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/main'); 
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <QoqoLogo size={80} />
      <Text style={styles.logoText}>qoqo</Text>
      <Text style={styles.subtitle}>코코와 같이 운동하러 고고!</Text>
      <ActivityIndicator size="large" color="#28D8AF" style={{ marginTop: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Righteous',
    color: '#000',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#000',
    fontWeight: '600',
    marginTop: 10,
  },
});
