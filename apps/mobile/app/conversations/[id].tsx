import AppSafeArea from '@/components/AppSafeArea';
import BubbleChat from '@/components/chat/bubble';
import Spacer from '@/components/Spacer';
import StackWrapper from '@/components/StackWrapper';
import { getConversationById } from '@/services/conversation';
import { ConversationPublic } from '@messanger/types';
import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useRef } from 'react'
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, RefreshControl, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { IconButton, Text, TextInput as TextInputPaper } from 'react-native-paper';

export default function ConversationDetail() {
    const params = useLocalSearchParams();
    const interlocutorsId = params.id as string | undefined;
    const inputRef = useRef<TextInput>(null);

    const pageState = React.useState({
        isLoading: false,
        refreshing: false,
        showPassword: false,
        disableButtonSubmit: false,
        generalError: '',
        messages: [] as ConversationPublic[],
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

    const retrieveMessages = async () => {
        pageState[1]({
            ...pageState[0],
            isLoading: true,
        });
        try {
            const response = await getConversationById(interlocutorsId ?? '');
            pageState[1]({
                ...pageState[0],
                isLoading: false,
                messages: response?.data?.items ?? [],
            });
        } catch (error) {
            pageState[1]({
                ...pageState[0],
                isLoading: false,
                generalError: error instanceof Error ? error.message : 'Failed to fetch messages',
            });
        }
    }

    React.useEffect(() => {
        retrieveMessages();
    }, [interlocutorsId]);

    return (
        // <AppSafeArea
        //     loading={pageState[0].isLoading}
        //     errorMessage={pageState[0].generalError}
        //     onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })}
        //     refreshing={pageState[0].refreshing}
        // >
        //     <Stack.Screen
        //         options={{
        //             header: () => (
        //                 <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 16 }}>
        //                     Conversation Details
        //                 </Text>
        //             ),
        //         }}
        //     />
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}

        >
            <FlatList
                data={pageState[0].messages}
                style={{ flex: 1 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <BubbleChat message={item} interlocutorsId={interlocutorsId} />
                )}
                ItemSeparatorComponent={() => <Spacer size={{ height: 8 }} />}
                refreshControl={
                    <RefreshControl
                        refreshing={pageState[0].refreshing}
                        onRefresh={retrieveMessages}
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
                        marginBottom: 16,
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
                            // Here you would typically send the message
                            console.log('Message sent:', pageState[0].message.content);
                            // Clear the input after sending
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
        </KeyboardAvoidingView>
        // </AppSafeArea>
    )
}