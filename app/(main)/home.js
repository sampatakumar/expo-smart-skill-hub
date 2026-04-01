import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const skills = [
  { id: 1, name: 'React Native', progress: 85, icon: 'react', color: '#61dafb' },
  { id: 2, name: 'UI/UX Design', progress: 60, icon: 'paint-brush', color: '#c084fc' },
  { id: 3, name: 'Backend', progress: 40, icon: 'server', color: '#34d399' },
];

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);

  const displayName = user?.displayName || 'Developer';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#171717']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(800).delay(100)} style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>{displayName}</Text>
              {user?.email && <Text style={styles.emailText}>{user.email}</Text>}
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert('Sign Out', 'Are you sure you want to sign out of Smart Skill Hub?', [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Sign Out', 
                    style: 'destructive', 
                    onPress: async () => {
                      await logout();
                      router.replace('/(auth)/login');
                    }
                  }
                ]);
              }} 
              style={styles.avatarButton}
            >
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
                <LinearGradient colors={['#8b5cf6', '#d946ef']} style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View entering={FadeInUp.duration(800).delay(200)}>
            <BlurView intensity={30} tint="dark" style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Active Skills</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8h</Text>
                <Text style={styles.statLabel}>Time Spent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2</Text>
                <Text style={styles.statLabel}>Certificates</Text>
              </View>
            </BlurView>
          </Animated.View>

          {/* Recent Skills */}
          <Animated.View entering={FadeInUp.duration(800).delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>

            {skills.map((skill, index) => (
              <BlurView key={skill.id} intensity={25} tint="dark" style={styles.skillCard}>
                <View style={[styles.skillIconContainer, { backgroundColor: `${skill.color}20` }]}>
                  <FontAwesome5 name={skill.icon} size={20} color={skill.color} />
                </View>

                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${skill.progress}%`, backgroundColor: skill.color }]} />
                  </View>
                </View>
                <Text style={styles.skillProgressText}>{skill.progress}%</Text>
              </BlurView>
            ))}
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120, // increased padding to ensure content isn't hidden behind the floating tabs
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    fontWeight: '500',
  },
  avatarButton: {
    shadowColor: "#d946ef",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  skillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  skillInfo: {
    flex: 1,
    marginRight: 16,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    width: 40,
    textAlign: 'right',
  },
});
