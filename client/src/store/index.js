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
    fileId: null,
    fileUrls: new Map(),
    playing: false
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
      state.files = newFiles;
    },
    updateFile (state, file) {
      const newFiles = new Map(state.files.entries());
      newFiles.set(file._id, file);
      state.files = newFiles;
    },
    removeFile (state, file) {
      const newFiles = new Map(state.files.entries());
      newFiles.delete(file._id);
      state.files = newFiles;
    },
    userMenuClicked (state, clicked) {
      state.userMenuClicked = clicked;
    },
    setFileId (state, id) {
      state.fileId = id;
    },
    setFileUrls (state, fileUrls) {
      state.fileUrls = fileUrls;
    },
    addFileUrl (state, payload) {
      const fileId = payload.fileId;
      const url = payload.url;
      const newFileUrls = new Map(state.fileUrls.entries());
      newFileUrls.set(fileId, url);
      state.fileUrls = payload.newFileUrls;
    },
    updateFileUrl (state, payload) {
      const fileId = payload.fileId;
      const url = payload.url;
      const newFileUrls = new Map(state.fileUrls.entries());
      newFileUrls.set(fileId, url);
      state.fileUrls = newFileUrls;
    },
    removeFileUrl (state, payload) {
      const fileId = payload.fileId;
      const newFileUrls = new Map(state.fileUrls.entries());
      newFileUrls.delete(fileId);
      state.fileUrls = newFileUrls;
    },
    setPlaying (state, playing) {
      state.playing = playing;
    }
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
    removeFile ({ commit }, file) {
      commit('removeFile', file);
    },
    userMenuClicked ({ commit }, clicked) {
      commit('userMenuClicked', clicked);
    },
    setFileId ({ commit }, id) {
      commit('setFileId', id);
    },
    setFileUrls ({ commit }, fileUrls) {
      commit('setFileUrls', fileUrls);
    },
    addFileUrl ({ commit }, fileId, url) {
      commit('addFileUrl', fileId, url);
    },
    updateFileUrl ({ commit }, fileId, url) {
      commit('updateFileUrl', fileId, url);
    },
    removeFileUrl ({ commit }, fileId) {
      commit('removeFileUrl', fileId);
    },
    setPlaying ({ commit }, playing) {
      commit('setPlaying', playing);
    }
  }
});
