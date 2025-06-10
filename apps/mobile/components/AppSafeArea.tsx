import React, { useEffect } from 'react';
import { SafeAreaView, View, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Alert } from 'react-native';

type PaddingType = number | { top?: number; bottom?: number; left?: number; right?: number; vertical?: number; horizontal?: number };

type Props = {
    loading?: boolean;
    header?: React.ReactNode;
    children?: React.ReactNode;
    flexDirection?: 'row' | 'column';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    padding?: PaddingType;
    refreshing?: boolean;
    scrollable?: boolean;
    style?: object;
    errorMessage?: string;
    onDismissError?: () => void;
    space?: number;
    automaticallyAdjustKeyboardInsets?: boolean;
    automaticallyAdjustContentInsets?: boolean;
};

export default function AppSafeArea({
    loading,
    header,
    children,
    flexDirection = 'column',
    alignItems = 'stretch',
    justifyContent = 'flex-start',
    padding = 25,
    refreshing = false,
    scrollable = false,
    style,
    errorMessage,
    space = 10,
    onDismissError,
}: Props) {
    const Container = scrollable ? ScrollView : View;
    useEffect(() => {
        if (errorMessage) {
            Alert.alert(
                'Error',
                errorMessage,
                [
                    {
                        text: 'OK',
                        onPress: onDismissError,
                    },
                ],
                { cancelable: true }
            );
        }
    }, [errorMessage, onDismissError]);

    const spacedChildren = space
        ? React.Children.toArray(children).map((child, idx, arr) => (
            <View key={idx} style={idx < arr.length - 1
                ? (flexDirection === 'row'
                    ? { marginRight: space }
                    : { marginBottom: space })
                : undefined}>
                {child}
            </View>
        ))
        : children;

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                typeof padding === 'number'
                    ? { padding }
                    : {
                        paddingTop: padding.top ?? padding.vertical ?? 0,
                        paddingBottom: padding.bottom ?? padding.vertical ?? 0,
                        paddingLeft: padding.left ?? padding.horizontal ?? 0,
                        paddingRight: padding.right ?? padding.horizontal ?? 0,
                    },
                style,
            ]}
        >

            {refreshing ? <ActivityIndicator color="#ffffff" /> : null}
            {header}
            <Container
                style={[
                    styles.content,
                    { flexDirection, alignItems, justifyContent }
                ]}
            >
                {spacedChildren}
            </Container>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#075E54" />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    content: { flex: 1 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});