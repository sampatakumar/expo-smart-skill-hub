import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Linking,
  FlatList,
} from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { auth } from '../../src/services/firebaseConfig';
import { AuthContext } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const [repos, setRepos] = useState([]);
  const [showRepos, setShowRepos] = useState(false);
  const [reposLoading, setReposLoading] = useState(false);

  const displayName = user?.displayName || 'Developer';

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔹 Fetch GitHub profile
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const username = user?.displayName;

      const res = await fetch(`https://api.github.com/users/${username}`);
      const data = await res.json();

      if (data.message === "Not Found") {
        setUserProfile(null);
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch repos
  const fetchRepos = async () => {
    try {
      setReposLoading(true);

      const username = user?.displayName;

      const res = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated`
      );

      const data = await res.json();
      setRepos(data);
    } catch (err) {
      console.error('Repo error:', err);
    } finally {
      setReposLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#d946ef" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Profile */}
          <View style={styles.profileSection}>
            <Image
              source={{
                uri:
                  userProfile?.avatar_url ||
                  user?.photoURL ||
                  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'
              }}
              style={styles.avatar}
            />

            <Text style={styles.userName}>
              {userProfile?.name || displayName}
            </Text>

            <Text style={styles.userBio}>
              {userProfile?.bio || 'No bio available'}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>

            {/* Repos */}
            <TouchableOpacity
              onPress={() => {
                setShowRepos(!showRepos);
                if (!showRepos && repos.length === 0) fetchRepos();
              }}
            >
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {userProfile?.public_repos || 0}
                </Text>
                <Text style={styles.statLabel}>Repos</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {userProfile?.followers || 0}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {userProfile?.following || 0}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>

          </View>

          {/* Repos List */}
          {showRepos && (
            <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
              <Text style={styles.sectionTitle}>Repositories</Text>

              {reposLoading ? (
                <ActivityIndicator color="#d946ef" />
              ) : (
                <FlatList
                  data={repos}
                  keyExtractor={(item) => item.id.toString()}
                  style={{ maxHeight: 300 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.repoCard}
                      onPress={() => Linking.openURL(item.html_url)}
                    >
                      <Text style={styles.repoName}>{item.name}</Text>

                      {item.description && (
                        <Text style={styles.repoDesc}>
                          {item.description}
                        </Text>
                      )}

                      <View style={styles.repoRow}>
                        <Text style={styles.repoMeta}>⭐ {item.stargazers_count}</Text>
                        <Text style={styles.repoMeta}>🍴 {item.forks_count}</Text>
                        <Text style={styles.repoMeta}>
                          {item.language || 'N/A'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          )}

          {/* Menu */}
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>

            {/* GitHub Profile */}
            {userProfile?.html_url && (
              <TouchableOpacity
                style={styles.menuCard}
                onPress={() => Linking.openURL(userProfile.html_url)}
              >
                <View style={styles.menuRow}>
                  <Ionicons name="logo-github" size={20} color="#6366f1" />
                  <Text style={styles.menuText}>
                    View Profile on GitHub
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Settings */}
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => router.push('/settings')}
            >
              <View style={styles.menuRow}>
                <Ionicons name="settings" size={20} color="#d946ef" />
                <Text style={styles.menuText}>App Settings</Text>
              </View>
            </TouchableOpacity>

          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { justifyContent: 'center', alignItems: 'center' },

  scrollContent: { paddingBottom: 120 },

  profileSection: { alignItems: 'center', marginTop: 30 },

  avatar: { width: 100, height: 100, borderRadius: 50 },

  userName: { color: '#fff', fontSize: 20, marginTop: 10 },
  userBio: { color: '#aaa', textAlign: 'center', paddingHorizontal: 30 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },

  statCard: { alignItems: 'center' },

  statValue: { color: '#fff', fontSize: 16 },
  statLabel: { color: '#aaa', fontSize: 12 },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },

  repoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  repoName: { color: '#fff', fontWeight: 'bold' },
  repoDesc: { color: '#aaa', fontSize: 12 },

  repoRow: { flexDirection: 'row', marginTop: 6, gap: 10 },
  repoMeta: { color: '#d946ef', fontSize: 11 },

  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  menuText: { color: '#fff', fontSize: 15 },

  logoutBtn: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: 'red' },
});