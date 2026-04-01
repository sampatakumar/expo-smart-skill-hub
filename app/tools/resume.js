import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, withTiming, withRepeat, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

// Mock backend AI analysis response
const DUMMY_REPORT = {
  score: 78,
  scoreColor: '#facc15', // yellow for ok
  strengths: ['Action Verbs', 'Clear Formatting', 'Contact Info Present'],
  weaknesses: ['Missing quantifiable metrics', 'Summary is too vague', 'Skills list lacks technical depth'],
  atsCompatibility: 'Medium',
};

export default function ResumeAnalyzerScreen() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'scanning' | 'results'
  const [fileName, setFileName] = useState('');

  // Scanning laser animation
  const laserOffset = useSharedValue(0);

  useEffect(() => {
    if (status === 'scanning') {
      laserOffset.value = withRepeat(withTiming(150, { duration: 1000 }), -1, true);
      // Simulate backend AI engine latency
      const timer = setTimeout(() => {
        setStatus('results');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const laserAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: laserOffset.value }],
    };
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFileName(result.assets[0].name);
        setStatus('scanning');
      }
    } catch (error) {
      console.error("Error picking document: ", error);
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setFileName('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#171717']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView edges={['top']} style={{ zIndex: 10 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={30} tint="dark" style={styles.iconCircle}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Resume Analyzer</Text>
          <View style={{ width: 44 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {status === 'idle' && (
          <Animated.View entering={FadeInDown.duration(800)} style={styles.uploadSection}>
            <Text style={styles.subtitle}>Upload your CV to see how an Applicant Tracking System (ATS) grades you.</Text>
            
            <TouchableOpacity onPress={pickDocument} activeOpacity={0.8} style={styles.uploadZone}>
              <LinearGradient colors={['rgba(250, 204, 21, 0.2)', 'rgba(250, 204, 21, 0.05)']} style={StyleSheet.absoluteFillObject} />
              <BlurView intensity={20} tint="dark" style={styles.uploadBlur}>
                <View style={styles.uploadIconWrapper}>
                  <FontAwesome5 name="cloud-upload-alt" size={48} color="#facc15" />
                </View>
                <Text style={styles.uploadTitle}>Tap to Browse Files</Text>
                <Text style={styles.uploadDesc}>Supports PDF, DOCX (Max 5MB)</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        )}

        {status === 'scanning' && (
          <Animated.View entering={FadeInUp.duration(500)} style={styles.scanningSection}>
            <Text style={styles.scanningTitle}>Analyzing "{fileName}"</Text>
            <Text style={styles.scanningSubtitle}>Extracting NLP tokens and cross-referencing industry standards...</Text>
            
            <View style={styles.scannerBox}>
              <FontAwesome5 name="file-pdf" size={80} color="rgba(255,255,255,0.4)" />
              <Animated.View style={[styles.laserLine, laserAnimatedStyle]} />
            </View>
            <ActivityIndicator size="large" color="#facc15" style={{ marginTop: 40 }} />
          </Animated.View>
        )}

        {status === 'results' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <Animated.View entering={FadeInDown.duration(800)}>
              <BlurView intensity={30} tint="dark" style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Overall ATS Score</Text>
                <View style={[styles.scoreCircle, { borderColor: DUMMY_REPORT.scoreColor }]}>
                  <Text style={[styles.scoreValue, { color: DUMMY_REPORT.scoreColor }]}>{DUMMY_REPORT.score}</Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <Text style={styles.atsStatus}>Compatibility: <Text style={{ color: '#61dafb' }}>{DUMMY_REPORT.atsCompatibility}</Text></Text>
              </BlurView>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(800).delay(200)} style={styles.feedbackGrid}>
              <Text style={styles.sectionTitle}>Key Strengths</Text>
              {DUMMY_REPORT.strengths.map((item, idx) => (
                <View key={idx} style={styles.feedbackItem}>
                  <FontAwesome5 name="check-circle" size={16} color="#34d399" />
                  <Text style={styles.feedbackText}>{item}</Text>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Areas to Improve</Text>
              {DUMMY_REPORT.weaknesses.map((item, idx) => (
                <View key={idx} style={styles.feedbackItem}>
                  <FontAwesome5 name="exclamation-circle" size={16} color="#ef4444" />
                  <Text style={styles.feedbackText}>{item}</Text>
                </View>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(800).delay(400)} style={{ marginTop: 40 }}>
              <TouchableOpacity onPress={resetScanner}>
                <LinearGradient colors={['#facc15', '#fb923c']} style={styles.resetButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.resetButtonText}>Scan Another Resume</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        )}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  uploadZone: {
    height: 250,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#facc15',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  uploadDesc: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  scanningSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  scanningSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  scannerBox: {
    width: 150,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  laserLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#facc15',
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 30,
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreMax: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 16,
  },
  atsStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  feedbackText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },
  resetButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
