import { combineReducers } from 'redux';
import authReducer from './auth/authReducer';
import orderReducer from './order/orderReducer';
import userReducer from './user/userReducer';
import productReducer from './products/productReducer';
import tableReducer from './tables/tableReducer';
import paymentReducer from './payment/paymentReducer';
import syncReducer from './sync/syncReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  user: userReducer,
  order: orderReducer,
  table: tableReducer,
  payment: paymentReducer,
  sync: syncReducer,
});
export default rootReducer;
