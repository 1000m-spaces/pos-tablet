import {NEOCAFE} from 'store/actionsTypes';
import {takeLatest, call, put} from 'redux-saga/effects';
import ProductController from './productController';

function* getMenuSaga({payload}) {
  try {
    const result = yield call(ProductController.getProductMenu, payload);
    console.log('result saga get all product:', result);
    if (result.success) {
      yield put({
        type: NEOCAFE.GET_MENU_SUCCESS,
        payload: {
          products: result.products,
          categories: result.categories,
        },
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.GET_MENU_ERROR,
      payload: {
        errorMsg: error,
      },
    });
  }
}

export default function* watcherSaga() {
  yield takeLatest(NEOCAFE.GET_MENU_REQUEST, getMenuSaga);
}
