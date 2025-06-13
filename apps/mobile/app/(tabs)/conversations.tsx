import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { Appbar, Divider, Text } from 'react-native-paper';
import AppSafeArea from '@/components/AppSafeArea';
import BubbleChat from '@/components/chat/bubble';
import ConversationListItem from '@/components/chat/conversation-list-item';
import { useRouter } from 'expo-router';
import { ConversationPublic, ListUserConversationsResponse } from '@messanger/types';
import { getConversations } from '@/services/conversation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/auth';
import SpeedDial from '@/components/SpeedDial';



export default function Conversations() {
  const router = useRouter();
  let unReadCount = 0;
  const { user } = useAuthStore();
  const pageState = React.useState({
    isLoading: false,
    refreshing: false,
    showPassword: false,
    disableButtonSubmit: false,
    isSpeedDialExtended: true,
    generalError: '',
    conversations: [] as ConversationPublic[]
  });

  const retrieveConversations = async () => {
    pageState[1]({
      ...pageState[0],
      isLoading: true,
    });
    try {
      const response = await getConversations();
      console.log("Response", response);
      pageState[1]({
        ...pageState[0],
        isLoading: false,
        conversations: response?.data?.items ?? [],
      });
    } catch (error) {
      pageState[1]({
        ...pageState[0],
        isLoading: false,
        generalError: error instanceof Error ? error.message : 'Failed to fetch messages',
      });
    }
  }

  useEffect(() => {
    retrieveConversations();
  }, []);

  const handleSearch = () => {
    console.log("Search pressed");
    // Implement search functionality here
  };

  const handleMore = () => {
    console.log("More options pressed");
    // Implement more options functionality here
  };

  return (
    <AppSafeArea
      loading={pageState[0].isLoading}
      errorMessage={pageState[0].generalError}
      onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })}
      refreshing={pageState[0].refreshing}
      padding={{ top: 12, left: 0, right: 0 }}
    >
      <Appbar.Header>
        <Appbar.Content title="Messages" />
        <Appbar.Action icon="magnify" onPress={handleSearch} />
        <Appbar.Action icon="dots-vertical" onPress={handleMore} />
      </Appbar.Header>
      <FlatList
        data={pageState[0].conversations}
        style={{ minHeight: '100%' }}
        keyExtractor={(item) => item.id || ''}
        renderItem={({ item }) => {
          unReadCount = item.isRead ? 0 : (unReadCount + 1);
          console.log('id', user?.id)
          const interlocutor =
            user?.id == item.sender.user.id
              ? item.receiver
              : item.sender;
          return (
            (
              <ConversationListItem
                sender={item.sender}
                onPress={() => {
                  console.log("Selected conversation", interlocutor);
                  if (item.id) {
                    router.push({ pathname: "/conversations/[id]", params: { id: interlocutor.user.id } });
                  }
                }}
                unreadCount={unReadCount}
                message={item.content || ''}
                createdAt={new Date(item.createdAt)}
              />
            )
          );
        }}
        ItemSeparatorComponent={() => <Divider style={{ marginVertical: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={pageState[0].refreshing}
            onRefresh={retrieveConversations}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          pageState[0].isLoading
            ? <Text style={{ textAlign: 'center', marginTop: 32 }}>No conversations found.</Text>
            : null
        }
      />
      <SpeedDial
        visible={true}
        extended={pageState[0].isSpeedDialExtended}
        label="New Message"
        animateFrom="right"
        iconMode="static"
        icon="plus"
        onPress={() => {
          console.log("New conversation pressed");
          router.push('/conversations/new');
        }}
      />
    </AppSafeArea>
  );
}
