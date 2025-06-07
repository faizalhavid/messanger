import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View >
        <Text >This screen doesn't exist.</Text>

        <Link href="/" >
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
