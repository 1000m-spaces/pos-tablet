import React, {useEffect} from 'react';
import {useState} from 'react';
import {image_error} from 'assets/constans';
import RNImage from 'react-native-image-progress';
import {ActivityIndicator} from 'react-native';
import Colors from 'theme/Colors';

const Images = ({errorImage, style, styleContainer, ...props}) => {
  // console.log('itemCate image icon: ', props);
  const [source, setSource] = useState(
    props?.source?.uri === '' ? image_error : props?.source,
  );

  useEffect(() => {
    if (props?.source?.uri) {
      setSource({uri: props?.source?.uri});
    } else {
      if (props?.source?.uri === '') {
        setSource(image_error);
      } else {
        setSource(props.source);
      }
    }
  }, [props.source]);

  const indicator = () => {
    return <ActivityIndicator color={Colors.button2Color} size={'large'} />;
  };

  return (
    <RNImage
      {...props}
      indicator={indicator}
      source={source}
      style={[style, styleContainer]}
      imageStyle={style}
    />
  );
};

export default Images;
