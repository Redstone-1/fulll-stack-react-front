import { useState } from 'react'
import type { FC, ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Message } from '@arco-design/web-react'
import { Form, Button } from '@arco-design/web-react'
import { IconUser, IconLock } from '@arco-design/web-react/icon'
import { $post } from '@request'

const FormItem = Form.Item

const Login: FC = (): ReactElement => {
  const navigateTo = useNavigate()
  const [form] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)

  const onLogin = () => {
    form.validate().then(async (values) => {
      setSubmitLoading(true)
      const firstLogin = await $post('/users/login', values, false)
      if (!firstLogin) {
        Message.info('用户不存在，正在为你自动注册...')
        const registerRes = await $post('/users/register', values, false)
        if (registerRes) {
          const secondLogin = await $post('/users/login', values, false)
          if (secondLogin) {
            Message.success('登录成功！')
            localStorage.setItem('access_token', secondLogin.result.token)
            navigateTo('/hero')
          }
        }
      } else {
        localStorage.setItem('access_token', firstLogin.result.token)
        navigateTo('/hero')
      }
      setSubmitLoading(false)
    })
  }

  return (
    <div
      style={{
        height: '100%',
        backgroundImage: 'url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg)',
      }}
      className='login-page w-full relative'
    >
      <div className='flex flex-row w-[560px] h-[420px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-60%] rounded-md shadow-2xl'>
        <div className='h-full w-full flex flex-col items-center p-[40px]'>
          <div className='text-3xl mb-[40px] font-semibold'>欢迎回来</div>
          <Form
            form={form}
            layout='vertical'
            labelAlign='left'
            colon
            labelCol={{ span: 24 }}
          >
            <FormItem
              label='用户'
              field='userName'
              rules={[
                { required: true, message: '用户必填！' },
                { min: 6, message: '用户名至少 6 位', validateTrigger: 'onChange' },
              ]}
            >
              <Input type='text' placeholder='请输入用户' allowClear maxLength={20} prefix={<IconLock />} />
            </FormItem>
            <FormItem
              label='密码'
              field='password'
              rules={[
                {required: true, message: '密码必填!', validateTrigger: 'onChange'},
                { min: 4, message: '密码至少 4 位', validateTrigger: 'onChange' },
              ]}
            >
              <Input type='password' placeholder='请输入密码' allowClear maxLength={20} prefix={<IconUser />} />
            </FormItem>
            <FormItem
            >
              <Button type='primary' long loading={submitLoading} onClick={onLogin}>登录</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Login
