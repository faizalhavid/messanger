import { ConversationPublic, ConversationUserProfile } from '@messanger/types';
import React from 'react';
import { Avatar, Badge, List, Text } from 'react-native-paper';
import { Pressable, StyleSheet, View } from 'react-native';
import StackWrapper from '../StackWrapper';
import ParticipantsAvatar from '../ParticipantsAvatar';

type SenderProps = {
  threadId: string;
  title: string;
  type: 'PRIVATE' | 'GROUP';
  lastConversation?: ConversationPublic;
  unreadCount?: number;
  participants?: ConversationUserProfile[];
  creator?: ConversationUserProfile;
  avatar?: string | undefined | null;
  onPress?: () => void;
  //onAvatarPress?: (sender: ConversationUserProfile) => void;
};

export default function ThreadListItem({ type, lastConversation, unreadCount = 2, participants, creator, avatar, onPress, ...props }: SenderProps) {
  // Todo : Format the createdAt date to a more readable format
  const time = lastConversation?.createdAt ? new Date(lastConversation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const handleAvatarPress = () => {
    console.log('Avatar pressed');
  };

  return (
    <List.Item
      key={props.threadId}
      style={StyleSheet.flatten([{ paddingVertical: 8, paddingHorizontal: 16 }])}
      onPress={onPress}
      title={() => (
        <StackWrapper flexDirection="row" alignItems="center" justifyContent="space-between">
          <StackWrapper flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="titleMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%' }}>
              {props.title}
            </Text>
          </StackWrapper>
          <Text variant="bodySmall">{time}</Text>
        </StackWrapper>
      )}
      description={() => (
        <StackWrapper flexDirection="row" alignItems="center" justifyContent="space-between">
          {type === 'PRIVATE' ? (
            <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%' }}>
              {lastConversation?.content}
            </Text>
          ) : (
            <StackWrapper flexDirection="row" space={1}>
              <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%', fontWeight: '500' }}>
                {lastConversation?.sender?.username}
              </Text>
              <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%' }}>
                {lastConversation?.content}
              </Text>
            </StackWrapper>
          )}
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </StackWrapper>
      )}
      left={() => (
        <Pressable onPress={handleAvatarPress} hitSlop={10}>
          <Avatar.Image size={48} source={{ uri: avatar || 'https://via.placeholder.com/150' }} />
        </Pressable>
      )}
      right={() => {
        if (type === 'GROUP' && participants) {
          return <ParticipantsAvatar participants={participants} />;
        }
        return null;
      }}
    />
  );
}
