import {combineReducers} from 'redux';
import authReducer from './auth/authReducer';
import orderReducer from './order/orderReducer';

import userReducer from './user/userReducer';

const rootReducer = combineReducers({
  auth: authReducer,

  user: userReducer,
  order: orderReducer,
});
export default rootReducer;
