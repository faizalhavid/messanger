import React from 'react';
import { TextInput, HelperText, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

type Props = {
    label?: string;
    loading?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    style?: object;
    error?: boolean;
    errorText?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoComplete?: 'off' | 'username' | 'password' | 'email' | 'name' | 'tel';
    autoCorrect?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'number-pad';
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    disabled?: boolean;
    theme?: {
        colors?: {
            primary?: string;
            accent?: string;
            background?: string;
            surface?: string;
            text?: string;
            disabled?: string;
            placeholder?: string;
            backdrop?: string;
        };
    };
};

export default function AppTextInput({
    loading,
    prefix,
    suffix,
    error,
    errorText,
    style,
    ...rest
}: Props) {
    return (
        <View style={style}>
            <TextInput
                label={rest.label}
                mode="outlined"
                left={prefix ? <TextInput.Icon icon={() => prefix} /> : undefined}
                right={
                    loading
                        ? <TextInput.Icon icon={() => <ActivityIndicator size="small" />} />
                        : suffix
                            ? <TextInput.Icon icon={() => suffix} />
                            : undefined
                }
                error={error}
                {...rest}
            />
            {error && errorText ? (
                <HelperText type="error" visible={error}>
                    {errorText}
                </HelperText>
            ) : null}
        </View>
    );
}