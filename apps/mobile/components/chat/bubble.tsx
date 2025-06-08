import { MessageUserProfile } from '@messanger/types';
import * as React from 'react';
import { Surface, Text } from 'react-native-paper';

type BubbleProps = {
    message?: string;
    isSent?: boolean;
    createdAt?: Date;
    sender: MessageUserProfile;
};

export default function BubbleChat({ message, isSent, createdAt }: BubbleProps) {
    return (
        <Surface style={{
            padding: 10,
            margin: 8,
            borderRadius: 16,
            elevation: 2,
            alignSelf: isSent ? 'flex-end' : 'flex-start',
        }}>
            <Text>{message}</Text>
        </Surface>
    );
}
