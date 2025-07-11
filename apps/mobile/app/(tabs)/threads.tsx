import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { Appbar, Divider, Text } from 'react-native-paper';
import AppSafeArea from '@/components/AppSafeArea';
import ConversationBubleChat from '@/components/messages/conversation-buble-chat';

import { useRouter } from 'expo-router';
import { QueryParamsData, ThreadList, ThreadPublic } from '@messanger/types';
import { getConversations } from '@/services/apis/conversation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/auth';
import SpeedDial from '@/components/SpeedDial';
import { getThreads } from '@/services/apis/thread';
import { useMutationThreadQuery, useThreadQuery } from '@/services/queries/threads-query';
import ThreadListItem from '@/components/messages/thread-list-item';
import FriendshipModal from '@/components/FriendshipModal';

export default function ThreadsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [queryParams, setQueryParams] = React.useState<QueryParamsData>({
    search: '',
    page: 1,
    limit: 20,
  });
  const { data, isLoading, refetch, isRefetching } = useThreadQuery(queryParams);
  const { mutate: sendThread, isPending, error } = useMutationThreadQuery(Array.isArray(data) ? data[0]?.id : '');

  const pageState = React.useState({
    isSpeedDialVisible: true,
    isSpeedDialExtended: true,
    isModalFriendshipVisible: false,
    generalError: '',
  });

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Messages" />
        <Appbar.Action
          icon="magnify"
          onPress={() => {
            setQueryParams({ ...queryParams, search: '' });
          }}
        />
        <Appbar.Action
          icon="dots-vertical"
          onPress={() => {
            console.log('Open menu');
            pageState[1]({ ...pageState[0], isSpeedDialExtended: !pageState[0].isSpeedDialExtended });
          }}
        />
      </Appbar.Header>
      <AppSafeArea space={0} errorMessage={pageState[0].generalError} onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })} refreshing={isRefetching} padding={{ top: 12, left: 0, right: 0 }}>

        <FlatList
          data={data}
          keyExtractor={(item: ThreadList) => item.id || ''}
          style={{ backgroundColor: 'black', minHeight: '100%' }}
          renderItem={({ item }) => {
            const avatarThread = item.type === 'PRIVATE' ? item.lastConversation?.sender?.avatar : item.avatar;
            const titleThread = item.type === 'PRIVATE' ? item.lastConversation?.sender?.username : item.name;
            return (
              <ThreadListItem
                threadId={item.id}
                title={titleThread ?? ''}
                creator={item?.creator}
                participants={item.participants}
                onPress={() => {
                  console.log('Selected conversation', item);
                  if (item.id) {
                    router.push({ pathname: '/conversations/[id]', params: { id: item.id } });
                  }
                }}
                unreadCount={item.unreadCount || 0}
                lastConversation={item.lastConversation}
                avatar={avatarThread}
                type={item.type}
              />
            );
          }}
          ItemSeparatorComponent={() => <Divider style={{ marginVertical: 12 }} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={
            (event) => {
              pageState[1]({
                ...pageState[0],
                isSpeedDialVisible: event.nativeEvent.contentOffset.y < 100,
              });
            }
          }
          ListEmptyComponent={isLoading || data?.length === 0 ? <Text style={{ textAlign: 'center', marginTop: 32, color: 'white' }}>No conversations found.</Text> : null}
        />
        <SpeedDial
          visible={pageState[0].isSpeedDialVisible}
          extended={pageState[0].isSpeedDialExtended}
          label="New Message"
          animateFrom="right"
          iconMode="static"
          icon="plus"
          style={{
            position: 'absolute',
            bottom: 16,
            backgroundColor: '#6200ee',
          }}
          onPress={() => {
            console.log('New conversation pressed');
            pageState[1]({ ...pageState[0], isSpeedDialExtended: false, isModalFriendshipVisible: true });
            // router.push('/conversations/new');
          }}
        />
        <FriendshipModal isModalVisible={pageState[0].isModalFriendshipVisible} onDismiss={() => pageState[1]({ ...pageState[0], isModalFriendshipVisible: false })} onRequestFriendship={(friendship) => {
          console.log('Requesting friendship:', friendship);

        }} />
      </AppSafeArea>
    </>

  );
}
