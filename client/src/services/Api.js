import axios from 'axios'
import store from '../store'

export default () => {
  return axios.create({
    baseURL: `http://0.0.0.0:8080/`,
    headers: {
      Authorization: `Bearer ${store.state.token}`
    }
  })
}