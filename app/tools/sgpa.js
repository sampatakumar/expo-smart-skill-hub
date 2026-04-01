import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SGPACalculator() {
  const [subjects, setSubjects] = useState([
    { id: 1, grade: '', credits: '' },
    { id: 2, grade: '', credits: '' },
    { id: 3, grade: '', credits: '' },
  ]);

  const addSubject = () => {
    setSubjects([...subjects, { id: subjects.length + 1, grade: '', credits: '' }]);
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...subjects];
    // Allow decimals but enforce numeric
    if (/^\d*\.?\d*$/.test(value)) {
      newSubjects[index][field] = value;
      setSubjects(newSubjects);
    }
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      // Re-index
      newSubjects.forEach((sub, i) => sub.id = i + 1);
      setSubjects(newSubjects);
    }
  };

  const calculateSGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    subjects.forEach(sub => {
      const grade = parseFloat(sub.grade);
      const credits = parseFloat(sub.credits);

      if (!isNaN(grade) && !isNaN(credits)) {
        totalCredits += credits;
        totalPoints += (grade * credits);
      }
    });

    if (totalCredits === 0) return '0.00';
    return (totalPoints / totalCredits).toFixed(2);
  };

  const sgpaResult = calculateSGPA();

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
          <Text style={styles.headerTitle}>SGPA Calculator</Text>
          <View style={{ width: 44 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Result Display */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.resultCard}>
          <LinearGradient colors={['rgba(52, 211, 153, 0.2)', 'rgba(52, 211, 153, 0.05)']} style={StyleSheet.absoluteFillObject} />
          <FontAwesome5 name="chart-line" size={24} color="#34d399" style={styles.resultIcon} />
          <Text style={styles.resultLabel}>Your Semester GPA (SGPA)</Text>
          <Text style={styles.resultValue}>{sgpaResult}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100)}>
          <View style={styles.labelsRow}>
            <Text style={[styles.columnLabel, { flex: 0.8 }]}>Subject</Text>
            <Text style={[styles.columnLabel, { flex: 1.2 }]}>Grade (0-10)</Text>
            <Text style={[styles.columnLabel, { flex: 1.2 }]}>Credits</Text>
            <View style={{ width: 30 }} />
          </View>

          {subjects.map((sub, index) => (
            <Animated.View key={`sub-${sub.id}`} style={styles.inputRow}>
              <View style={styles.semesterBox}>
                <Text style={styles.semesterText}>{sub.id}</Text>
              </View>

              <TextInput
                style={styles.inputNode}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={sub.grade}
                onChangeText={(val) => updateSubject(index, 'grade', val)}
                maxLength={4}
              />

              <TextInput
                style={styles.inputNode}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={sub.credits}
                onChangeText={(val) => updateSubject(index, 'credits', val)}
                maxLength={3}
              />

              <TouchableOpacity 
                onPress={() => removeSubject(index)} 
                style={styles.deleteBtn}
                disabled={subjects.length === 1}
              >
                <FontAwesome5 name="minus-circle" size={20} color={subjects.length === 1 ? 'rgba(255,255,255,0.2)' : '#ef4444'} />
              </TouchableOpacity>
            </Animated.View>
          ))}

          <TouchableOpacity onPress={addSubject} style={styles.addButton}>
            <BlurView intensity={20} tint="dark" style={styles.addButtonBlur}>
              <FontAwesome5 name="plus" size={16} color="#34d399" />
              <Text style={styles.addButtonText}>Add Subject</Text>
            </BlurView>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      {/* Floating Gradient Border */}
      <View style={styles.bottomGlow}>
         <LinearGradient colors={['transparent', '#34d39920']} style={StyleSheet.absoluteFillObject} />
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
    borderColor: 'rgba(52, 211, 153, 0.3)',
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
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  addButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    color: '#34d399',
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
