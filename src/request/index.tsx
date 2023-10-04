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

  verifyToken = (force = false) => {
    return new Promise((resolve) => {
      const token = this.getToken()
      if (token && !force) {
        resolve(true)
        return
      }
      if (!this.onModal) {
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

  get = async (url = '', query = {}, config: Record<string, any> = {}) => {
    try {
      if (config.checkToken) {
        const verify = await this.verifyToken()
        if (!verify) return
      }
      const fullConfig: Record<string, any> = { checkToken: false, interceptError: true, ...config }
      const token = this.getToken()
      const paramString = qs.stringify(query)
      const getResult = await fetch(`${this.BASE_URL}${url}${paramString?.length ? ('?' + paramString) : ''}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(fullConfig?.headers || {})
        },
      })
      const final: any = await getResult.json()
      if (final.code !== 200 && fullConfig.interceptError) {
        if (final.code === 401) {
          const verify = await this.verifyToken(true)
          if (!verify) return
        }
        Message.error({ content: final.message || '请求失败', duration: 3000 })
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

  post = async (url = '', params: any = null, config: Record<string, any> = {}) => {
    try {
      if (config.checkToken) {
        const verify = await this.verifyToken(true)
        if (!verify) return
      }
      const fullConfig: Record<string, any> = { checkToken: false, interceptError: true, ...config }
      const token = this.getToken()
      const postResult = await fetch(`${this.BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Authorization': `Bearer ${token}`,
          ...(fullConfig?.headers || {})
        },
        body: JSON.stringify(params)
      })
      const final: any = await postResult.json()
      if (final.code !== 200 && fullConfig.interceptError) {
        if (final.code === 401) {
          const verify = await this.verifyToken(true)
          if (!verify) return
        }
        Message.error({ content: final.message || '请求失败', duration: 3000 })
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

  upload = async (url = '', file: any = null, config: Record<string, any> = {}) => {
    try {
      const fullConfig: Record<string, any> = { checkToken: false, interceptError: true, ...config }
      const token = this.getToken()
      const formData = new FormData();
      formData.append('file', file);

      /**
       * 使用 FormData 时不用指定 Content-Type 为 multipart/form-data
       */
      const postResult = await fetch(`${this.BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(fullConfig?.headers || {})
        },
        body: formData
      })
      const final: any = await postResult.json()
      if (final.code !== 200 && fullConfig.interceptError) {
        if (final.code === 401) {
          const verify = await this.verifyToken(true)
          if (!verify) return
        }
        Message.error({ content: final.message || '请求失败', duration: 3000 })
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
export const $upload = request.upload
