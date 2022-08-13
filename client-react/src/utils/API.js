import axios from 'axios'

// const base_url = process.env.REACT_APP_ENV === 'development'?'http://localhost:5000/':'http://35.205.121.131:5000/';

// Flask
const base_url = 'http://34.89.6.59:8080/';

export default axios.create({
  baseURL: base_url,
  responseType: 'json'
})