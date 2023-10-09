import Api from './Api'

export default {
  /** @param {FormData} formData */
  upload (formData) {
    return Api().post('uploads', formData)
  },
}