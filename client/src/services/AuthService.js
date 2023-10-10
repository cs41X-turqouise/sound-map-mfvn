import Api from './Api'

export default {
  register (credentials) {
    return Api().post('register', credentials)
  },
  async login () {
    try {
      const data = await Api().post('login/google');
      console.log(data);
    } catch (err) {
      console.log(err)
    }
  }
}