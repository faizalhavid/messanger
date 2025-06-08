import { MessageUserProfile } from '@messanger/types'
import React from 'react'
import { Avatar, Badge, List, Text } from 'react-native-paper'
import { Pressable, StyleSheet, View } from 'react-native'

type SenderProps = {
    sender: MessageUserProfile,
    message?: string,
    createdAt?: Date,
    unreadCount?: number,
    onPress?: () => void,
    onAvatarPress?: (sender: MessageUserProfile) => void,
}

export default function ConversationListItem({ sender, message, createdAt, unreadCount = 2, onPress, onAvatarPress }: SenderProps) {
    const fullName = `${sender.firstName} ${sender.lastName}`
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
            style={styles.container}
            onPress={onPress}
            title={() => (
                <View style={styles.row}>
                    <Text variant="titleMedium" numberOfLines={1} style={styles.name}>{fullName}</Text>
                    <Text variant="bodySmall" style={styles.time}>{time}</Text>
                </View>
            )}
            description={() => (
                <View style={styles.row}>
                    <Text variant="bodyMedium" numberOfLines={1} style={styles.message}>{message}</Text>
                    {unreadCount > 0 && (
                        <Badge style={styles.badge}>{unreadCount}</Badge>
                    )}
                </View>
            )}
            left={() => (
                <Pressable onPress={handleAvatarPress} hitSlop={10}>
                    <Avatar.Image
                        size={48}
                        source={{ uri: sender.avatar || 'https://via.placeholder.com/150' }}
                        style={styles.avatar}
                    />
                </Pressable>
            )}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
        paddingHorizontal: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        flex: 1,
        fontWeight: 'bold',
    },
    time: {
        color: '#888',
        marginLeft: 8,
        fontSize: 12,
    },
    message: {
        flex: 1,
        color: '#444',
    },
    badge: {
        marginLeft: 8,
        alignSelf: 'center',
        backgroundColor: '#25D366',
        color: 'white',
    },
    avatar: {
        marginRight: 8,
    },
});