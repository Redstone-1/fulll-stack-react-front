import qs from 'qs'
import { Modal, Message } from '@arco-design/web-react'

const { VITE_BASE_URL } = import.meta.env

class Request {
  private BASE_URL: string = 'http://localhost:8000'
  private onModal: boolean = false

  constructor(URL: string) {
    this.BASE_URL = URL
  }

  getToken = () => {
    return localStorage.getItem('access_token') || null
  }

  verifyToken = () => {
    return new Promise((resolve) => {
      const token = this.getToken()
      if (token) {
        resolve(true)
        return
      }
      if (!token && !this.onModal) {
        this.onModal = true
        Modal.confirm({
          title: '重新登录',
          content: <div style={{ textAlign: 'center' }}>您当前的登录态已过期，请重新登录</div>,
          maskClosable: false,
          unmountOnExit: true,
          style: {
            width: '400px'
          },
          onConfirm: () => {
            window.location.href = '/login'
            this.onModal = false
            resolve(true)
          },
          onCancel: () => {
            this.onModal = false
            window.location.reload()
            resolve(false)
          },
        })
      }
    })
  }

  get = async (url = '', params = {}, checkToken = true, interceptError = true) => {
    try {
      if (checkToken) {
        const verify = await this.verifyToken()
        if (!verify) return
      }

      const token = this.getToken()
      const paramString = qs.stringify(params)
      const getResult = await fetch(`${this.BASE_URL}${url}${paramString?.length ? ('?' + paramString) : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      const final: any = await getResult.json()
      if (final.code !== 200 && interceptError) {
        Message.error({ content: final.message || '请求失败', duration: 3 })
        return false
      }
      return final
    } catch (error) {
      console.info(
        '%c error ',
        'background-color: #f44336; padding: 6px 12px; border-radius: 2px; font-size: 14px; color: #fff; font-weight: 600;',
        error
      );
      return false
    }
  }

  post = async (url = '', params: any = null, checkToken = true, interceptError = true) => {
    try {
      if (checkToken) {
        const verify = await this.verifyToken()
        if (!verify) return
      }
      const token = this.getToken()
      const postResult = await fetch(`${this.BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params)
      })
      const final: any = await postResult.json()
      if (final.code !== 200 && interceptError) {
        Message.error({ content: final.message || '请求失败', duration: 3 })
        return false
      }
      return final
    } catch (error) {
      console.info(
        '%c error ',
        'background-color: #f44336; padding: 6px 12px; border-radius: 2px; font-size: 14px; color: #fff; font-weight: 600;',
        error
      );
      return false
    }
  }
}

const request = new Request(VITE_BASE_URL)

export const $get = request.get
export const $post = request.post
