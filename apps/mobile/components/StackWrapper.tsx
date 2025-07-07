import React from 'react';
import { View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  flexDirection?: 'row' | 'column';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  space?: number;
  wrap?: boolean;
};

export default function StackWrapper(props: Props) {
  const { children, style, flexDirection = 'column', alignItems = 'stretch', justifyContent = 'flex-start', space = 0, wrap = false } = props;

  // Add spacing between children if space > 0
  const childrenArray = React.Children.toArray(children);
  const spacedChildren = space
    ? childrenArray.map((child, idx) => {
        if (idx === 0) return child;

        if (space < 0) {
          return (
            <React.Fragment key={idx}>
              <View style={flexDirection === 'row' ? { marginRight: -space } : { marginBottom: -space }} />
              {child}
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={idx}>
            <View style={flexDirection === 'row' ? { marginLeft: space } : { marginTop: space }} />
            {child}
          </React.Fragment>
        );
      })
    : childrenArray;

  return (
    <View
      style={{
        ...style,

        flexDirection,
        alignItems,
        justifyContent,
        flexWrap: wrap ? 'wrap' : 'nowrap',
      }}
    >
      {spacedChildren}
    </View>
  );
}
