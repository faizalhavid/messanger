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
import { useFindFriendshipQuery, useFriendshipQuery, useMutationFriendshipQuery } from '@/services/queries/friendship-query';
import FriendListItem from '@/components/ListItem/FriendListItem';

export default function FriendsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [queryParams, setQueryParams] = React.useState({
    search: '',
    page: 1,
    limit: 20,
  });

  const { data: friendshipData, isLoading: friendshipLoading, refetch: refetchFriendship, isRefetching: isFriendshipRefetching } = useFriendshipQuery(queryParams);
  const { data: findFriendshipData, isLoading: findFriendshipLoading, refetch: refetchFindFriendship, isRefetching: isFindFriendshipRefetching } = useFindFriendshipQuery(queryParams);
  const { mutate: sendFriendship, isPending: isFriendshipPending, error: errorFriendship } = useMutationFriendshipQuery(Array.isArray(friendshipData) ? friendshipData[0]?.id : '');

  const pageState = React.useState({
    isSpeedDialVisible: true,
    isSpeedDialExtended: true,
    isModalFriendshipVisible: false,
    generalError: '',
  });

  const findFriendshipAsFriendshipList = findFriendshipData?.map(friend => ({
    friend,
    currentStatus: null,
  })) as FriendshipList[];



  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Friends" />
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
      <AppSafeArea space={0} errorMessage={pageState[0].generalError} onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })} refreshing={isFriendshipRefetching} padding={{ top: 12, left: 0, right: 0 }}>
        <FlatList
          data={friendshipData || []}
          keyExtractor={(item: FriendshipList) => item.id || ''}
          style={{ backgroundColor: 'black', minHeight: '100%' }}
          renderItem={({ item }) => {
            return <FriendListItem friendship={item} onPress={(friend) => router.push({ pathname: '/profile/[id]', params: { id: friend.id } })} />;
          }}
          ItemSeparatorComponent={() => <Divider style={{ marginVertical: 12 }} />}
          refreshControl={<RefreshControl refreshing={isFriendshipPending} onRefresh={refetchFriendship} />}
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={(event) => {
            pageState[1]({
              ...pageState[0],
              isSpeedDialVisible: event.nativeEvent.contentOffset.y < 100,
            });
          }}
          ListEmptyComponent={
            !friendshipLoading && ((friendshipData ?? [])?.length === 0) ? (
              <Text style={{ textAlign: 'center', marginTop: 32, color: 'white' }}>
                You don’t have any friends.
              </Text>
            ) : null
          }

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
            refetchFindFriendship();
            pageState[1]({ ...pageState[0], isSpeedDialExtended: false, isModalFriendshipVisible: true });
            // router.push('/conversations/new');
          }}
        />
        <FriendshipModal
          friendships={findFriendshipAsFriendshipList}
          isLoading={findFriendshipLoading}
          isRefresh={isFindFriendshipRefetching}
          onRefresh={refetchFindFriendship}
          isModalVisible={pageState[0].isModalFriendshipVisible}
          onDismiss={() => pageState[1]({ ...pageState[0], isModalFriendshipVisible: false })}
          onClickFriendListItem={(friend) => {
            router.push({ pathname: '/profile/[id]', params: { id: friend.id } });
          }}
          onSearchFriend={(searchText) => {
            setQueryParams(prev => ({ ...prev, search: searchText }))
            console.log(`TEST ${searchText}-${queryParams.search}`)
          }}
        />
      </AppSafeArea>
    </>
  );
}
