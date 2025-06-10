import { ConversationUserProfile } from '@messanger/types'
import React from 'react'
import { Avatar, Badge, List, Text } from 'react-native-paper'
import { Pressable, StyleSheet, View } from 'react-native'
import StackWrapper from '../StackWrapper'

type SenderProps = {
    sender: ConversationUserProfile,
    message?: string,
    createdAt?: Date,
    unreadCount?: number,
    onPress?: () => void,
    onAvatarPress?: (sender: ConversationUserProfile) => void,
}

export default function ConversationListItem({ sender, message, createdAt, unreadCount = 2, onPress, onAvatarPress }: SenderProps) {
    console.log("Sender", message);
    const fullName = `${sender.firstName} ${sender.lastName}`
    // Todo : Format the createdAt date to a more readable format
    const time = sender.createdAt
        ? new Date(sender.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    const handleAvatarPress = () => {
        if (onAvatarPress) {
            onAvatarPress(sender);
        }
    };

    return (
        <List.Item
            key={sender.id}
            style={StyleSheet.flatten([
                { paddingVertical: 8, paddingHorizontal: 16 },

            ])}
            onPress={onPress}
            title={() => (
                <StackWrapper flexDirection='row' alignItems='center' justifyContent='space-between'>
                    <Text variant="titleMedium" numberOfLines={1}>{fullName}</Text>
                    <Text variant="bodySmall" >{time}</Text>
                </StackWrapper>
            )}
            description={() => (
                <StackWrapper flexDirection='row' alignItems='center' justifyContent='space-between'>
                    <Text
                        variant="bodyMedium"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ maxWidth: '80%' }}
                    >
                        {message}
                    </Text>
                    {unreadCount > 0 && (
                        <Badge >{unreadCount}</Badge>
                    )}
                </StackWrapper>
            )}
            left={() => (
                <Pressable onPress={handleAvatarPress} hitSlop={10}>
                    <Avatar.Image
                        size={48}
                        source={{ uri: sender.avatar || 'https://via.placeholder.com/150' }}

                    />
                </Pressable>
            )}
        />
    )
}

