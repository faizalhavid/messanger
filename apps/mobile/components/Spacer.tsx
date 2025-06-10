

import React from 'react'
import { View } from 'react-native'
type SpacerProps = {
    size?: {
        width?: number
        height?: number
    }
}
export default function Spacer({ size = { width: 0, height: 0 } }: { size?: SpacerProps['size'] }) {
    return (
        <View style={{ flex: 1, width: size.width, height: size.height }} />
    )
}
