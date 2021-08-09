import {
  IS_ADMIN_ERROR,
  IS_ADMIN_LOADED,
  IS_ADMIN_LOADING,
} from "../actions/userActions";

const initialState = {
  isAdmin: false,
  isLoading: false,
};

const userReducer = (state = initialState, action: any): any => {
  switch (action.type) {
    case IS_ADMIN_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case IS_ADMIN_LOADED:
      return {
        ...state,
        isLoading: false,
        isAdmin: action.payload,
      };
    case IS_ADMIN_ERROR:
      return {
        ...state,
        isLoading: false,
        isAdmin: false,
      };
    default:
      return state;
  }
};

export default userReducer;
