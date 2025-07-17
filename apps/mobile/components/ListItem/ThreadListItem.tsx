import { ConversationPublic, ConversationUserProfile, ThreadList, ThreadPublic, UserProfileThread } from '@messanger/types';
import React from 'react';
import { Avatar, Badge, List, Text } from 'react-native-paper';
import { Pressable, StyleSheet, View } from 'react-native';
import StackWrapper from '../StackWrapper';
import ParticipantsAvatar from '../ParticipantsAvatar';

type SenderProps = {
  thread: ThreadList;
  onPress?: () => void;
  onAvatarPress: (data: ThreadPublic) => void;
};

export default function ThreadListItem({ thread, onPress, onAvatarPress }: SenderProps) {


  // Todo : Format the createdAt date to a more readable format
  const time = thread?.lastConversation?.createdAt ? new Date(thread?.lastConversation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const avatarThread = thread.type === 'PRIVATE' ? thread.lastConversation?.sender?.avatar : thread.avatar;
  const titleThread = thread.type === 'PRIVATE' ? thread.lastConversation?.sender?.username : thread.name;

  return (
    <List.Item
      key={thread.id}
      style={StyleSheet.flatten([{ paddingVertical: 8, paddingHorizontal: 16 }])}
      onPress={() => onPress?.()}
      title={() => (
        <StackWrapper flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="titleMedium" numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, maxWidth: '75%' }}>
            {titleThread}
          </Text>
          {
            (thread?.type === 'GROUP' && thread?.participants) && (
              <ParticipantsAvatar participants={thread?.participants} size={20} />
            )
          }
          <Text variant="bodySmall">{time}</Text>
        </StackWrapper>
      )}
      description={() => (
        <StackWrapper flexDirection="row" alignItems="center" justifyContent="space-between">
          {thread.type === 'PRIVATE' ? (
            <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%' }}>
              {thread.lastConversation?.content}
            </Text>
          ) : (
            <StackWrapper flexDirection="row" space={1}>
              <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%', fontWeight: '500', fontStyle: 'italic', marginRight: 2, color: '#D9D9D9' }}>
                @{thread?.lastConversation?.sender?.username}
              </Text>
              <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%', fontWeight: '100', fontStyle: 'italic', }}>
                {thread?.lastConversation?.content}
              </Text>
            </StackWrapper>
          )}
          {(thread.unreadCount ?? 0) > 0 && <Badge>{thread.unreadCount}</Badge>}
        </StackWrapper>
      )}
      left={() => (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onAvatarPress?.(thread);
          }}
          hitSlop={10}
        >
          <Avatar.Image size={48} source={{ uri: avatarThread || 'https://via.placeholder.com/150' }} />
        </Pressable>
      )}
    // right={() => {
    //   if (thread?.type === 'GROUP' && thread?.participants) {
    //     return <ParticipantsAvatar participants={thread?.participants} />;
    //   }
    //   return null;
    // }}
    />
  );
}
