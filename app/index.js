import { View, ActivityIndicator } from 'react-native';
import { useContext } from 'react';
import { Redirect } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0B1A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6ee7b7" />
      </View>
    );
  }

  // Auto redirect based on user authentication state
  if (user) {
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
