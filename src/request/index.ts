import qs from 'qs';

export const BASE_URL = 'http://localhost:8000'

export const $get = async (url = '', params = {}) => {
  const paramString = qs.stringify(params)
  const getResult = await fetch(`${BASE_URL}${url}${paramString?.length ? ('?' + paramString) : ''}`, {
    method: 'GET',
  })
  return getResult.json()
}

export const $post = async (url = '', params: any = null) => {
  const postResult = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    body: JSON.stringify(params) 
  })
  return postResult.json()
}