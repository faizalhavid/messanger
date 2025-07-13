import { FriendshipList } from '@messanger/types';
import { List, Modal } from 'react-native-paper';
import React from 'react';
import { useAuthStore } from '@/store/auth';
import { useFriendshipQuery, useMutationFriendshipQuery } from '@/services/queries/friendship-query';
import { FlatList } from 'react-native';

type FriendshipModalProps = {
  friendships: FriendshipList[];
  isModalVisible: boolean;
  onDismiss?: () => void;
  onRequestFriendship?: (friendship: FriendshipList) => void;
};
export default function FriendshipModal({ friendships, isModalVisible, onDismiss, onRequestFriendship }: FriendshipModalProps) {
  const { user } = useAuthStore();

  return (
    <Modal visible={isModalVisible} onDismiss={onDismiss}>
      <FlatList data={friendships} keyExtractor={(item) => item.id} renderItem={({ item }) => <List.Item title={item.friend.username} onPress={() => onRequestFriendship?.(item)} />} ListEmptyComponent={friendships.length === 0 ? <List.Item title="No friendships found." /> : null} />
    </Modal>
  );
}
