// store/index.js
import { createStore, createLogger } from 'vuex';
import Api from '../services/Api';
// import createPersistedState from 'vuex-persistedstate'

export default createStore({
  strict: true,
  plugins: [createLogger()],
  state: {
    token: null,
    user: null,
    isUserLoggedIn: false,
    /** @type {{ lat: number, lng: number }} */
    clicked: null,
    /**
     * @typedef {Object} FileData
     * @property {string} _id
     * @property {string} filename
     * @property {string} contentType
     * @property {Date} uploadDate
     * @property {number} length
     * @property {number} chunkSize
     * @property {Object} metadata
     * @property {string} metadata.title
     * @property {string} metadata.description
     * @property {string} metadata.latitude
     * @property {string} metadata.longitude
     * @property {string} metadata.tags
     */
    /** @type {Map<number, FileData>} */
    files: new Map(),
    userMenuClicked: false,
  },
  mutations: {
    setToken (state, token) {
      state.token = token;
      state.isUserLoggedIn = !!(token);
    },
    setUser (state, user) {
      state.user = user;
    },
    removeInboxMessage (state, message) {
      const index = state.user.inbox.findIndex((m) => m._id === message._id);
      if (index === -1) return;
      state.user.inbox.splice(index, 1);
    },
    toggleReadInboxMessage (state, data) {
      const index = state.user.inbox.findIndex((m) => m._id === data.message._id);
      if (index === -1) return;
      state.user.inbox[index].read = data.read;
    },
    setClicked (state, clicked) {
      state.clicked = clicked;
    },
    setFiles (state, files) {
      state.files = files;
    },
    addFile (state, file) {
      // ugh, this is a hack to get around the fact that Vue can't detect changes to Maps
      const newFiles = new Map(state.files.entries());
      newFiles.set(file._id, file);
      state.user.uploads.push(file._id);
      state.files = newFiles;
    },
    updateFile (state, file) {
      const newFiles = new Map(state.files.entries());
      newFiles.set(file._id, file);
      state.files = newFiles;
    },
    deleteFile (state, fileId) {
      const newFiles = new Map(state.files.entries());
      newFiles.delete(fileId);
      const index = state.user.uploads.indexOf(fileId);
      if (index > -1) {
        state.user.uploads.splice(index, 1);
      }
      state.files = newFiles;
    },
    addBookmark (state, fileId) {
      state.user.bookmarks.push(fileId);
    },
    removeBookmark (state, fileId) {
      const index = state.user.bookmarks.indexOf(fileId);
      if (index > -1) {
        state.user.bookmarks.splice(index, 1);
      }
    },
    userMenuClicked (state, clicked) {
      state.userMenuClicked = clicked;
    },
  },
  actions: {
    setToken ({ commit }, token) {
      commit('setToken', token);
    },
    setUser ({ commit }, user) {
      commit('setUser', user);
    },
    async fetchUser ({ commit }) {
      const res = await Api().get('/users/self/refresh');
      commit('setUser', res.data);
    },
    removeInboxMessage ({ commit }, message) {
      commit('removeInboxMessage', message);
    },
    toggleReadInboxMessage ({ commit }, data) {
      commit('toggleReadInboxMessage', data);
    },
    setClicked ({ commit }, clicked) {
      commit('setClicked', clicked);
    },
    setFiles ({ commit }, files) {
      commit('setFiles', files);
    },
    addFile ({ commit }, file) {
      commit('addFile', file);
    },
    updateFile ({ commit }, file) {
      commit('updateFile', file);
    },
    deleteFile ({ commit }, file) {
      commit('deleteFile', file);
    },
    addBookmark ({ commit }, fileId) {
      commit('addBookmark', fileId);
    },
    removeBookmark ({ commit }, fileId) {
      commit('removeBookmark', fileId);
    },
    userMenuClicked ({ commit }, clicked) {
      commit('userMenuClicked', clicked);
    },
  }
});
