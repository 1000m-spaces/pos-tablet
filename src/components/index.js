// export {Splash} from './Splash/Splash'; cách này xuất ra named export Splash trực tiếp
// từ file Splash.js nằm trong thư mục Splash
// thì bạn có thể import Splash từ đường dẫn import Splash from 'components/Splash';
// mà không cần phải chỉ định đường dẫn đầy đủ tới Splash component

import Splash from './Splash/Splash'; //xuất ra named export Splash từ module hiện tại
import Main from './Main/Main';
import Home from './Home/Home';
import Login from './Login/Login';
import VerifyCode from './VerifyCode/VerifyCode';
import Orders from './Order/Orders';
export { Splash, Main, Home, Login, VerifyCode, Orders };