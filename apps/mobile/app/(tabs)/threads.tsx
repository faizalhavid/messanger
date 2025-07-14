import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { Appbar, Divider, Text } from 'react-native-paper';
import AppSafeArea from '@/components/AppSafeArea';
import { useRouter } from 'expo-router';
import { FriendshipList, QueryParamsData, ThreadList, ThreadPublic } from '@messanger/types';
import { useAuthStore } from '@/store/auth';
import SpeedDial from '@/components/SpeedDial';
import { useMutationThreadQuery, useThreadQuery } from '@/services/queries/threads-query';
import ThreadListItem from '@/components/ListItem/ThreadListItem';
import FriendshipModal from '@/components/Modal/FriendshipModal';
import { useFriendshipQuery, useMutationFriendshipQuery } from '@/services/queries/friendship-query';

export default function ThreadsPage() {
  const router = useRouter();
  const [queryParams, setQueryParams] = React.useState<{
    thread: QueryParamsData;
    friendship: QueryParamsData;
  }>({
    thread: {
      search: '',
      page: 1,
      limit: 20,
    },
    friendship: {
      search: '',
      page: 1,
      limit: 20,
    },
  });
  const { data: threadData, isLoading: threadLoading, refetch: refetchThread, isRefetching: isThreadRefetching } = useThreadQuery(queryParams.thread);
  const { mutate: sendThread, isPending: isThreadPending, error: errorThread } = useMutationThreadQuery(Array.isArray(threadData) ? threadData[0]?.id : '');
  const { user } = useAuthStore();

  const { data: friendshipData, isLoading: friendshipLoading, refetch: refetchFriendship, isRefetching: isFriendshipRefetching } = useFriendshipQuery(queryParams.friendship);
  const { data: findFriendshipData, isLoading: findFriendshipLoading, refetch: refetchFindFriendship, isRefetching: isFindFriendshipRefetching } = useFriendshipQuery(queryParams.friendship);
  const { mutate: sendFriendship, isPending: isFriendshipPending, error: errorFriendship } = useMutationFriendshipQuery(Array.isArray(friendshipData) ? friendshipData[0]?.id : '');

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
            setQueryParams({ ...queryParams, thread: { ...queryParams.thread, search: '' } });
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
      <AppSafeArea space={0} errorMessage={pageState[0].generalError} onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })} refreshing={isThreadRefetching} padding={{ top: 12, left: 0, right: 0 }}>
        <FlatList
          data={threadData}
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
          refreshControl={<RefreshControl refreshing={isThreadRefetching} onRefresh={refetchThread} />}
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={(event) => {
            pageState[1]({
              ...pageState[0],
              isSpeedDialVisible: event.nativeEvent.contentOffset.y < 100,
            });
          }}
          ListEmptyComponent={threadLoading || threadData?.length === 0 ? <Text style={{ textAlign: 'center', marginTop: 32, color: 'white' }}>No conversations found.</Text> : null}
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
        <FriendshipModal
          friendships={friendshipData || []}
          isModalVisible={pageState[0].isModalFriendshipVisible}
          onDismiss={() => pageState[1]({ ...pageState[0], isModalFriendshipVisible: false })}
          onClickFriendListItem={(friend) => router.push({ pathname: '/profile/[id]', params: { id: friend.id } })}
        />
      </AppSafeArea>
    </>
  );
}
