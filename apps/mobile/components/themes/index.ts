import {
    DarkTheme as NavigationDark,
    DefaultTheme as NavigationLight,
} from '@react-navigation/native';
import {
    MD3DarkTheme as PaperDark,
    MD3LightTheme as PaperLight,
} from 'react-native-paper';
import { appColors } from './colors';


export const rnPaperTheme = {
    light: {
        ...NavigationLight,
        ...PaperLight,
        colors: {
            ...NavigationLight.colors,
            ...PaperLight.colors,
            text: '#111B21',
            background: appColors.BackgroundLight,
            primary: appColors.Green,
            accent: appColors.Teal,
            bubble: appColors.BubbleLight,
            header: appColors.HeaderLight,
            link: appColors.Blue,
        },
    },
    dark: {
        ...NavigationDark,
        ...PaperDark,
        colors: {
            ...NavigationDark.colors,
            ...PaperDark.colors,
            text: '#E9EDEF',
            background: appColors.BackgroundDark,
            primary: appColors.Green,
            accent: appColors.Teal,
            bubble: appColors.BubbleDark,
            header: appColors.HeaderDark,
            link: appColors.Blue,
        },
    },
};

export const rnNavigationTheme = {
    light: {
        text: '#111B21',
        background: appColors.BackgroundLight,
        tint: appColors.Green,
        tabIconDefault: '#bdbdbd',
        tabIconSelected: appColors.Green,
        bubble: appColors.BubbleLight,
        accent: appColors.Teal,
        link: appColors.Blue,
    },
    dark: {
        text: '#E9EDEF',
        background: appColors.BackgroundDark,
        tint: appColors.Green,
        tabIconDefault: '#bdbdbd',
        tabIconSelected: appColors.Green,
        bubble: appColors.BubbleDark,
        accent: appColors.Teal,
        link: appColors.Blue,
    },
};