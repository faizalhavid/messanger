import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import StackWrapper from './StackWrapper';
import { UserProfileThread } from '@messanger/types';

export default function ParticipantsAvatar({ participants, size = 20 }: { participants: UserProfileThread[], size?: number }) {
  const maxVisible = 5;
  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = participants.length - maxVisible;

  return (
    <StackWrapper flexDirection='row' alignItems='center' style={{ position: 'relative' }}>
      {visibleParticipants.map((participant, index) => {
        // Kalau ini avatar terakhir DAN masih ada sisa
        const isLastVisible = index === maxVisible - 1 && remainingCount > 0;

        if (isLastVisible) {
          return (
            <Avatar.Text
              key={`more-${participant.id}`}
              size={size}
              label={`+${remainingCount}`}
              style={[
                {
                  backgroundColor: '#ccc',
                  borderWidth: 1,
                  borderColor: '#fff',
                },
                index !== 0 && { marginLeft: -12 },
              ]}
              labelStyle={{ fontSize: size * 0.5 }}
            />
          );
        }

        return (
          <Avatar.Image
            key={participant.id}
            size={size}
            source={
              participant.avatar
                ? { uri: participant.avatar }
                : { uri: 'https://via.placeholder.com/40' }
            }
            style={[
              {
                borderWidth: 1,
                borderColor: '#fff',
              },
              index !== 0 && { marginLeft: -12 },
            ]}
          />
        );
      })}
    </StackWrapper>
  );
}
