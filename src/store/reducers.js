import {combineReducers} from 'redux';
import authReducer from './auth/authReducer';
import orderReducer from './order/orderReducer';

import userReducer from './user/userReducer';
import productReducer from './products/productReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  user: userReducer,
  order: orderReducer,
});
export default rootReducer;
