import { useState, useEffect } from 'react'
import type { FC, ReactElement } from 'react'
import { Card, Form, Button, Table, Input, DatePicker, Radio, Image } from '@arco-design/web-react'
import { Checkbox, Space, Select, Popconfirm, Upload, Modal, Message } from '@arco-design/web-react'
import type { UploadItem } from '@arco-design/web-react/es/Upload'
import { $post } from '@request'
import { tableColumns } from './const'
import type { SearchFormProps, HeroFormProps, TableRecordProps } from './types'
import './index.css'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group

const modeMap = {
  add: '新增',
  update: '更新'
}

const Hero: FC = (): ReactElement => {
  const [searchForm] = Form.useForm<SearchFormProps>()
  const [heroForm] = Form.useForm<HeroFormProps>()
  const [mode, setMode] = useState(modeMap.add)
  const [record, setRecord] = useState<TableRecordProps>()
  const [tableLoading, setTableLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [visible, setVisible] = useState(false)
  const [fileList, setFileList] = useState<UploadItem[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10,
  })
  const modeText = `${mode === modeMap.add ? modeMap.add : modeMap.update}`

  useEffect(() => {
    onSearch()
  }, [pagination.current, pagination.pageSize])

  const onFinalDelete = async (record: TableRecordProps) => {
    setTableLoading(true)
    const res = await $post('/hero/delete', { heroName: record.heroName })
    if (res.code === 200) {
      onSearch()
    } else {
      setTableLoading(false)
    }
  }

  const mergedTableColumns = [
    ...tableColumns,
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      fixed: 'right',
      render: (_: string, record: TableRecordProps) => {
        return (
          <Space>
            <Button type='primary' onClick={() => {
              const { heroName, date, strongLevel, position, poster } = record
              setMode(modeMap.update)
              setRecord(record)
              heroForm.setFieldsValue({ heroName, date, strongLevel, position, poster })
              setVisible(true)
            }}>编辑</Button>
            <Popconfirm
              focusLock
              title='删除英雄记录'
              content='确定删除这条英雄记录吗？'
              onOk={() => onFinalDelete(record)}
            >
              <Button status='danger'>删除</Button>
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  const onSearch = (resetPageNumber: boolean = false) => {
    searchForm.validate(async (errors, values) => {
      setTableLoading(true)
      try {
        const params = {
          ...values,
          pageNum: resetPageNumber ? 1 : pagination.current,
          pageSize: pagination.pageSize,
        }
        if (!errors) {
          const res = await $post('/hero/getHeroList', params)
          if (res.code === 200 && res?.result?.data.length) {
            setDataSource(res.result.data)
            setPagination({
              ...pagination,
              total: res.result.total
            })
            setTableLoading(false)
          } else {
            setDataSource([])
            setTableLoading(false)
            setPagination({
              ...pagination,
              current: 1,
              total: 0
            })
          }
        }
      } catch (error) {
        setDataSource([])
        setPagination({
          ...pagination,
          total: 0
        })
        setTableLoading(false)
      }
    })
  }

  const onSaveHero = () => {
    heroForm.validate(async (errors, values) => {
      if (!errors) {
        const res = await $post(`/hero/${mode === modeMap.add ? 'create' : 'update'}`, values)
        if (res.code === 200) {
          Message.success(`${modeText}英雄成功！`)
          setPagination({
            ...pagination,
            current: 1
          })
          onSearch()
          setVisible(false)
        }
      }
    })
  }

  const onPageChange = (pageNumber: number) => {
    setPagination({
      ...pagination,
      current: pageNumber,
    })
  }
  const onPageSizeChange = (pageSizer: number) => {
    setPagination({
      ...pagination,
      pageSize: pageSizer,
    })
  }

  const onFileChange = (fileList: UploadItem[]) => {
    setFileList(fileList)
  }

  return (
    <Card
      title='数据面板'
      style={{ height: '100%' }}
    >
      <Form
        form={searchForm}
        layout="inline"
        labelAlign="left"
        colon
      >
        <FormItem
          label='英雄名称'
          field='heroName'
        >
          <Input placeholder='请输入英雄名称' />
        </FormItem>
        <FormItem
          label='上线时间'
          field='date'
        >
          <DatePicker format='YYYY-MM-DD' placeholder='请选择上线时间' />
        </FormItem>
        <FormItem
          label='版本强度'
          field='strongLevel'
        >
          <Select
            style={{ width: '138px' }}
            options={[
              { label: 'T0', value: 'T0' },
              { label: 'T1', value: 'T1' },
              { label: 'T2', value: 'T2' },
              { label: 'T3', value: 'T3' },
            ]}
            allowClear
            placeholder='请选择版本强度'
          />
        </FormItem>
        <FormItem
          label='英雄定位'
          field='position'
        >
          <CheckboxGroup
            options={[
              { label: '射手', value: '1' },
              { label: '辅助', value: '2' },
              { label: '中路', value: '3' },
              { label: '边路', value: '4' },
              { label: '打野', value: '5' },
            ]}
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button type='primary' onClick={() => onSearch(true)}>查询</Button>
            <Button
              type='primary'
              onClick={() => searchForm.resetFields([
                'heroName',
                'date',
                'strongLevel',
                'position',
              ])}
            >重置</Button>
          </Space>
        </FormItem>
      </Form>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', margin: '10px 0 10px 0' }}>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              setMode(modeMap.add)
              setVisible(true)
            }}
          >新增</Button>
        </Space>
      </div>
      <Table
        stripe
        virtualized
        data={dataSource}
        pagePosition='br'
        loading={tableLoading}
        pagination={{
          showJumper: true,
          showTotal: true,
          sizeOptions: [10, 20, 50],
          pageSizeChangeResetCurrent: true,
          current: pagination.current,
          total: pagination.total,
          pageSize: pagination.pageSize,
          onChange: onPageChange,
          onPageSizeChange: onPageSizeChange,
        }}
        columns={mergedTableColumns as any}
      />
      <Modal
        title={
          <div style={{ textAlign: 'left' }}>
            {modeText}英雄
          </div>
        }
        visible={visible}
        onOk={() => onSaveHero()}
        onCancel={() => setVisible(false)}
        afterClose={() => {
          setMode(modeMap.add)
          heroForm.resetFields([
            'heroName',
            'date',
            'strongLevel',
            'position',
          ])
          setFileList([])
          setRecord({
            heroName : '',
            date: '',
            strongLevel: '',
            position: '',
            poster: []
          })
        }}
        okText={modeText}
        autoFocus={false}
        focusLock={true}
        escToExit
        maskClosable={false}
      >
         <Form
            form={heroForm}
            layout="vertical"
            labelAlign="left"
            colon
            labelCol={{ span: 24 }}
          >
            <FormItem
              label='英雄名称'
              field='heroName'
              rules={[
                { required: true, message: '英雄名称必填！' },
              ]}
            >
              <Input placeholder='请输入英雄名称' />
            </FormItem>
            <FormItem
              label='上线时间'
              field='date'
              rules={[
                { required: true, message: '上线时间必填！' },
              ]}
            >
              <DatePicker style={{ width: '100%' }} format='YYYY-MM-DD' placeholder='请选择上线时间' />
            </FormItem>
            <FormItem
              label='版本强度'
              field='strongLevel'
              rules={[
                { required: true, message: '版本强度必填！' },
              ]}
            >
              <Select
                style={{ width: '100%' }}
                options={[
                  { label: 'T0', value: 'T0' },
                  { label: 'T1', value: 'T1' },
                  { label: 'T2', value: 'T2' },
                  { label: 'T3', value: 'T3' },
                ]}
                allowClear
                placeholder='请选择版本强度'
              />
            </FormItem>
            <FormItem
              label='英雄定位'
              field='position'
              rules={[
                { required: true, message: '英雄定位必填！' },
              ]}
            >
              <RadioGroup
                options={[
                  { label: '射手', value: '1' },
                  { label: '辅助', value: '2' },
                  { label: '中路', value: '3' },
                  { label: '边路', value: '4' },
                  { label: '打野', value: '5' },
                ]}
              />
            </FormItem>
            <FormItem
              label='英雄海报'
              field='poster'
            >
              {
                record?.poster?.length as number > 0 && (
                  <Image src='' />
                )
              }
              <Upload
                accept='.jpg,.jpeg,.png'
                fileList={fileList}
                onChange={onFileChange}
                multiple
                imagePreview
                action='/'
                listType='picture-card'
                limit={3}
                onExceedLimit={() => {
                  Message.warning('超过上传数量限制！最多上传3个')
                }}
              />
            </FormItem>
          </Form>
      </Modal>
    </Card>
  )
}

export default Hero
