

import { UserPublic } from '@messanger/types'
import React from 'react'
import { List } from 'react-native-paper'

type SenderProps = {
    sender: UserPublic
}

export default function Sender({ sender }: SenderProps) {
    return (
        <List.Item
            title={sender.username}
            description={`ID: ${sender.id}`}
        />
    )
}
