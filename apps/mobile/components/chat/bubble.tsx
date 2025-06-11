import { useAuthStore } from '@/store/auth';
import { ConversationPublic } from '@messanger/types';
import * as React from 'react';
import { Avatar, Icon, Surface, Text } from 'react-native-paper';
import StackWrapper from '../StackWrapper';
import { MaterialCommunityIcons } from '@expo/vector-icons';


type BubbleProps = {
    message?: ConversationPublic;
    interlocutorsId?: string;
};

export default function BubbleChat({ message, interlocutorsId }: BubbleProps) {
    const { user } = useAuthStore();

    if (!message) return null;
    const isMessageFromCurrentUser = message.sender.user.id === user?.id;
    return (
        <Surface
            style={{
                padding: 10,
                margin: 8,
                borderRadius: 16,
                backgroundColor: isMessageFromCurrentUser ? '#6200ee' : '#03dac6',
                elevation: 2,
                flexDirection: 'column',
                alignSelf: isMessageFromCurrentUser ? 'flex-end' : 'flex-start',

            }}
        >
            <StackWrapper flexDirection='row' alignItems='center' justifyContent='flex-start' space={8} style={{ marginBottom: 4 }}>
                {
                    !isMessageFromCurrentUser && (
                        <Avatar.Image
                            size={18}
                            source={{
                                uri: message.sender.avatar ?? 'https://ui-avatars.com/api/',
                            }}
                        />
                    )
                }
                <Text variant="bodySmall" style={{ color: '#fff', marginRight: 8, fontStyle: 'italic', fontWeight: '500' }}>
                    {isMessageFromCurrentUser ? 'You' : message.sender.firstName}
                </Text>
            </StackWrapper>
            <Text ellipsizeMode="tail"
                style={{ color: '#fff', maxWidth: '85%' }}>{message.content}</Text>
            <StackWrapper flexDirection='row' alignItems='center' justifyContent='flex-end' style={{ marginTop: 4 }}>
                <Text variant="bodySmall" style={{ color: '#fff', fontStyle: 'italic' }}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>

                <MaterialCommunityIcons name="check-all" size={16} color={message.isRead ? '#fff' : '#ccc'} style={{ marginLeft: 8 }} />


            </StackWrapper>

        </Surface>
    );
}
