


import AppSafeArea from '@/components/AppSafeArea';
import { useLocalSearchParams } from 'expo-router';
import React from 'react'
import { Image } from 'react-native';

export default function Welcome() {
    const params = useLocalSearchParams();
    return (
        <AppSafeArea padding={0}>
            <Image
                source={{
                    uri: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80',
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                }}
            />
        </AppSafeArea>
    )
}
