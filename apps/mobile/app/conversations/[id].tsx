import AppSafeArea from '@/components/AppSafeArea';
import BubbleChat from '@/components/chat/bubble';
import Spacer from '@/components/Spacer';
import StackWrapper from '@/components/StackWrapper';
import { getConversationById, postConversation } from '@/services/conversation';
import { useConversationQuery, useMutationConversationQuery } from '@/services/hooks/conversationQuery';
import { queryClient } from '@/services/queryClient';
import { useAuthStore } from '@/store/auth';
import { useMessageStore } from '@/store/message';
import { ConversationPublic, ConversationRequest, messageSchema, WsEventName } from '@messanger/types';
import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useRef } from 'react'
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, RefreshControl, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { IconButton, Text, TextInput as TextInputPaper } from 'react-native-paper';

export default function ConversationDetail() {
    const params = useLocalSearchParams();
    const interlocutorId = params.id as string | undefined;
    const { data, isLoading, refetch, isRefetching } = useConversationQuery(interlocutorId);
    const { mutate: sendMessage, isPending, error } = useMutationConversationQuery();
    const { user, token } = useAuthStore.getState();

    const pageState = React.useState({
        generalError: '',
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

        sendMessage(validated.data, {
            onSuccess: (data) => {
                useMessageStore.getState().addMessage(data);
                queryClient.setQueryData(['conversation', interlocutorId], (old: any) => ({
                    ...old,
                    items: [...(old?.items ?? []), data]
                }));
                pageState[1]({
                    ...pageState[0],
                    message: { ...pageState[0].message, content: '' }
                });
                getUptoDateConversation();
                refetch();
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
        const ws = new WebSocket(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}/topic?conversations=${interlocutorId}`);
        const authReceiver = { event: WsEventName.Authentication, data: { token: token } };

        try {
            ws.onopen = () => {
                console.log("WebSocket connection opened");
                ws.send(JSON.stringify(authReceiver));
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                useMessageStore.getState().addMessage(message);
                queryClient.setQueryData(['conversation', interlocutorId], (old: any) => ({
                    ...old,
                    items: [...(old?.items ?? []), message]
                }));
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            ws.onclose = () => {
                console.log("WebSocket connection closed");
            };

        } catch (error) {
            console.error("WebSocket error:", error);
        }
        return () => ws.close();
    }

    React.useEffect(() => {
        refetch();
    }, [interlocutorId]);

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
                flexDirection='column'
                justifyContent='flex-start'
            >
                <Stack.Screen
                    options={{
                        header: () => (
                            <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 16 }}>
                                Conversation Details
                            </Text>
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
                />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                            style={{ minWidth: '85%' }}
                            mode="outlined"
                            multiline
                            numberOfLines={4}
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
        </KeyboardAvoidingView>
    )
}