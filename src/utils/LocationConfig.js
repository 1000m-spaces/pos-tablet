import RNSettings from 'react-native-settings';
import {PermissionsAndroid, Alert, Linking} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {getDistance} from 'geolib';
import {versionSystem, isAndroid} from 'assets/constans';

export const checkEnableLocation = async callback => {
  RNSettings.getSetting(RNSettings.LOCATION_SETTING).then(async result => {
    if (result === RNSettings.ENABLED) {
      try {
        if (isAndroid) {
          const result = PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          let verAndroid = versionSystem.split('.');
          let verCurrent = Number(verAndroid[0]);
          if (result === PermissionsAndroid.RESULTS.GRANTED || verCurrent < 6) {
            getLocation(callback);
          } else {
            try {
              let configPopupLocation = {
                title: 'Bật GPS',
                message:
                  'Chúng tôi cần sử dụng GPS để tìm kiếm địa chỉ NeoCafe gần bạn nhất',
                buttonPositive: 'OK',
              };
              const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                configPopupLocation,
              );
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                getLocation(callback);
              } else {
                // getLocation(null);
                // console.log("You don't have access for the location");
                callback('Denied');
              }
            } catch (err) {
              callback(null);
              //console.log("android err get location", err);
            }
          }
        } else {
          getLocation(callback);
        }
      } catch (err) {
        console.log('err get location', err);
        callback(null);
      }
    } else {
      //console.log("gps is not enabled");
      callback(null);
    }
  });
};

const getLocation = callback => {
  Geolocation.getCurrentPosition(
    //Lấy đc vị trí qua enable location
    position => {
      let data_position = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      // console.log('vi tri hien tai', data_position);

      return callback(data_position);
    },
    //ko lấy đc thì yêu cầu bật lại định vị
    error => {
      // console.log('error while get location', error);
      if (
        error?.message === 'Location permission denied' ||
        error?.message === 'User denied access to location services.'
      ) {
        callback('Denied');
      } else {
        callback(null);
      }
    },
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
  );
};

//Turn on GPS
export const turnOnLocation = async callback => {
  if (isAndroid) {
    const chckLocationPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    let versionAndroid = versionSystem.split('.');
    let versionCurrent = Number(versionAndroid[0]);
    if (
      chckLocationPermission === PermissionsAndroid.RESULTS.GRANTED ||
      versionCurrent < 6
    ) {
      getLocation(callback);
    } else {
      try {
        let configPopupLocation = {
          title: 'Bật GPS',
          message:
            'Chúng tôi cần sử dụng GPS để tìm kiếm địa chỉ NeoCafe gần bạn nhất',
          buttonPositive: 'OK',
        };
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          configPopupLocation,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          //console.log("You've access for the location", granted);
          getLocation(callback);
        } else {
          if (
            granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
            granted === PermissionsAndroid.RESULTS.DENIED
          ) {
            callback('Denied');
            setTimeout(() => {
              Alert.alert(
                'NeoCafe',
                'Quyền định vị không được cấp cho NeoCafe',
              );
            }, 250);
          }
          //console.log("You don't have access for the location");
          callback(null);
        }
      } catch (err) {
        callback(null);
        //console.log("android err get location", err);
      }
    }
  } else {
    Linking.openURL('app-settings:');
    Geolocation.requestAuthorization('always')
      .then(() => {
        getLocation(callback);
      })
      .catch(error => {
        console.log('requestAuthorization', error);
      });
  }
};

export const getDistanceForRests = (locale, shopPosition) => {
  return getDistance(locale, shopPosition, 100);
};
