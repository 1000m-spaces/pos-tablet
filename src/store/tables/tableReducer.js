import { NEOCAFE } from 'store/actionsTypes';

const initialState = {
    tables: [],
    loading: false,
    error: null,
};

const tableReducer = (state = initialState, action) => {
    switch (action.type) {
        case NEOCAFE.GET_SHOP_TABLES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case NEOCAFE.GET_SHOP_TABLES_SUCCESS:
            return {
                ...state,
                loading: false,
                tables: action.payload.tables,
                error: null,
            };
        case NEOCAFE.GET_SHOP_TABLES_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload.message || 'Failed to fetch tables',
            };
        case NEOCAFE.GET_SHOP_TABLES_RESET:
            return initialState;
        default:
            return state;
    }
};

export default tableReducer; 