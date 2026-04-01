import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import coursesData from '../../src/data/courses.json';

const { width } = Dimensions.get('window');

// Course data is loaded from JSON file

export default function CoursesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePriceFilter, setActivePriceFilter] = useState('All');
  const [activeDomainFilter, setActiveDomainFilter] = useState('All Domains');

  const filteredCourses = useMemo(() => {
    return coursesData.filter(course => {
      // Search matching
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Price matching
      const matchesPrice = activePriceFilter === 'All' ? true 
                         : activePriceFilter === 'Free' ? course.price === 'Free' 
                         : course.price !== 'Free';

      // Domain matching (basic title inference)
      const titleLower = course.title.toLowerCase();
      let matchesDomain = true;
      if (activeDomainFilter === 'React') matchesDomain = titleLower.includes('react');
      if (activeDomainFilter === 'Node') matchesDomain = titleLower.includes('node');
      if (activeDomainFilter === 'UI/UX') matchesDomain = titleLower.includes('ui/ux') || titleLower.includes('design');
      if (activeDomainFilter === 'Python') matchesDomain = titleLower.includes('python');

      return matchesSearch && matchesPrice && matchesDomain;
    });
  }, [searchQuery, activePriceFilter, activeDomainFilter]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#171717']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.duration(800).delay(100)} style={styles.header}>
            <Text style={styles.title}>Library</Text>
            <Text style={styles.subtitle}>Explore new skills and master them</Text>
          </Animated.View>

          {/* Search & Filter Engine */}
          <Animated.View entering={FadeInDown.duration(800).delay(150)} style={styles.filterSection}>
            <View style={styles.searchContainer}>
              <FontAwesome5 name="search" size={16} color="rgba(255, 255, 255, 0.4)" style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search courses or instructors..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingRight: 24 }}>
              {['All', 'Free', 'Paid'].map(price => (
                <TouchableOpacity 
                  key={price} 
                  onPress={() => setActivePriceFilter(price)}
                  style={[styles.chip, activePriceFilter === price && styles.chipActive]}
                >
                  <Text style={[styles.chipText, activePriceFilter === price && styles.chipTextActive]}>{price}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.chipDivider} />
              {['All Domains', 'React', 'Node', 'UI/UX', 'Python'].map(domain => (
                <TouchableOpacity 
                  key={domain} 
                  onPress={() => setActiveDomainFilter(domain)}
                  style={[styles.chip, activeDomainFilter === domain && styles.chipActive]}
                >
                  <Text style={[styles.chipText, activeDomainFilter === domain && styles.chipTextActive]}>{domain}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200)}>
            <Text style={styles.sectionTitle}>Featured Courses ({filteredCourses.length})</Text>
            <View style={styles.gridContainer}>
              {filteredCourses.map((course, index) => (
                <BlurView key={course.id} intensity={30} tint="dark" style={styles.courseCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: `${course.color}20` }]}>
                      <FontAwesome5 name={course.icon} size={20} color={course.color} />
                    </View>
                    <View style={styles.ratingBadge}>
                      <FontAwesome5 name="star" size={10} color="#fbbf24" solid />
                      <Text style={styles.ratingText}>{course.rating}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  
                  <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                      <FontAwesome5 name="clock" size={12} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.metaText}>{course.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <FontAwesome5 name="users" size={12} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.metaText}>{course.students}</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.enrollButton}
                    onPress={() => router.push(`/course/${course.id}`)}
                  >
                    <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']} style={styles.enrollGradient}>
                       <Text style={styles.enrollText}>View Details</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </BlurView>
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
  filterSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(217, 70, 239, 0.15)',
    borderColor: '#d946ef',
  },
  chipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#d946ef',
  },
  chipDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  courseCard: {
    width: (width - 48 - 16) / 2, // 2 items per row, minus padding and gap
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginLeft: 6,
  },
  enrollButton: {
    width: '100%',
    height: 36,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  enrollGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enrollText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
