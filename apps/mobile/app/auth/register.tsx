import { View } from '@/components/Themed';
import { Stack, useNavigation } from 'expo-router';
import React from 'react'
import { Button } from 'react-native-paper';




export default function Register() {
    const navigation = useNavigation();
    return (
        <View>
            <Stack.Screen
                options={{
                    title: 'My home',
                    headerStyle: { backgroundColor: '#f4511e' },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    }
                }}
            />

            <Button mode="contained" onPress={() => navigation.setOptions({ headerRight: () => null })}>
                Register
            </Button>
            {/* Add your registration form or components here */}
        </View>
    )
}
