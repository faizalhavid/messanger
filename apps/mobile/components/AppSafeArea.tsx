import React, { useEffect } from 'react';
import { SafeAreaView, View, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Alert } from 'react-native';

type Props = {
    loading?: boolean;
    header?: React.ReactNode;
    children?: React.ReactNode;
    flexDirection?: 'row' | 'column';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    padding?: number;
    onRefresh?: () => void;
    refreshing?: boolean;
    scrollable?: boolean;
    style?: object;
    errorMessage?: string;
    onDismissError?: () => void;
};

export default function AppSafeArea({
    loading,
    header,
    children,
    flexDirection = 'column',
    alignItems = 'stretch',
    justifyContent = 'flex-start',
    padding = 20,
    onRefresh,
    refreshing = false,
    scrollable = false,
    style,
    errorMessage,
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

    return (
        <SafeAreaView style={[styles.safeArea, { padding }, style]}>
            {header}
            <Container
                style={[
                    styles.content,
                    { flexDirection, alignItems, justifyContent }
                ]}
                {...(scrollable && onRefresh
                    ? {
                        refreshControl: (
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        ),
                    }
                    : {})}
            >
                {children}
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