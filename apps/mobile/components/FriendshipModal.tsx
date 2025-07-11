import { FriendshipList } from "@messanger/types"
import { List, Modal } from "react-native-paper"
import React from "react";
import { useAuthStore } from "@/store/auth";
import { useFriendshipQuery, useMutationFriendshipQuery } from "@/services/queries/conversations-query copy";
import { FlatList } from "react-native";

type FriendshipModalProps = {
    isModalVisible: boolean,
    onDismiss?: () => void,
    onRequestFriendship?: (friendship: FriendshipList) => void,
}
export default function FriendshipModal({ isModalVisible, onDismiss, onRequestFriendship }: FriendshipModalProps) {
    const { user } = useAuthStore();
    const [queryParams, setQueryParams] = React.useState({
        search: '',
        page: 1,
        limit: 20,
    });

    const { data, isLoading, refetch, isRefetching } = useFriendshipQuery(queryParams);
    const { mutate, isPending, error } = useMutationFriendshipQuery(Array.isArray(data) ? data[0]?.id : '');
    return (
        <Modal visible={isModalVisible} onDismiss={onDismiss}>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.friend.username}
                        onPress={() => onRequestFriendship?.(item)}
                    />
                )}
                ListEmptyComponent={isLoading || data?.length === 0 ? <List.Item title="No friendships found." /> : null}
                refreshing={isRefetching}
                onRefresh={refetch}
                contentContainerStyle={{ flexGrow: 1 }}

            />
        </Modal>
    )
}