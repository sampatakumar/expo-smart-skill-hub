import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const careers = [
  { id: 'software', title: 'Software Engineer', desc: 'Build and maintain software applications', icon: 'code', color: '#61dafb', route: '/career/sengineer' },
  { id: 'data', title: 'Data Scientist', desc: 'Analyze and interpret complex data', icon: 'chart-line', color: '#34d399', route: '/tools/sgpa' },
  { id: 'ai', title: 'AI Engineer', desc: 'Develop artificial intelligence systems', icon: 'square-root-alt', color: '#c084fc', route: '/tools/scientific' },
  { id: 'web', title: 'Web Developer', desc: 'Create and manage websites and web applications', icon: 'file-contract', color: '#facc15', route: '/tools/resume' },
  { id: 'mobile', title: 'Mobile Developer', desc: 'Build mobile applications', icon: 'calendar-check', color: '#fb923c', route: '/tools/attendance' },
  { id: 'ml', title: 'Machine Learning Engineer', desc: 'Develop machine learning models', icon: 'sticky-note', color: '#f472b6', route: '/tools/notes' },
  { id: 'uiux', title: 'UI/UX Designer', desc: 'Design user interfaces and user experiences', icon: 'palette', color: '#a855f7', route: '/tools/planner' },
  { id: 'blockchain', title: 'Blockchain Developer', desc: 'Develop blockchain applications', icon: 'link', color: '#ff0000', route: '/tools/roadmap' },
  { id: 'frontend', title: 'Frontend Developer', desc: 'Develop user interfaces', icon: 'code', color: '#61dafb', route: '/tools/roadmap' },
  { id: 'backend', title: 'Backend Developer', desc: 'Develop server-side applications', icon: 'code', color: '#61dafb', route: '/tools/roadmap' },
  { id: 'fullstack', title: 'Fullstack Developer', desc: 'Develop both frontend and backend applications', icon: 'code', color: '#61dafb', route: '/tools/roadmap' },
  { id: 'game', title: 'Game Developer', desc: 'Develop games', icon: 'gamepad', color: '#ff0000', route: '/tools/roadmap' },
  { id: 'devops', title: 'DevOps Engineer', desc: 'Develop and maintain software applications', icon: 'code', color: '#61dafb', route: '/tools/roadmap' },
];



export default function RoadmapScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#171717']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Animated.View entering={FadeInDown.duration(800).delay(100)} style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={30} tint="dark" style={styles.iconCircle}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>
            <Text style={styles.title}>Roadmaps</Text>
            <Text style={styles.subtitle}>Choose your career path and we'll guide you through it</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200)}>
            <View style={styles.gridContainer}>
              {careers.map((tool, index) => (
                <TouchableOpacity
                  key={tool.id}
                  activeOpacity={tool.route ? 0.7 : 1}
                  style={styles.cardContainer}
                  onPress={() => tool.route ? router.push(tool.route) : null}
                >
                  <BlurView intensity={30} tint="dark" style={styles.toolCard}>
                    <View style={[styles.iconContainer, { backgroundColor: `${tool.color}15`, borderColor: `${tool.color}40` }]}>
                      <FontAwesome5 name={tool.icon} size={28} color={tool.color} />
                    </View>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    <Text style={styles.toolDesc} numberOfLines={2}>{tool.desc}</Text>

                    {!tool.route && (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Coming Soon</Text>
                      </View>
                    )}
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
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
  backButton: {
    width: 44,
    height: 44,
  },
  iconCircle: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120, // Leave room for absolute tab bar
  },
  header: {
    marginBottom: 32,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardContainer: {
    width: (width - 48 - 16) / 2, // 2 items per row
  },
  toolCard: {
    height: 180,
    padding: 16,
    borderRadius: 24,
    borderBlockStartColor: '#ffffffff',
    borderLeftColor: '#ffffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.52)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.52)',
    marginBottom: 16,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },
  toolDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 16,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  comingSoonText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
