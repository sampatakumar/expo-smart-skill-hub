import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // 🎨 Floating Glass Tab Bar
        tabBarStyle: styles.tabBar,

        tabBarBackground: () => (
          <BlurView
            intensity={30}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),

        tabBarActiveTintColor: "#d946ef",
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarShowLabel: false,
        safeAreaInsets: { bottom: 0 },
      }}
    >
      {/* 🏠 HOME */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Ionicons name="home" size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* 📚 COURSES */}
      <Tabs.Screen
        name="courses"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <FontAwesome5 name="book-open" size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="tools"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <FontAwesome5 name="toolbox" size={20} color={color} />
            </View>
          ),
        }}
      />

      {/* 👤 PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Ionicons name="person" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    height: 65,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  iconActive: {
    backgroundColor: "rgba(217, 70, 239, 0.2)",
    transform: [{ scale: 1.1 }],
  },
});