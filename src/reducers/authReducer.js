import {
  SET_USER_DATA,
  SIGNUP_SUCCESS,
  SET_CODE_SNIPPET,
  SET_USER_VISIT_COUNT,
} from "../actions/types";

export default function noteReducer(state = [], action) {
  switch (action.type) {
    case SIGNUP_SUCCESS:
      return { ...state, user_token: action.payload };
    case SET_USER_DATA:
      return { ...state, user_data: action.payload };
    case SET_CODE_SNIPPET:
      return { ...state, codeSnippet: action.payload };
    case SET_USER_VISIT_COUNT:
      return { ...state, visitCount: action.payload };
    default:
      return state;
  }
}
