import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { LogoFallback } from './LogoFallback';

interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ width = 120, height = 100 }) => {
  try {
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={width} height={height} viewBox="0 0 300 250">
          <G>
            {/* Main navy blue eagle/wings shape */}
            <Path
              d="M150 40 C140 30, 120 35, 110 50 C90 40, 60 50, 40 80 C30 100, 35 120, 50 140 C70 160, 100 170, 130 175 C140 177, 150 180, 150 180 C150 180, 160 177, 170 175 C200 170, 230 160, 250 140 C265 120, 270 100, 260 80 C240 50, 210 40, 190 50 C180 35, 160 30, 150 40 Z"
              fill="#1a2951"
            />
            
            {/* Orange accent wings */}
            <Path
              d="M150 60 C145 55, 130 58, 125 65 C110 58, 85 65, 70 85 C65 95, 68 105, 75 120 C85 135, 105 142, 125 145 C135 147, 145 148, 150 150 C155 148, 165 147, 175 145 C195 142, 215 135, 225 120 C232 105, 235 95, 230 85 C215 65, 190 58, 175 65 C170 58, 155 55, 150 60 Z"
              fill="#ff9500"
            />
            
            {/* White/light accent */}
            <Path
              d="M150 80 C147 78, 140 79, 138 82 C130 79, 115 82, 105 92 C102 97, 103 102, 107 110 C112 118, 122 122, 132 124 C137 125, 142 126, 150 127 C158 126, 163 125, 168 124 C178 122, 188 118, 193 110 C197 102, 198 97, 195 92 C185 82, 170 79, 162 82 C160 79, 153 78, 150 80 Z"
              fill="#ffffff"
            />
            
            {/* Center anchor/triangle element */}
            <Path
              d="M150 90 L155 110 L150 125 L145 110 Z"
              fill="#1a2951"
            />
            
            {/* Bottom chevron elements */}
            <Path
              d="M120 140 L150 155 L180 140 L170 150 L150 165 L130 150 Z"
              fill="#ff9500"
            />
          </G>
        </Svg>
      </View>
    );
  } catch (error) {
    // Fallback to text-based logo if SVG fails
    return <LogoFallback width={width} height={height} />;
  }
};