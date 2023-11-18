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
    deleteFile ({ commit }, file) {
      commit('deleteFile', file);
    },
  }
});
