import { createStore, createLogger } from 'vuex';
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
    fileId: null,
    fileUrls: new Map()
  },
  mutations: {
    setToken (state, token) {
      state.token = token;
      state.isUserLoggedIn = !!(token);
    },
    setUser (state, user) {
      state.user = user;
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
    updateFileUrl (state,  payload) {
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
  },
  actions: {
    setToken ({ commit }, token) {
      commit('setToken', token);
    },
    setUser ({ commit }, user) {
      commit('setUser', user);
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
  }
});
