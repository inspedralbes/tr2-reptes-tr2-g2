import React, { ReactNode } from 'react';
import { View, useWindowDimensions, ViewStyle } from 'react-native';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

export const ResponsiveContainer = ({ children, style = {} }: Props) => {
  const { width } = useWindowDimensions();
  
  const isLargeScreen = width > 1200;

  return (
    <View 
      style={{
        width: '100%',
        maxWidth: 1200,
        alignSelf: 'center',
        paddingHorizontal: isLargeScreen ? 0 : 16,
        ...style
      }}
    >
      {children}
    </View>
  );
};