import axios from "axios";

export const IS_ADMIN_ERROR = "IS_ADMIN_ERROR";
export const IS_ADMIN_LOADED = "IS_ADMIN_LOADED";
export const IS_ADMIN_LOADING = "IS_ADMIN_LOADING";

// Check token & load user
export const checkIfUserIsAdmin =
  () =>
  (dispatch: any): void => {
    // User loading
    dispatch(setUserTypeLoading());

    axios
      .get("/api/users/is-admin")
      .then((res) =>
        dispatch({
          type: IS_ADMIN_LOADED,
          payload: res.data,
        })
      )
      .catch((err) => {
        console.log(err);
        dispatch({
          type: IS_ADMIN_ERROR,
        });
      });
  };

export const setUserTypeLoading = (): Record<string, string> => {
  return {
    type: IS_ADMIN_LOADING,
  };
};
