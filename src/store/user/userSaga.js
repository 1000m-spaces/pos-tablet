import {NEOCAFE} from 'store/actionsTypes';
import {takeLatest, call, put, select} from 'redux-saga/effects';
import UserController from './userController';
import {asyncStorage} from 'store/index';
import {isTokenConfirm} from '../auth/authSelector';

function* getDeleteAccount() {
  const currentUser = yield asyncStorage.getUser();
  console.log('USERRRRRRRRRRRRR:', currentUser);
  try {
    const result = yield call(
      UserController.deleteAccount,
      currentUser?.custid,
      currentUser?.session_key,
      currentUser?.custphone,
    );
    console.log('DELETE SAAAGAAAAAA:', result);
    if (result?.success && result?.data?.status === 1) {
      yield put({
        type: NEOCAFE.GET_DELETE_ACCOUNT_SUCCESS,
      });
    } else {
      yield put({
        type: NEOCAFE.GET_DELETE_ACCOUNT_ERROR,
        payload: {
          errorMsg: result?.data?.message,
        },
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.GET_DELETE_ACCOUNT_ERROR,
      payload: {
        errorMsg: 'Xảy ra lỗi trong quá trình xóa tài khoản',
      },
    });
  }
}
function* confirmDeleteAccountSaga({payload}) {
  const tokenConfirm = yield select(state => isTokenConfirm(state));
  console.log('tokenConfirm', tokenConfirm);
  const query = {
    otp_token: tokenConfirm,
    otp: payload.otp,
  };
  try {
    console.log('QUERRRRYYYYYYYY:', query);
    const result = yield call(UserController.confirmDeleteAccount, query);
    if (result.success === true) {
      yield put({
        type: NEOCAFE.CONFIRM_DELETE_OTP_SUCCESS,
      });
    } else {
      yield put({
        type: NEOCAFE.CONFIRM_DELETE_OTP_ERROR,
        payload: result.errorMessage,
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.CONFIRM_DELETE_OTP_ERROR,
      payload:
        'Xảy ra lỗi trong quá trình xác thực. Vui lòng liên hệ nhân viên phục vụ!',
    });
  }
}
function* updateUserSaga({payload}) {
  try {
    const result = yield call(UserController.updateUserInfo, payload);
    if (result.success === true) {
      yield put({
        type: NEOCAFE.UPDATE_USER_INFO_SUCCESS,
        payload: result.user,
      });
    } else {
      yield put({
        type: NEOCAFE.UPDATE_USER_INFO_ERROR,
        payload: result.message,
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.UPDATE_USER_INFO_ERROR,
      payload: error.message,
    });
  }
}

function* setLanguageSaga({payload}) {
  if (!payload) {
    return;
  }
  console.log('PAYLOAD CHANGE language:::', payload);
  try {
    const result = yield call(UserController.updateLanguage, payload);
    if (result.success) {
      yield put({
        type: NEOCAFE.SET_LANGUAGE_SUCCESS,
        payload: payload?.language,
      });
    } else {
      yield put({
        type: NEOCAFE.SET_LANGUAGE_ERROR,
        payload: result.message,
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.SET_LANGUAGE_ERROR,
      payload: error.message,
    });
  }
}

export default function* watcherSaga() {
  yield takeLatest(NEOCAFE.GET_DELETE_ACCOUNT_REQUEST, getDeleteAccount);
  yield takeLatest(
    NEOCAFE.CONFIRM_DELETE_OTP_REQUEST,
    confirmDeleteAccountSaga,
  );
  yield takeLatest(NEOCAFE.SET_LANGUAGE_REQUEST, setLanguageSaga)
  yield takeLatest(NEOCAFE.UPDATE_USER_INFO_REQUEST, updateUserSaga);
}
