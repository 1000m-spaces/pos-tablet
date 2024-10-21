import {fork} from 'redux-saga/effects';
import authSaga from './auth/authSaga';

import userSaga from './user/userSaga';
import orderSaga from './order/orderSaga';
import productSaga from './products/productSaga';

const saga = function* () {
  yield fork(authSaga);
  yield fork(userSaga);
  yield fork(orderSaga);
  yield fork(productSaga);
};
export default saga;
