import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState([
    { id: 1, gpa: '', credits: '' },
    { id: 2, gpa: '', credits: '' },
  ]);

  const addSemester = () => {
    setSemesters([...semesters, { id: semesters.length + 1, gpa: '', credits: '' }]);
  };

  const updateSemester = (index, field, value) => {
    const newSemesters = [...semesters];
    // Allow decimals but enforce numeric
    if (/^\d*\.?\d*$/.test(value)) {
      newSemesters[index][field] = value;
      setSemesters(newSemesters);
    }
  };

  const removeSemester = (index) => {
    if (semesters.length > 1) {
      const newSemesters = semesters.filter((_, i) => i !== index);
      // Re-index
      newSemesters.forEach((sem, i) => sem.id = i + 1);
      setSemesters(newSemesters);
    }
  };

  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    semesters.forEach(sem => {
      const gpa = parseFloat(sem.gpa);
      const credits = parseFloat(sem.credits);

      if (!isNaN(gpa) && !isNaN(credits)) {
        totalCredits += credits;
        totalPoints += (gpa * credits);
      }
    });

    if (totalCredits === 0) return '0.00';
    return (totalPoints / totalCredits).toFixed(2);
  };

  const cgpaResult = calculateCGPA();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#171717']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView edges={['top']} style={{ zIndex: 10 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={30} tint="dark" style={styles.iconCircle}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CGPA Calculator</Text>
          <View style={{ width: 44 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Result Display */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.resultCard}>
          <LinearGradient colors={['rgba(97, 218, 251, 0.2)', 'rgba(97, 218, 251, 0.05)']} style={StyleSheet.absoluteFillObject} />
          <FontAwesome5 name="medal" size={24} color="#61dafb" style={styles.resultIcon} />
          <Text style={styles.resultLabel}>Your Cumulative GPA target</Text>
          <Text style={styles.resultValue}>{cgpaResult}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100)}>
          <View style={styles.labelsRow}>
            <Text style={[styles.columnLabel, { flex: 0.8 }]}>Semester</Text>
            <Text style={[styles.columnLabel, { flex: 1.2 }]}>GPA (0-10)</Text>
            <Text style={[styles.columnLabel, { flex: 1.2 }]}>Credits</Text>
            <View style={{ width: 30 }} />
          </View>

          {semesters.map((sem, index) => (
            <Animated.View key={`sem-${sem.id}`} style={styles.inputRow}>
              <View style={styles.semesterBox}>
                <Text style={styles.semesterText}>{sem.id}</Text>
              </View>

              <TextInput
                style={styles.inputNode}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={sem.gpa}
                onChangeText={(val) => updateSemester(index, 'gpa', val)}
                maxLength={4}
              />

              <TextInput
                style={styles.inputNode}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={sem.credits}
                onChangeText={(val) => updateSemester(index, 'credits', val)}
                maxLength={3}
              />

              <TouchableOpacity 
                onPress={() => removeSemester(index)} 
                style={styles.deleteBtn}
                disabled={semesters.length === 1}
              >
                <FontAwesome5 name="minus-circle" size={20} color={semesters.length === 1 ? 'rgba(255,255,255,0.2)' : '#ef4444'} />
              </TouchableOpacity>
            </Animated.View>
          ))}

          <TouchableOpacity onPress={addSemester} style={styles.addButton}>
            <BlurView intensity={20} tint="dark" style={styles.addButtonBlur}>
              <FontAwesome5 name="plus" size={16} color="#61dafb" />
              <Text style={styles.addButtonText}>Add Semester</Text>
            </BlurView>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      {/* Floating Gradient Border */}
      <View style={styles.bottomGlow}>
         <LinearGradient colors={['transparent', '#61dafb20']} style={StyleSheet.absoluteFillObject} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
    paddingBottom: 100,
  },
  resultCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(97, 218, 251, 0.3)',
    marginBottom: 40,
    overflow: 'hidden',
  },
  resultIcon: {
    marginBottom: 12,
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultValue: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: 'bold',
  },
  labelsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  columnLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  semesterBox: {
    flex: 0.8,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  semesterText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputNode: {
    flex: 1.2,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deleteBtn: {
    width: 30,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  addButton: {
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(97, 218, 251, 0.3)',
  },
  addButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    color: '#61dafb',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 100,
    pointerEvents: 'none',
  },
});
