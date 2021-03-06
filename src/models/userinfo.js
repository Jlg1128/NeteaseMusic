/* eslint-disable import/no-anonymous-default-export */
import Cookies from 'js-cookie';
import {
  userlog,
  getuserlogstatus,
  userdetail,
  handelSearch,
} from '../service/servers';

import { deepClone } from '../util/util';

export default {
  namespace: 'userinfo',
  state: {
    userinfo: {
      avatarUrl: '',
      nickname: '默认用户',
    },
    userlogstatus: false,
    userdetail: {},
    searchSuggest: [],
    alert: {},
  },
  reducers: {
    // 登录时获取用户信息
    getuserprofile(state, action) {
      const newstate = deepClone(state);
      newstate.userinfo = action.payload;
      return newstate;
    },
    // 更改用户登录状态
    exchangeuserlogstatus(state, action) {
      const newstate = deepClone(state);
      newstate.userlogstatus = action.payload;
      return newstate;
    },
    // 已登录时获取用户信息
    getuserdetail(state, action) {
      const newstate = deepClone(state);
      newstate.userdetail = action.payload;
      return newstate;
    },
    // 退出
    quit(state, action) {
      const newstate = deepClone(state);
      Cookies.remove('uid');
      newstate.userlogstatus = false;
      newstate.userinfo = {
        avatarUrl: '',
        nickname: '默认用户',
      };
      return newstate;
    },
    // 用户登录状态信息
    logstatus(state, action) {
      const newstate = deepClone(state);
      newstate.userlogstatus = action.payload;
      return newstate;
    },
    // 搜索关键字提示
    showKeywordsAlert(state, action) {
      const newstate = deepClone(state);
      newstate.alert = action.payload;
      return newstate;
    },
  },
  effects: {
    // 搜索关键字提示
    *showKeywordsAlertAsync({ payload }, { call, put }) {
      const result = yield call(handelSearch, payload);
      if (result) {
        yield put({
          type: 'showKeywordsAlert',
          payload: result,
        });
      }
    },
    // 用户登录
    *dolog({ payload }, { call, put }) {
      const result = yield call(userlog, payload);
      if (!result) {
        alert('用户名或密码错误');
      } else {
        // 将id设置为cookie
        Cookies.set('uid', result.account.id, { expires: 24 });
        // 设置弹窗不可见
        yield put({
          type: 'recommend/setRegisterVisible',
          payload: false,
        });
        // 改变登录状态
        yield put({
          type: 'exchangeuserlogstatus',
          payload: true,
        });
        // 更改用户登录信息
        yield put({
          type: 'getuserprofile',
          payload: result.profile,
        });
      }
    },

    // 获取用户登录状态
    *dogetuserstatus({ payload }, { call, put }) {
      const result = yield call(getuserlogstatus, payload);
      console.log(result);
      const status = !!result.profile;
      // yield put({
      //     type: "getuserprofile",
      //     payload: status
      // })
    },
    // 用户登录后获取用户详情
    *dogetuserdetail({ payload }, { call, put }) {
      const result = yield call(userdetail, payload);
      yield put({
        type: 'getuserprofile',
        payload: result.data.profile,
      });
      yield put({
        type: 'exchangeuserlogstatus',
        payload: true,
      });
    },
  },
};
