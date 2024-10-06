import React from 'react';
import getIconType from './IconType';

const Icons = ({type, name, color, size, ...props}) => {
  const IconComponent = getIconType(type);
  return <IconComponent size={size} color={color} {...props} name={name} />;
};

export default Icons;
