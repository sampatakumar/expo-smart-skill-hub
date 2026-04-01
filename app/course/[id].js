import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import coursesData from '../../src/data/courses.json';

const { width, height } = Dimensions.get('window');

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const course = coursesData.find(c => c.id === id);

  if (!course) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Course not found!</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#d946ef' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleStartCourse = async () => {
    try {
      const supported = await Linking.canOpenURL(course.url);
      if (supported) {
        await Linking.openURL(course.url);
      } else {
        Alert.alert('Error', 'Cannot open the course URL.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong launching the course.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#171717']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Hero Header */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={[`${course.color}40`, `${course.color}10`, 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={30} tint="dark" style={styles.iconCircle}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>
          
          <Animated.View entering={FadeInDown.duration(800)} style={styles.heroIconContainer}>
            <View style={[styles.mainIconWrapper, { backgroundColor: `${course.color}20`, borderColor: `${course.color}50` }]}>
              <FontAwesome5 name={course.icon} size={48} color={course.color} />
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(800).delay(100)} style={styles.detailsHeader}>
          <View style={styles.priceBadge}>
            <Text style={[styles.priceText, course.price === 'Free' && { color: '#34d399' }]}>
              {course.price}
            </Text>
          </View>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.instructor}>by {course.instructor}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(200)} style={styles.statsGrid}>
          <BlurView intensity={30} tint="dark" style={styles.statBox}>
            <FontAwesome5 name="star" size={16} color="#fbbf24" solid />
            <Text style={styles.statBoxValue}>{course.rating}</Text>
            <Text style={styles.statBoxLabel}>Rating</Text>
          </BlurView>
          <BlurView intensity={30} tint="dark" style={styles.statBox}>
            <FontAwesome5 name="clock" size={16} color="#c084fc" />
            <Text style={styles.statBoxValue}>{course.duration}</Text>
            <Text style={styles.statBoxLabel}>Duration</Text>
          </BlurView>
          <BlurView intensity={30} tint="dark" style={styles.statBox}>
            <FontAwesome5 name="users" size={16} color="#61dafb" />
            <Text style={styles.statBoxValue}>{course.students}</Text>
            <Text style={styles.statBoxLabel}>Students</Text>
          </BlurView>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(300)} style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About this course</Text>
          <Text style={styles.aboutText}>
            Dive deep into the fundamentals and advanced concepts of this incredibly highly-rated course taught by industry expert {course.instructor}. Master cutting-edge techniques and apply what you learn in real-world scenarios.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Bar */}
      <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.bottomBar}>
        <BlurView intensity={40} tint="dark" style={styles.bottomBarBlur}>
           <TouchableOpacity onPress={handleStartCourse} activeOpacity={0.8} style={{ flex: 1 }}>
             <LinearGradient colors={['#d946ef', '#8b5cf6']} style={styles.primaryButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
               <Text style={styles.primaryButtonText}>Start Course</Text>
               <FontAwesome5 name="play" size={14} color="#ffffff" style={{ marginLeft: 8 }} />
             </LinearGradient>
           </TouchableOpacity>
        </BlurView>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  heroSection: {
    height: height * 0.35,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    marginTop: 10,
    zIndex: 10,
  },
  iconCircle: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroIconContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  mainIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
    paddingBottom: 120, // Space for floating button
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  priceText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructor: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statBox: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  statBoxValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  aboutSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32, // safe area padding ideally
    paddingTop: 16,
  },
  bottomBarBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
