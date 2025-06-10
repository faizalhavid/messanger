import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { Divider, Text } from 'react-native-paper';
import AppSafeArea from '@/components/AppSafeArea';
import BubbleChat from '@/components/chat/bubble';
import ConversationListItem from '@/components/chat/conversation-list-item';
import { useRouter } from 'expo-router';
import { ConversationPublic, ListUserConversationsResponse } from '@messanger/types';
import { getConversations } from '@/services/conversation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/auth';



export default function TabOneScreen() {
  const router = useRouter();
  let unReadCount = 0;
  const { user } = useAuthStore();
  const pageState = React.useState({
    isLoading: false,
    refreshing: false,
    showPassword: false,
    disableButtonSubmit: false,
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


  return (
    <AppSafeArea
      loading={pageState[0].isLoading}
      errorMessage={pageState[0].generalError}
      onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })}
      refreshing={pageState[0].refreshing}
      padding={{ top: 12, left: 0, right: 0 }}
    >
      <FlatList
        data={pageState[0].conversations}
        style={{ minHeight: '100%' }}
        keyExtractor={(item) => item.id || ''}
        renderItem={({ item }) => {
          unReadCount = item.isRead ? 0 : (unReadCount + 1);
          const anotherUser = user?.id === item.sender.user.id ? item.receiver : item.sender;
          return (
            (
              <ConversationListItem
                sender={item.sender}
                onPress={() => {
                  if (item.id) {
                    router.push({ pathname: "/conversations/[id]", params: { id: anotherUser.user.id } });
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
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  messageItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
