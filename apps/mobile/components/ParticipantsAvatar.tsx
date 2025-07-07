import { ConversationUserProfile } from '@messanger/types';
import React from 'react';
import StackWrapper from './StackWrapper';
import { Avatar } from 'react-native-paper';

interface ParticipantsAvatarProps {
  participants: ConversationUserProfile[];
}

export default function ParticipantsAvatar({ participants }: ParticipantsAvatarProps) {
  return (
    <StackWrapper flexDirection="row" space={-5}>
      {participants.map((participant) => (
        <Avatar.Image key={participant.id} source={participant.avatar ? { uri: participant.avatar } : require('@/assets/images/avatar-placeholder.png')} size={40} style={{ marginLeft: 5, marginRight: -10 }} />
      ))}
    </StackWrapper>
  );
}
