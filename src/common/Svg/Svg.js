import React from 'react';

import icons_svg from 'assets/iconsSvg/index';
const Svg = ({name, color, size, width, height, ...props}) => {
  const Svgg = icons_svg[name];

  if (!Svgg) {
    throw `Icon ${name} not found`;
  }

  return (
    <Svgg
      fill={color}
      width={size || width}
      height={size || height}
      {...props}
    />
  );
};

export default Svg;
