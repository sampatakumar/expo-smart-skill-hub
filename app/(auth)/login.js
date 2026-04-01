import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { signInWithGitHub } from "../../src/services/authService";
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGitHub();
      
      // Explicitly redirect to Home after successful login
      router.replace("/(main)/home");
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative Orbs */}
      <View style={[styles.orb, { top: height * 0.1, left: -width * 0.2, backgroundColor: '#818cf8' }]} />
      <View style={[styles.orb, { bottom: height * 0.2, right: -width * 0.3, backgroundColor: '#c084fc', width: 400, height: 400 }]} />

      <Animated.View 
        entering={FadeInDown.duration(800).springify()}
        style={styles.content}
      >
        <BlurView intensity={40} tint="dark" style={styles.glassCard}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#818cf8', '#c084fc']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome5 name="layer-group" size={32} color="white" />
            </LinearGradient>
          </View>
          
          <Text style={styles.title}>Smart Skill Hub</Text>
          <Text style={styles.subtitle}>Unlock your potential and master new skills effortlessly.</Text>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome5 name="github" size={20} color="white" style={{ marginRight: 12 }} />
                  <Text style={styles.buttonText}>Continue with GitHub</Text>
                </>
              )}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#020617'
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.4,
    filter: [{ blur: 60 }],
  },
  content: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  glassCard: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: "#818cf8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  button: {
    flexDirection: "row",
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
