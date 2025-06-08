import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { MessagePublic } from '@messanger/types';
import { getMessages } from '@/services/message';
import { Divider, Text } from 'react-native-paper';
import AppSafeArea from '@/components/AppSafeArea';
import BubbleChat from '@/components/chat/bubble';
import ConversationListItem from '@/components/chat/conversation-list-item';
import { useRouter } from 'expo-router';

/* 

UserProfilePulic type
export type UserPublic = {
  id: string;
  username: string;
  profil:{
    avatar: string;
    fullName: string; // first and last name
  }
}
{
  "id": "1",
  "content": "Welcome to the messaging app!",
  "createdAt": "2023-10-01T12:00:00Z",
  "sender" : {
    "id": "system",
    "username": "System Bot",
    "profil": {
      "avatar": "https://example.com/avatar.png",
      "fullName": "System Bot"
    }
  },
  "isDeletedBySender": false

}

*/
const defaultMessages: MessagePublic[] = [
  {
    id: '1',
    content: 'Welcome to the messaging app!',
    createdAt: new Date(),
    sender: {
      id: '1',
      createdAt: new Date(),
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
      user: {
        id: '1',
        username: 'JohnDoe',
        deletedAt: null,
        isDeleted: false,
        email: 'johndoe@example.com',
        isActive: true
      }
    },
    isDeletedBySender: false,
    receiver: {
      id: '2',
      createdAt: new Date(),
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
      user: {
        id: '2',
        username: 'JaneDoe',
        deletedAt: null,
        isDeleted: false,
        email: 'janedoe@example.com',
        isActive: true
      }
    },
    isDeletedByReceiver: false
  }
];

export default function TabOneScreen() {
  const router = useRouter();
  const pageState = React.useState({
    isLoading: false,
    showPassword: false,
    disableButtonSubmit: false,
    generalError: '',
    messages: [] as MessagePublic[],
  });

  const fetchMessages = async () => {
    pageState[1]({
      ...pageState[0],
      isLoading: true,
    });
    try {
      const response = await getMessages();
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

  useEffect(() => {
    fetchMessages();
  }, []);


  return (
    <AppSafeArea loading={pageState[0].isLoading} errorMessage='Failed to load messages' onDismissError={() => pageState[1]({ ...pageState[0], generalError: '', messages: defaultMessages })}>
      {
        pageState[0].messages.map((msg) => (
          <>
            <ConversationListItem
              key={msg.id}
              sender={msg.sender}
              onPress={() => router.push({ pathname: "/(tabs)/[messageid]", params: { messageid: msg.id } })}
              message={msg.content}
              createdAt={new Date(msg.createdAt)}
            // You can add more props as needed
            />
            <Divider style={{ marginVertical: 12 }} />
          </>
        ))
      }
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  messageItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
