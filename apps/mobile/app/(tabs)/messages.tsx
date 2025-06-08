import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { MessagePublic } from '@messanger/types';
import { getMessages } from '@/services/message';
import { Text } from 'react-native-paper';
import AppSafeArea from '@/components/AppSafeArea';
import BubbleChat from '@/components/chat/bubble';

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
      id: 'system',
      username: 'System Bot',
      profil: {
        avatar: 'https://example.com/avatar.png',
        fullName: 'System Bot'
      }
    },
    isDeletedBySender: false,
    receiver: {
      id: 'user1',
      username: 'User One',
      profil: {
        avatar: 'https://example.com/user1-avatar.png',
        fullName: 'User One'
      }
    },
    isDeletedByReceiver: false
  }
];

export default function TabOneScreen() {

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
          <BubbleChat key={msg.id} message={msg.content} isSent={true} sender={msg.sender} />
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
