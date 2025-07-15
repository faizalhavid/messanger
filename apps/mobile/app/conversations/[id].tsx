import React from 'react';
import { encryptionData } from '@utils/crypto';
import AppSafeArea from '@/components/AppSafeArea';
import ConversationBubleChat from '@/components/ConversationBubble';
import Spacer from '@/components/Spacer';
import StackWrapper from '@/components/StackWrapper';
import { appColors } from '@/components/themes/colors';
import { useConversationsQuery, useMutationConversationQuery } from '@/services/queries/conversations-query';
import { useAuthStore } from '@/store/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { ConversationPublic, ConversationRequest, conversationThreadSchema, WsEventName } from '@messanger/types';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Button, FlatList, Keyboard, KeyboardAvoidingView, Platform, RefreshControl, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { Avatar, Divider, IconButton, Menu, Text, TextInput as TextInputPaper } from 'react-native-paper';
import { getDataFromLocalStorage } from '@/utils/local-storage';

export default function ConversationDetail() {
  const params = useLocalSearchParams();
  const threadId = params?.id as string | undefined;
  const [privKey, setPrivKey] = React.useState<string | null>(null);

  const { user } = useAuthStore();
  React.useEffect(() => {
    getDataFromLocalStorage('privateKey').then(setPrivKey);
  }, []);

  const { data, isLoading, refetch, isRefetching } = useConversationsQuery(threadId!, privKey ?? '');
  const { mutate: sendMessage, isPending, error } = useMutationConversationQuery(threadId!);
  const pageState = React.useState({
    generalError: '',
    openUpMenuHeader: false,
    message: {} as unknown as ConversationRequest,
  });

  const handlePostMessage = async () => {
    const payload: ConversationRequest = {
      senderId: user?.id ?? '',
      content: pageState[0].message.content,
      threadId: threadId ?? '',
    };
    const validated = conversationThreadSchema.safeParse(payload);

    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      pageState[1]({
        ...pageState[0],
        generalError: errors.content?.join(', ') || 'Invalid message content',
      });
      return;
    }
    const encryptedMessage = await encryptionData(user?.pubKey ?? '', validated.data.content);
    validated.data.content = encryptedMessage;
    sendMessage(validated.data as ConversationRequest, {
      onSuccess: (data) => {
        console.log('Message sent successfully', data);
        // queryClient.invalidateQueries({ queryKey: conversationKeys.detail(interlocutorId!) });
        pageState[1]({
          ...pageState[0],
          message: { ...pageState[0].message, content: '' },
        });
      },
      onError: (error: any) => {
        pageState[1]({
          ...pageState[0],
          generalError: error?.message || 'Failed to send message',
        });
      },
    });
  };
  return (
    // Todo : Fix the textinput changes after keyboard dismiss
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <AppSafeArea loading={isLoading} errorMessage={pageState[0].generalError} onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })} refreshing={isRefetching} padding={{ top: 35 }}>
        <Stack.Screen
          options={{
            headerTransparent: true,
            contentStyle: { paddingTop: 50 },
            headerBackground: () => <View style={{ backgroundColor: appColors.Green, height: 80 }} />,
            header: () => (
              <StackWrapper
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  marginVertical: 40,
                  backgroundColor: appColors.Green,
                }}
              >
                <StackWrapper flexDirection="row" alignItems="center" space={10}>
                  <Avatar.Image
                    size={40}
                    source={{
                      uri: data?.[0]?.receiver?.avatar || 'https://via.placeholder.com/150',
                    }}
                  />
                  <Text>
                    {data?.[0]?.receiver?.firstName} {data?.[0]?.receiver?.lastName}
                  </Text>
                </StackWrapper>
                <Menu visible={pageState[0].openUpMenuHeader} onDismiss={() => pageState[1]({ ...pageState[0], openUpMenuHeader: false })} anchor={<IconButton icon={() => <MaterialIcons name="more-vert" size={24} color="black" />} onPress={() => pageState[1]({ ...pageState[0], openUpMenuHeader: true })} />}>
                  <Menu.Item onPress={() => { }} title="Item 1" />
                  <Menu.Item onPress={() => { }} title="Item 2" />
                  <Divider />
                  <Menu.Item onPress={() => { }} title="Item 3" />
                </Menu>
              </StackWrapper>
            ),
          }}
        />

        <FlatList data={data ?? []} style={{ height: '90%' }} keyExtractor={(item, idx) => item?.id ?? `temp-${idx}`} renderItem={({ item }) => <ConversationBubleChat message={item} authenticatedUser={user ?? undefined} />} ItemSeparatorComponent={() => <Spacer size={{ height: 8 }} />} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />} inverted />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <StackWrapper
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
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
                  },
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
                  },
                });
              }}
              style={{ alignSelf: 'flex-end', marginRight: 16 }}
            />
          </StackWrapper>
        </TouchableWithoutFeedback>
      </AppSafeArea>
    </KeyboardAvoidingView>
  );
}
