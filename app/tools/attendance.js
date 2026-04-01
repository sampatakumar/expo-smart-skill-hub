import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { router } from 'expo-router';

// Fast logic to determine margins and required classes safely
const getAttendanceMargin = (attended, total, targetPercent) => {
  if (total === 0) return { status: 'idle', message: 'Add classes to see prediction.', pct: '0.00', color: '#fb923c' };

  const currentPct = (attended / total) * 100;
  let formattedPct = currentPct.toFixed(2);
  
  if (currentPct >= targetPercent) {
    // How many can I bunk without dropping under target?
    // (attended / (total + x)) * 100 >= target
    // attended >= (total + x) * (target/100)
    // attended / (target/100) >= total + x
    // x <= (attended / (target/100)) - total
    
    let bunkable = Math.floor((attended / (targetPercent / 100)) - total);
    
    // edgecase bounds
    if (bunkable < 0) bunkable = 0;

    return {
      status: 'safe',
      message: `You can safely bunk ${bunkable} ${bunkable === 1 ? 'class' : 'classes'}.`,
      pct: formattedPct,
      color: '#34d399', // Green
    };
  } else {
    // How many do I need to attend sequentially to hit target?
    // ((attended + x) / (total + x)) * 100 >= target
    // attended + x >= (total + x) * (target/100)
    // let t = target/100
    // x - x*t >= total*t - attended
    // x(1 - t) >= total*t - attended
    // x >= (total*t - attended) / (1 - t)
    
    let t = targetPercent / 100;
    
    // If target is literally 100%, and we already missed a class, we can NEVER reach it.
    if (t >= 1) {
       return {
         status: 'danger',
         message: `Impossible to reach 100% since classes were missed.`,
         pct: formattedPct,
         color: '#ef4444',
       };
    }

    let required = Math.ceil((total * t - attended) / (1 - t));
    
    return {
      status: 'danger',
      message: `You must attend the next ${required} ${required === 1 ? 'class' : 'classes'} sequentially.`,
      pct: formattedPct,
      color: '#ef4444', // Red
    };
  }
};

export default function AttendanceScreen() {
  const [attended, setAttended] = useState('');
  const [total, setTotal] = useState('');
  const [target, setTarget] = useState('75');

  const attendedNum = parseInt(attended) || 0;
  const totalNum = parseInt(total) || 0;
  const targetNum = parseInt(target) || 75;

  const result = useMemo(() => {
     // Failsafe: Cannot attend more than total
     if (attendedNum > totalNum && totalNum !== 0) {
        return { status: 'error', message: 'Attended cannot exceed Total.', pct: 'ERR', color: '#facc15' };
     }
     return getAttendanceMargin(attendedNum, totalNum, targetNum);
  }, [attendedNum, totalNum, targetNum]);

  // Safe numerical state updater
  const handleInput = (setter, val) => {
    if (/^\d*$/.test(val)) setter(val);
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
          <Text style={styles.headerTitle}>Attendance Bot</Text>
          <View style={{ width: 44 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Dynamic Readout Card */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.resultCard}>
          <LinearGradient colors={[`${result.color}30`, `${result.color}05`]} style={StyleSheet.absoluteFillObject} />
          
          <View style={styles.circularDisplay}>
             <View style={[styles.circleBorder, { borderColor: result.color }]}>
                <Text style={[styles.percentageText, { color: result.color }]}>{result.pct}%</Text>
                <Text style={styles.percentageLabel}>CURRENT</Text>
             </View>
          </View>

          <View style={styles.messageBox}>
            <FontAwesome5 
              name={result.status === 'safe' ? 'check-circle' : result.status === 'danger' ? 'exclamation-triangle' : 'info-circle'} 
              size={18} 
              color={result.color} 
            />
            <Text style={[styles.messageText, { color: result.status === 'idle' ? 'rgba(255,255,255,0.6)' : '#ffffff' }]}>
              {result.message}
            </Text>
          </View>
        </Animated.View>

        {/* Form Inputs */}
        <Animated.View entering={FadeInUp.duration(800).delay(150)}>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FontAwesome5 name="check" size={12} color="#fb923c" style={{ marginRight: 8 }} />
              <Text style={styles.inputLabel}>Classes Attended</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.textInput}
                keyboardType="number-pad"
                placeholder="e.g. 34"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={attended}
                onChangeText={(val) => handleInput(setAttended, val)}
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FontAwesome5 name="list-ul" size={12} color="#fb923c" style={{ marginRight: 8 }} />
              <Text style={styles.inputLabel}>Total Classes Conducted</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.textInput}
                keyboardType="number-pad"
                placeholder="e.g. 45"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={total}
                onChangeText={(val) => handleInput(setTotal, val)}
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FontAwesome5 name="bullseye" size={12} color="#fb923c" style={{ marginRight: 8 }} />
              <Text style={styles.inputLabel}>Target Percentage (%)</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.textInput}
                keyboardType="number-pad"
                placeholder="75"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={target}
                onChangeText={(val) => handleInput(setTarget, val)}
                maxLength={3}
              />
            </View>
          </View>

        </Animated.View>

      </ScrollView>
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
    padding: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 40,
    overflow: 'hidden',
  },
  circularDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  circleBorder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  percentageLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 4,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
    textAlign: 'center',
    flexShrink: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
