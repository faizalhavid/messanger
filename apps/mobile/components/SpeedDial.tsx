import React from 'react';
import {
    StyleProp,
    ViewStyle,
    Animated,
    StyleSheet,
    Platform,
    I18nManager,
} from 'react-native';
import { AnimatedFAB } from 'react-native-paper';

type SpeedDialProps = {
    animatedValue?: Animated.Value;
    visible?: boolean;
    extended?: boolean;
    label?: string;
    animateFrom?: 'left' | 'right';
    style?: StyleProp<ViewStyle>;
    iconMode?: 'static' | 'dynamic';
    icon?: string;
    onPress?: () => void;
};

const SpeedDial: React.FC<SpeedDialProps> = ({
    animatedValue,
    visible = true,
    extended,
    label = 'Label',
    animateFrom = 'right',
    style,
    iconMode = 'static',
    icon = 'plus',
    onPress,
}) => {
    const [isExtended, setIsExtended] = React.useState(
        extended !== undefined ? extended : true
    );

    React.useEffect(() => {
        if (extended !== undefined) {
            setIsExtended(extended);
        }
    }, [extended]);

    const animateFromLeft =
        animateFrom === 'left' || (I18nManager.isRTL && animateFrom !== 'right');

    const fabStyle = { [animateFromLeft ? 'left' : 'right']: 16 };

    return (
        <AnimatedFAB
            icon={icon}
            label={label}
            extended={isExtended}
            onPress={onPress}
            visible={visible}
            animateFrom={animateFrom}
            iconMode={iconMode}
            style={[styles.fabStyle, style, fabStyle]}
        />
    );
};

export default SpeedDial;

const styles = StyleSheet.create({
    fabStyle: {
        bottom: 16,
        position: 'absolute',
    },
});
