export const productMenuSelector = state => state.product.productMenu;
export const statusMenuSelector = state => state.product.statusProductMenu;
export const errorMenuSelector = state => state.product.errorProductMenu;
export const productSelector = state => state.product.currentProduct;

export const productDetailSelector = state => state.product.productDetail;
export const statusProductDetailSelector = state => state.product.statusProductDetail;
export const errorProductDetailSelector = state => state.product.errorProductDetail;

export const vouchersSelector = state => state.product.vouchers;
export const statusGetVoucherSelector = state => state.product.statusGetVoucher;
