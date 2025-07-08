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
    isLoading: false,
    refreshing: false,
    isSpeedDialExtended: true,
    generalError: '',
  });

  return (
    <AppSafeArea loading={pageState[0].isLoading} errorMessage={pageState[0].generalError} onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })} refreshing={pageState[0].refreshing} padding={{ top: 12, left: 0, right: 0 }}>
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
      <FlatList
        data={data}
        style={{ minHeight: '100%' }}
        keyExtractor={(item: ThreadList) => item.id || ''}
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
        refreshControl={<RefreshControl refreshing={pageState[0].refreshing} onRefresh={refetch} />}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={pageState[0].isLoading ? <Text style={{ textAlign: 'center', marginTop: 32 }}>No conversations found.</Text> : null}
      />
      <SpeedDial
        visible={true}
        extended={pageState[0].isSpeedDialExtended}
        label="New Message"
        animateFrom="right"
        iconMode="static"
        icon="plus"
        onPress={() => {
          console.log('New conversation pressed');
          // router.push('/conversations/new');
        }}
      />
    </AppSafeArea>
  );
}
