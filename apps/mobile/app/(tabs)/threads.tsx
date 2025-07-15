import { FlatList, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Appbar, Divider, Searchbar, Text } from 'react-native-paper';
import AppSafeArea from '@/components/AppSafeArea';
import { useRouter } from 'expo-router';
import { FriendshipList, QueryParamsData, ThreadList, ThreadPublic } from '@messanger/types';
import { useAuthStore } from '@/store/auth';
import SpeedDial from '@/components/SpeedDial';
import { useMutationThreadQuery, useThreadQuery } from '@/services/queries/threads-query';
import ThreadListItem from '@/components/ListItem/ThreadListItem';
import FriendshipModal from '@/components/Modal/FriendshipModal';
import { useFriendshipQuery, useMutationFriendshipQuery } from '@/services/queries/friendship-query';
import ProfileOverviewModal from '@/components/Modal/ProfileOverviewModal';

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

  const [pageState, setPageState] = React.useState({
    isSpeedDialVisible: true,
    isSpeedDialExtended: true,
    isModalFriendshipVisible: false,
    isModalProfileOverviewVisible: false,
    isSearchBarExpended: false,
    generalError: '',
    selectedThread: {} as ThreadList,
  });

  const searchRef = useRef<TextInput>(null);

  console.log(threadData)


  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Messages" />
        {pageState.isSearchBarExpended ? (
          <Searchbar
            ref={searchRef}
            showDivider
            style={{ padding: 0 }}
            value={queryParams.thread.search ?? ''}
            placeholder="Search"
            onChangeText={(text) =>
              setQueryParams({
                ...queryParams,
                thread: { ...queryParams.thread, search: text },
              })
            }
            loading={threadLoading}
            onBlur={() => {
              setPageState({ ...pageState, isSearchBarExpended: false });
            }}
            autoFocus
          />
        ) : (
          <Appbar.Action
            icon="magnify"
            onPress={() => {
              setPageState({ ...pageState, isSearchBarExpended: true });
            }}
          />
        )}

        <Appbar.Action
          icon="dots-vertical"
          onPress={() => {
            console.log('Open menu');
            setPageState({ ...pageState, isSpeedDialVisible: !pageState.isSpeedDialVisible });

          }}
        />
      </Appbar.Header>
      <AppSafeArea space={0} errorMessage={pageState.generalError} onDismissError={() => setPageState({ ...pageState, generalError: '' })} refreshing={isThreadRefetching} padding={{ top: 12, left: 0, right: 0 }}>
        <FlatList
          data={threadData}
          keyExtractor={(item: ThreadList) => item.id || ''}
          style={{ backgroundColor: 'black', minHeight: '100%' }}
          renderItem={({ item }) => {
            return (
              <ThreadListItem
                thread={item}
                onPress={() => {
                  console.log('Selected conversation', item);
                  if (item.id) {
                    router.push({ pathname: '/conversations/[id]', params: { id: item.id } });
                  }
                }}
                onAvatarPress={(data) => {
                  setPageState({ ...pageState, isModalProfileOverviewVisible: true, selectedThread: data ?? null });
                }}

              />
            );
          }}
          ItemSeparatorComponent={() => <Divider style={{ marginVertical: 12 }} />}
          refreshControl={<RefreshControl refreshing={isThreadRefetching} onRefresh={refetchThread} />}
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={(event) => {
            setPageState({
              ...pageState,
              isSpeedDialExtended: event.nativeEvent.contentOffset.y > 100,
            })
          }}
          ListEmptyComponent={threadLoading || threadData?.length === 0 ? <Text style={{ textAlign: 'center', marginTop: 32, color: 'white' }}>No conversations found.</Text> : null}
        />
        <SpeedDial
          visible={pageState.isSpeedDialVisible}
          extended={pageState.isSpeedDialExtended}
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
            setPageState({ ...pageState, isSpeedDialExtended: false, isModalFriendshipVisible: true });
            // router.push('/conversations/new');
          }}
        />
        <FriendshipModal
          friendships={friendshipData || []}
          isModalVisible={pageState.isModalFriendshipVisible}
          onDismiss={() => setPageState({ ...pageState, isModalFriendshipVisible: false })}
          onClickFriendListItem={(friend) => router.push({ pathname: '/profile/[id]', params: { id: friend.id } })}
        />
        <ProfileOverviewModal
          isVisible={pageState.isModalProfileOverviewVisible}
          avatar={pageState.selectedThread?.avatar ?? ''}
          name={pageState.selectedThread?.name ?? ''}
          onClose={() => setPageState({ ...pageState, isModalProfileOverviewVisible: false })}
        />
      </AppSafeArea>
    </>
  );
}
