import { ConversationPublic, ConversationUserProfile, FriendshipColorLabel, FriendshipList, FriendshipStatusEnum, FriendshipStatusPublic, UserProfileThread } from '@messanger/types';
import React from 'react';
import { Avatar, Badge, List, Text } from 'react-native-paper';
import { Pressable, StyleSheet, View } from 'react-native';
import StackWrapper from '../StackWrapper';
import ParticipantsAvatar from '../ParticipantsAvatar';
import { DateTimeFormatUtils } from '@/utils/datetime-format';
import { generateSchemaFromEnum, getColorFromLabelColorSchema } from '@/utils/label-color';

type FriendListItem = {
  friendship: FriendshipList;
  onPress: (friend: UserProfileThread) => void;
  //onAvatarPress?: (sender: ConversationUserProfile) => void;
};


export default function FriendListItem({ friendship, onPress }: FriendListItem) {
  // Todo : Format the createdAt date to a more readable format
  const handleAvatarPress = () => {
    console.log('Avatar pressed');
  };
  console.log(friendship);
  return (
    <List.Item
      key={friendship.id}
      style={StyleSheet.flatten([{ paddingVertical: 8, paddingHorizontal: 16 }])}
      onPress={() => onPress}
      title={() => (
        <StackWrapper flexDirection="row" alignItems="center" justifyContent="space-between">
          <StackWrapper flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="titleMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%' }}>
              {friendship?.friend?.username}
            </Text>
          </StackWrapper>
          <Text variant="bodySmall">{DateTimeFormatUtils.convertDateTimeToHuman(friendship?.currentStatus?.changedAt ?? '')}</Text>
        </StackWrapper>
      )}
      description={() => (
        <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '80%' }}>
          {friendship?.friend?.description}
        </Text>
      )}
      left={() => (
        <Pressable onPress={handleAvatarPress} hitSlop={10}>
          <Avatar.Image size={48} source={{ uri: friendship?.friend?.avatar || 'https://via.placeholder.com/150' }} />
        </Pressable>
      )}
      right={() => {
        return friendship?.currentStatus && (
          <Badge style={{ backgroundColor: getColorFromLabelColorSchema(generateSchemaFromEnum(FriendshipColorLabel), friendship?.currentStatus?.status) }}>{friendship?.currentStatus?.status}</Badge>
        );
      }}
    />
  );
}
