import { fork } from 'redux-saga/effects';
import authSaga from './auth/authSaga';
import userSaga from './user/userSaga';
import orderSaga from './order/orderSaga';
import productSaga from './products/productSaga';
import tableSaga from './tables/tableSaga';
import paymentSaga from './payment/paymentSaga';
import syncSaga from './sync/syncSaga';

const saga = function* () {
  yield fork(authSaga);
  yield fork(userSaga);
  yield fork(orderSaga);
  yield fork(productSaga);
  yield fork(tableSaga);
  yield fork(paymentSaga);
  yield fork(syncSaga);
};
export default saga;
