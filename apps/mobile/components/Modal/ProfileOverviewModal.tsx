import React from "react";
import { Image } from "react-native";
import { Modal, Text, Button, SegmentedButtons } from "react-native-paper";
import StackWrapper from "../StackWrapper";


type ProfileOverviewModalProps = {
    avatar: string;
    name: string;
    isVisible: boolean;
    customAction?: React.ReactNode;
    onClose: () => void;
};

export default function ProfileOverviewModal({ avatar, name, isVisible, customAction, onClose }: ProfileOverviewModalProps) {
    const [value, setValue] = React.useState('');
    return (
        <Modal visible={isVisible} onDismiss={onClose} contentContainerStyle={{ backgroundColor: 'gray', padding: 20, margin: 40, borderRadius: 20 }}>
            <StackWrapper flexDirection="column" justifyContent="space-between" alignItems="center" style={{ backgroundImage: 'url(' + avatar + ')', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', minHeight: 200 }}>
                <Text>{name}</Text>
                <Text>{customAction}</Text>
                <SegmentedButtons
                    value={value}
                    onValueChange={setValue}
                    buttons={[
                        {
                            value: 'add-friend',
                            label: 'Add',
                        },
                        {
                            value: 'report',
                            label: 'Report',
                        },
                        { value: 'detail', label: 'Details' },
                    ]}
                />
            </StackWrapper>
        </Modal>
    );
}