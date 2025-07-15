import { FriendshipList, FriendshipStatusPublic, UserProfileThread } from '@messanger/types';
import { Button, Dialog, List, Modal, Searchbar } from 'react-native-paper';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { FlatList } from 'react-native';
import FriendListItem from '../ListItem/FriendListItem';

type FriendshipModalProps = {
  title?: string;
  friendships: FriendshipList[];
  isLoading?: boolean;
  isRefresh?: boolean;
  onRefresh?: () => void;
  isModalVisible: boolean;
  onDismiss?: () => void;
  onSearchFriend?: (searchValue: string) => void;
  onClickFriendListItem: (friend: FriendshipList) => void;
};
export default function FriendshipModal({ title = 'Title Friend Modal', friendships, isModalVisible, onDismiss, onSearchFriend, onClickFriendListItem, isRefresh, onRefresh, isLoading }: FriendshipModalProps) {
  const { user } = useAuthStore();
  const [componentState, setComponentState] = useState({
    search: '',
  });

  const handleSearchFriend = (value: string) => {
    setComponentState((prev) => ({ ...prev, search: value }));

    const result = friendships?.filter(fr =>
      fr?.friend.username.toLowerCase().includes(value.toLowerCase())
    ) ?? [];

    onSearchFriend?.(value); // sesuai definisi: (searchValue: string) => void

    return result;
  };


  return (
    <Dialog visible={isModalVisible} onDismiss={onDismiss} theme={{ colors: { primary: 'green' } }} style={{ padding: 5 }} >
      <Dialog.Title style={{ fontSize: 16 }}>{title}</Dialog.Title>
      <Dialog.ScrollArea>
        <Searchbar showDivider value={componentState.search} placeholder="Search" onChangeText={(text) => handleSearchFriend(text)} onIconPress={(e) => { onSearchFriend != undefined ? onSearchFriend(componentState.search) : null }} loading={isLoading} />
        <FlatList
          refreshing={isRefresh}
          onRefresh={onRefresh}
          data={friendships}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            <FriendListItem friendship={item} onPress={() => onClickFriendListItem(item)} />} ListEmptyComponent={(friendships ?? [])?.length === 0 ? <List.Item title="No friendships found." /> : null} />
      </Dialog.ScrollArea>
    </Dialog>
  );
}
