import Status from 'common/Status/Status';
import strings from 'localization/Localization';
import {NEOCAFE} from 'store/actionsTypes';

const initialState = {
  productMenu: [],
  statusProductMenu: Status.DEFAULT,
  errorProductMenu: '',
};

export default (state = initialState, {type, payload}) => {
  switch (type) {
    // PRODUCT ALL SHOP
    case NEOCAFE.GET_MENU_REQUEST:
      return {
        ...state,
        statusProductMenu: Status.LOADING,
      };
    case NEOCAFE.GET_MENU_SUCCESS:
      let listPro = filterDuplicateProduct(payload.products);
      const filteredListCate =
        payload?.listCategory &&
        payload?.listCategory.filter(
          cate =>
            cate?.name_vi &&
            cate?.name_vi.toUpperCase() !== 'NẠP TIỀN' &&
            cate.name_vi !== 'Gói Vận Chuyển',
        );
      return {
        ...state,
        productMenu: mapCategoryProducts(filteredListCate, listPro),
        statusProductMenu: Status.SUCCESS,
      };
    case NEOCAFE.GET_MENU_ERROR:
      return {
        ...state,
        statusProductMenu: Status.ERROR,
      };
    case NEOCAFE.GET_MENU_RESET:
      return {
        ...state,
        statusProductMenu: Status.DEFAULT,
      };
    default:
      return state;
  }
};

const filterDuplicateProduct = product => {
  let setAllProduct = new Map(
    product
      .filter(pro => pro.prodid < 1000000000)
      .map(item => {
        return [item.prodid, item];
      }),
  );
  return Array.from(setAllProduct, ([_, val]) => val);
};

const convertArrayToMap = listProduct => {
  let mapListPro = new Map();
  listProduct.forEach(product => {
    mapListPro.set(`${product.prodid}`, product);
  });
  return mapListPro;
};

const mapCategoryProducts = (
  listCate,
  listProduct,
  topPurchased,
  recommendation,
) => {
  let result = [];
  const mapCate = new Map(
    listCate.map(item => {
      return [
        item.id,
        {
          id: item.id,
          name: strings.getLanguage() === 'vi' ? item.name_vi : item.name_en,
          products: [],
        },
      ];
    }),
  );

  listProduct.map(product => {
    if (product && product?.categoryid && mapCate.has(product?.categoryid)) {
      const tempCate = mapCate.get(product?.categoryid);
      product.categoryname = tempCate.name ? tempCate.name.toUpperCase() : '';
      product.quantity = 0;
      tempCate.products.push(product);
    }
  });
  let tempResult = Array.from(mapCate.values());
  result = tempResult.filter(item => item.products.length > 0);
  return result;
};
