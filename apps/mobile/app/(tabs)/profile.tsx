import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter()
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Avatar.Text
            size={64}
            label={user?.username ? user.username[0].toUpperCase() : '?'}
            style={styles.avatar}
          />
          <Text variant="titleLarge" style={styles.name}>
            {user?.username || 'Unknown User'}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email || 'No email'}
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => {
            logout();
            router.push('/(auth)/login');
          }}>
            Logout
          </Button>
        </Card.Actions>
      </Card>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: '90%',
    paddingVertical: 24,
    alignItems: 'center'
  },
  content: {
    alignItems: 'center'
  },
  avatar: {
    marginBottom: 16
  },
  name: {
    marginTop: 8,
    marginBottom: 4
  },
  email: {
    marginBottom: 16
  }
});