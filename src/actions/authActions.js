/*global chrome*/
import axios from "../defaults/axios_conf";
import {
  SIGNUP_SUCCESS,
  GET_ERRORS,
  SET_USER_DATA,
  SET_CODE_SNIPPET,
  SET_USER_VISIT_COUNT,
} from "./types";
import setAuthToken from "../utils/setAuthToken";
import { useSelector, useDispatch } from "react-redux";

export function emptyErrors() {
  return async (dispatch) => {
    dispatch({
      type: GET_ERRORS,
      payload: {},
    });
  };
}
export function registerLoginUser(userData) {
  console.log("userData", userData);

  return async (dispatch) => {
    try {
      axios
        .post("/api/v1/users/signup", userData)
        .then((res) => {
          console.log("User registration res", res);
          const { token } = res.data;
          setAuthToken(token);
          localStorage.setItem("jwtToken", token);
          dispatch({
            type: SET_USER_VISIT_COUNT,
            payload: res.data.data.user,
          });
          window.location.href = "/customize";
        })
        .catch((err) => {
          console.log("User registration error", err);
          if (err.response) {
            console.log("err response", err.response.data);
            var e = err.response.data.error.errors;
            dispatch({
              type: GET_ERRORS,
              payload: {
                signup: e,
                // err.response.data.error.code &&
                // err.response.data.error.code == 11000
                //   ? "a:b:Email-id already exists"
                //   : err.response.data.message,
              },
            });
          }
        });
    } catch (err) {
      console.log("User registration error", err);
      if (err.response) {
        console.log("err response", err.response.data);
        dispatch({
          type: GET_ERRORS,
          payload: { signup: err.response.data },
        });
      }
    }
  };
}
export const loginUser = (userData) => {
  return async (dispatch) => {
    try {
      axios
        .post("/api/v1/users/login", userData)
        .then((res) => {
          console.log("User login res", res);
          const { token } = res.data;
          setAuthToken(token);
          localStorage.setItem("jwtToken", token);
          // dispatch({
          //   type: SIGNUP_SUCCESS,
          //   payload: res.data.token,
          // });
          dispatch({
            type: SET_USER_DATA,
            payload: res.data.data.user,
          });
          window.location.href = "/";
        })
        .catch((err) => {
          console.log("User login error", err);
          if (err.response) {
            var e = err.response.data.message;
            console.log("err response", err.response.data);
            dispatch({
              type: GET_ERRORS,
              payload: {
                login: e,
              },
            });
          }
        });
    } catch (err) {
      console.log("User registration error", err);
      if (err.response) {
        console.log("err response", err.response.data);
        dispatch({
          type: GET_ERRORS,
          payload: { signup: err.response.data },
        });
      }
    }
  };
};

export const updateUserdetails = (userData) => (dispatch) => {
  axios
    .post("/api/auth/updateUserDetails", userData)
    .then((res) => {
      // Save to localStorage
      const { updateData } = res.data;

      console.log("updateData : ", updateData);
      chrome.runtime.sendMessage(
        "gkhoceoifnlobfcbhokoghmhoblnchhm",
        { message: "updateUserDetails", data: updateData },
        function (response) {
          // "message sent";
        }
      );

      console.log("go to next page");
      // history.push({
      //   pathname: "/authFinished",
      // });
      window.location.href = "/authFinished";
    })
    .catch((err) => {
      console.log("err after message passing login");
      if (err.response) {
      }
    });
};
export const googleLoginUser = () => {
  axios
    .get("/api/auth/googleLoginUser")
    .then((res) => {
      // Save to localStorage
      console.log("Google Login User res", res);
    })
    .catch((err) => {
      console.log("err after message passing login");
      if (err.response) {
      }
    });
};
export const forgotPasswordAction = (userData) => (dispatch) => {
  axios
    .post("/api/auth/forgotPassword", userData)
    .then((res) => {
      // Save to localStorage
      console.log("forgotPasswordAction res", res);
    })
    .catch((err) => {
      if (err.response) {
        console.log("err response", err.response.data);
      }
    });
};
export const resetPasswordAction = (userData) => (dispatch) => {
  axios
    .post("/api/auth/resetPassword", userData)
    .then((res) => {
      // Save to localStorage
      console.log("resetPasswordAction res", res);
    })
    .catch((err) => {
      if (err.response) {
        console.log("err response", err.response.data);
      }
    });
};
export const setCurrentUser = (decoded) => {
  return {
    type: SET_USER_DATA,
    payload: decoded,
  };
};

export const logoutUser = () => {
  return {
    type: SET_USER_DATA,
    payload: {},
  };
};

export const logoutFn = () => (dispatch) => {
  localStorage.removeItem("jwtToken");
  dispatch({
    type: SET_USER_DATA,
    payload: {},
  });
  window.location.href = "/";
};
export const patchUser = (user, codeSnippet = true, pswdChange = false) => {
  console.log("user in patchUser", user);
  return async (dispatch) => {
    try {
      axios.patch("/api/v1/users/" + user._id, user).then((res) => {
        console.log("User Saved", res);
        if (pswdChange) {
          window.location.href = "/login";
        } else {
          dispatch({
            type: SET_USER_DATA,
            payload: res.data.data.doc,
          });
          if (codeSnippet) {
            var code = createCodeSnippet(res.data.data.doc);

            dispatch({
              type: SET_CODE_SNIPPET,
              payload: code,
            });
          }
        }
      });
    } catch (err) {
      console.log("User registration error", err);
      if (err.response) {
        console.log("err response", err.response.data);
        dispatch({
          type: GET_ERRORS,
          payload: { signup: err.response.data },
        });
      }
    }
  };
};
const cipher = (salt) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);

  return (text) =>
    text.split("").map(textToChars).map(applySaltToChar).map(byteHex).join("");
};
const decipher = (salt) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return (encoded) =>
    encoded
      .match(/.{1,2}/g)
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");
};
const createCodeSnippet = (user) => {
  //var c = user.widgetColor;
  var wColor = user.widgetColor; // "(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
  var wPostion = user.widgetPosition;
  var paramStr = wColor + "::" + wPostion + "::" + user.accessToken;
  console.log("user paramStr", user, paramStr);
  //"rgb(0, 34, 123)::0::3dd5d8f794e8b5cd0e0e5b4f0aa49c00dbbe04bda66c8f95fd160ea32df5e069";
  const myCipher = cipher("hari1983@");
  var encodedParams = myCipher(paramStr);
  var widgetLink = "https://attainabily.com/dist/widget.js"; //TODO: change with CDN change

  const myDecipher = decipher("hari1983@");
  var decodedParams = myDecipher(encodedParams);
  console.log("decodedParams", decodedParams);

  const basicCode =
    `
  <script>
  (function (w, d, s, o, f, js, fjs) {
    w["JS-Widget"] = o;
    w[o] =
      w[o] ||
      function () {
        (w[o].q = w[o].q || []).push(arguments);
      };
    (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
    js.id = o;
    js.src = f;
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  })(window, document, "script", "mw", "` +
    widgetLink +
    `");
  mw(
    "custom_params",
    "` +
    encodedParams +
    `"
  );
</script>
  `;
  console.log("basicCode", basicCode);
  return basicCode;
};
export const isLoggedIn = () => {
  if (localStorage.jwtToken) {
    return true;
  }
  return false;
};
export const triggerForgotPassword = (email) => {
  return async (dispatch) => {
    axios
      .post("/api/v1/users/forgotPswd", email)
      .then((res) => {
        console.log("forgot password res", res);
        const { token } = res.data;
      })
      .catch((err) => {
        if (err.response) {
          console.log("err response", err.response.data);
          dispatch({
            type: GET_ERRORS,
            payload: { fgpswd: err.response.data },
          });
        }
      });
  };
};
export const getVisit = (userData) => {
  return async (dispatch) => {
    try {
      console.log("Action: getUsage");
      axios
        .post("/api/v1/users/getUsage", userData)
        .then((res) => {
          console.log("res getUsage", res);
          dispatch({
            type: SET_USER_VISIT_COUNT,
            payload: res.data.data,
          });
        })
        .catch((err) => {
          console.log("User get Usage error", err);
          if (err.response) {
            var e = err.response.data.message;
            console.log("err response", err.response.data);
          }
        });
    } catch (err) {
      console.log("User registration error", err);
      if (err.response) {
        console.log("err response", err.response.data);
      }
    }
  };
};
