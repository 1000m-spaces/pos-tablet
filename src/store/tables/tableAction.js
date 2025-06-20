import { NEOCAFE } from 'store/actionsTypes';

export const getShopTablesAction = payload => ({
    type: NEOCAFE.GET_SHOP_TABLES_REQUEST,
    payload,
});

export const resetShopTablesAction = () => ({
    type: NEOCAFE.GET_SHOP_TABLES_RESET,
}); 