import {fork} from 'redux-saga/effects';
import authSaga from './auth/authSaga';

import userSaga from './user/userSaga';
import orderSaga from './order/orderSaga';

const saga = function* () {
  yield fork(authSaga);
  yield fork(userSaga);
  yield fork(orderSaga);
};
export default saga;
