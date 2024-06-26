import { store } from "@/redux/store";
import { FetchApi } from "./FetchApi";
import { setAuth } from "@/redux/slices/AuthSlice";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";

export function capitalizeAllWords(str) {
  const words = str.split(' ');
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords.join(' ');
}

export const stringToCharCode = (entityRegex) => {
  const downArrowCharCode = parseInt(entityRegex.replace(/&#(\d+);/, '$1'));
  const downArrowChar = String.fromCharCode(downArrowCharCode);
  return downArrowChar
}
export const getAuth = () => {
  const auth = store.getState().auth?.user
  if (auth?.accessToken) {
    const data = jwtDecode(auth?.accessToken || '')
    return data.agency
  } else if (auth?.agency?.role === 'AG') {
    return auth.agency
  } else {
    return {}
  }
}
export const getCountry = () => {
  return store.getState().auth.country 
}
export const loginUser = async (email, password, func) => {
  const res = await FetchApi({ url: '/agency/agencySignin', method: 'post', data: { email, password }, callback: func })
  console.log(res)
  if (res?.status === 200) {
    store.dispatch(setAuth(res?.data.user))

  }

  return res;

}

export const logoutUser = () => {
  store.dispatch(setAuth({}))
  window.location = '/login'
}


const refetchAuthState = async (auth) => {
  try {
    const res = await FetchApi({
      url: `/agency/detailsAgency/${auth.agency._id}`, callback: () => {
      }
    })
    if (res.status === 200) {
      const newObj = {
        ...auth,
        agency: res.data.agency,
      }
      store.dispatch(setAuth(newObj))
    }
  } catch (error) {
    store.dispatch(setAuth({}))
    window.location = '/login'
  }
}

export const useAuth = () => {
  const auth = useSelector((state) => state.auth.user);
  return {
    auth: auth?.agency,
    refetchAuth: () => refetchAuthState(auth),
    token: auth?.sanitizedUser?.accessToken
  }
}



//  for getting level
let levelsData = {
  result: []
};
export const loadLevelData = async () => {
  const { data } = await FetchApi({ url: '/level/levels' })
  levelsData = data
  return levelsData.result
}

export const getUserLevel = (diamonds) => {
  let level = {}
  const sortedLevels = levelsData.result.sort((a, b) => a.diamonds - b.diamonds);
  for (let i = 0; i < sortedLevels.length; i++) {
    if (sortedLevels[i].diamonds <= diamonds) {
      level = sortedLevels[i]
    }
  }
  if(!level.levelName){
    return {levelName: '0', diamonds: 0}
  }else {
    return level;
  }
}