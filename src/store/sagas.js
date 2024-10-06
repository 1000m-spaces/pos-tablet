import {fork} from 'redux-saga/effects';
import authSaga from './auth/authSaga';

import userSaga from './user/userSaga';

const saga = function* () {
  yield fork(authSaga);
  yield fork(userSaga);
};
export default saga;
