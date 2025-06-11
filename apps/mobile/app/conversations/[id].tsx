import AppSafeArea from '@/components/AppSafeArea';
import BubbleChat from '@/components/chat/bubble';
import Spacer from '@/components/Spacer';
import StackWrapper from '@/components/StackWrapper';
import { useWebSocket } from '@/providers/WebSocketConnection';
import { useConversationQuery, useMutationConversationQuery } from '@/services/hooks/conversationQuery';
import { queryClient } from '@/services/queryClient';
import { useAuthStore } from '@/store/auth';
import { useMessageStore } from '@/store/message';
import { MaterialIcons } from '@expo/vector-icons';
import { ConversationPublic, ConversationRequest, messageSchema, WsEventName } from '@messanger/types';
import { Stack, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Button, FlatList, Keyboard, KeyboardAvoidingView, Platform, RefreshControl, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { Avatar, Divider, IconButton, Menu, Text, TextInput as TextInputPaper } from 'react-native-paper';

export default function ConversationDetail() {
    const params = useLocalSearchParams();
    const ws = useWebSocket();
    const interlocutorId = params.id as string | undefined;
    const { data, isLoading, refetch, isRefetching } = useConversationQuery(interlocutorId);
    const { messages, setMessages, addMessage } = useMessageStore();
    const { mutate: sendMessage, isPending, error } = useMutationConversationQuery();


    const pageState = React.useState({
        generalError: '',
        openUpMenuHeader: false,
        message: {
            content: '',
            isRead: false,
            createdAt: new Date().toISOString(),
            sender: {
                id: '',
                firstName: '',
                lastName: '',
                avatar: ''
            },
        } as unknown as ConversationPublic,
    });
    const handlePostMessage = async () => {
        const payload: ConversationRequest = {
            content: pageState[0].message.content,
            receiverId: interlocutorId!,
        };
        const validated = messageSchema.safeParse(payload);

        if (!validated.success) {
            const errors = validated.error.flatten().fieldErrors;
            pageState[1]({
                ...pageState[0],
                generalError: errors.content?.join(', ') || 'Invalid message content',
            });
            return;
        }

        const optimisticMessage = {
            ...payload,
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            sender: {}, // Fill as needed
            isRead: false,
            receiver: {}
        } as unknown as ConversationPublic;

        addMessage(optimisticMessage);
        queryClient.setQueryData(['conversation', interlocutorId], (old: any) => ({
            ...old,
            items: [...(old?.items ?? []), optimisticMessage]
        }));

        sendMessage(validated.data, {
            onSuccess: (data) => {
                addMessage(data);
                queryClient.setQueryData(['conversation', interlocutorId], (old: any) => ({
                    ...old,
                    items: [...(old?.items ?? []), data]
                }));
                pageState[1]({
                    ...pageState[0],
                    message: { ...pageState[0].message, content: '' }
                });
            },
            onError: (error: any) => {
                pageState[1]({
                    ...pageState[0],
                    generalError: error?.message || 'Failed to send message',
                });
            }
        });
    }

    const getUptoDateConversation = () => {
        if (!ws) return;
        ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.event === WsEventName.ConversationCreated) {
                const message = payload.data;
                useMessageStore.getState().addMessage(message);
                queryClient.setQueryData(['conversation', interlocutorId], (old: any) => ({
                    ...old,
                    items: [...(old?.items ?? []), message]
                }));
            }
        };

        return () => {
            ws.onmessage = null;
        };
    }

    React.useEffect(() => {
        if (data?.data?.items) {
            setMessages(data.data.items);
        }
    }, [data, setMessages]);

    React.useEffect(() => {
        getUptoDateConversation();
    }, [ws]);

    return (
        // Todo : Fix the textinput changes after keyboard dismiss
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <AppSafeArea
                loading={isLoading}
                errorMessage={pageState[0].generalError}
                onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })}
                refreshing={isRefetching}
                padding={{ top: 35 }}
            >
                <Stack.Screen
                    options={{
                        headerTransparent: true,
                        contentStyle: { paddingTop: 50 },
                        headerBackground: () => <View style={{ backgroundColor: 'red', height: 80 }} />,
                        header: () => (
                            <StackWrapper flexDirection='row' alignItems='center' justifyContent='space-between' style={{
                                paddingHorizontal: 20, paddingVertical: 10, marginVertical: 40, backgroundColor: 'red'
                            }}>
                                <StackWrapper flexDirection='row' alignItems='center' space={10}>
                                    <Avatar.Image
                                        size={40}
                                        source={{
                                            uri: data?.data?.items[0].receiver.avatar || 'https://via.placeholder.com/150',
                                        }}
                                    />
                                    <Text >
                                        {data?.data?.items[0].receiver.firstName} {data?.data?.items[0].receiver.lastName}
                                    </Text>
                                </StackWrapper>
                                <Menu
                                    visible={pageState[0].openUpMenuHeader}
                                    onDismiss={() => pageState[1]({ ...pageState[0], openUpMenuHeader: false })}
                                    anchor={<IconButton icon={() => <MaterialIcons name="more-vert" size={24} color="black" />} onPress={() => pageState[1]({ ...pageState[0], openUpMenuHeader: true })} />
                                    }
                                >
                                    <Menu.Item onPress={() => { }} title="Item 1" />
                                    <Menu.Item onPress={() => { }} title="Item 2" />
                                    <Divider />
                                    <Menu.Item onPress={() => { }} title="Item 3" />
                                </Menu>
                            </StackWrapper>
                        ),
                    }}
                />

                <FlatList
                    data={data?.data?.items ?? []}
                    style={{ height: '90%' }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <BubbleChat message={item} interlocutorsId={interlocutorId} />
                    )}
                    ItemSeparatorComponent={() => <Spacer size={{ height: 8 }} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                        />
                    }
                    inverted
                />

                <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
                    <StackWrapper
                        flexDirection='row'
                        alignItems='center'
                        justifyContent='center'
                        style={{
                            justifyContent: 'space-around',
                        }}
                    >
                        <TextInputPaper
                            value={pageState[0].message.content}
                            label="Type a message"
                            placeholder="Enter your message"
                            style={{ minWidth: '75%' }}
                            mode="outlined"
                            textAlignVertical="top"
                            onChangeText={(text) => {
                                pageState[1]({
                                    ...pageState[0],
                                    message: {
                                        ...pageState[0].message,
                                        content: text,
                                    }
                                });
                            }}
                        />
                        <IconButton
                            icon="send"
                            size={24}
                            onPress={() => {
                                handlePostMessage();
                                pageState[1]({
                                    ...pageState[0],
                                    message: {
                                        ...pageState[0].message,
                                        content: '',
                                    }
                                });
                            }}
                            style={{ alignSelf: 'flex-end', marginRight: 16 }}
                        />
                    </StackWrapper>
                </TouchableWithoutFeedback>
            </AppSafeArea>
        </KeyboardAvoidingView >
    )
}