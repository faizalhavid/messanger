

import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

export default function ConversationDetail() {
    const params = useLocalSearchParams()
    return (
        <View>
            <Text>Conversation ID: {params.messageid}</Text>
            {/* You can add more details about the conversation here */}
        </View>
    )
}
