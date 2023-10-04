import { useState, useEffect } from 'react'
import type { FC, ReactElement } from 'react'
import { Card, Form, Button, Table, Input, DatePicker, Radio } from '@arco-design/web-react'
import { Checkbox, Space, Select, Popconfirm, Upload, Modal, Message } from '@arco-design/web-react'
import { IconDelete } from '@arco-design/web-react/icon'
import type { UploadItem } from '@arco-design/web-react/es/Upload'
import { $post, $upload } from '@request'
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

  const onFinalDelete = async (row: TableRecordProps) => {
    setTableLoading(true)
    const res = await $post('/hero/delete', { heroName: row.heroName })
    if (res.code === 200) {
      onSearch()
    } else {
      setTableLoading(false)
    }
  }

  const getHeroInfo = async (heroId: string, imgIds: string) => {
    try {
      const res = await $post('/hero/getHero', { heroId, imgIds });
      setRecord(res.result)
      return res.result ?? false
    } catch(err) {
      console.log(err)
      return false
    }
  }

  const mergedTableColumns = [
    ...tableColumns,
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      fixed: 'right',
      render: (_: string, row: TableRecordProps) => {
        return (
          <Space>
            <Button
              type='primary'
              onClick={async () => {
                setMode(modeMap.update)
                const rowData = await getHeroInfo(row.heroId, row.imgIds)
                if (!rowData) return
                const { heroName, date, strongLevel, position }: any = rowData
                await heroForm.setFieldsValue({ heroName, date, strongLevel, position })
                setVisible(true)
              }}
            >编辑</Button>
            <Popconfirm
              focusLock
              title='删除英雄记录'
              content='确定删除这条英雄记录吗？'
              onOk={() => onFinalDelete(row)}
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
      console.log(
        '%c log-by-xier %c [fileList, record] ',
        'background: #41b883; padding: 6px; border-radius: 1px 0 0 1px;  color: #fff',
        'background: #35495e; padding: 6px; border-radius: 0 1px 1px 0;  color: #fff',
        [fileList, record]
      );
      if (!errors) {
        const ids = fileList.filter(file => file.status === 'done').map((img: any) => img?.originFile?.response) || ''
        const imgIds = record?.imgIds ? (record?.imgIds + ',' + ids.join(',')) : ids.join(',')
        const res = await $post(`/hero/${mode === modeMap.add ? 'create' : 'update'}`, { ...values, imgIds, heroId: mode === modeMap.update ? record?.heroId : ''  })
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

  const customUpload = async ({ onError, onSuccess, file }: any) => {
    try {
      const res = await $upload('/hero/upload', file)
      if (res) {
        file.response = res.result
        Message.success('图片上传成功')
        onSuccess()
      } else {
        onError()
      }
    } catch (error) {
      onError()
      console.info(
        '%c error ',
        'background-color: #f44336; padding: 6px 12px; border-radius: 2px; font-size: 14px; color: #fff; font-weight: 600;',
        error
      );
    }
  }

  const onDeletePoster = (img: any) => {
    try {
      const newHeroImage = record?.heroImage?.filter(i => i.imgName !== img.imgName)
      const newImgIds = newHeroImage?.map(it => it.imgId) || []
      setRecord({
        ...record,
        imgIds: newImgIds?.join(','),
        heroImage: newHeroImage,
      } as any)
    } catch (error) {
      console.error('英雄海报删除失败', error)
    }
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
            imgIds: [],
            heroImage: []
          } as any)
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
              field=''
              rules={[
                { required: true, validator: (_, callback) => fileList.length ? callback() : callback('英雄图片必填') },
              ]}
            >
              <div style={{ display: 'flex' }}>
                {
                  (record?.heroImage?.length as number > 0) && mode === modeMap.update && (
                    record?.heroImage?.map((img) => (
                      <div className="flex flex-col items-center mr-[10px] mb-[10px]">
                        <img
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          src={`http://localhost:6419/${img.imgName}`}
                        />
                        <div className="bg-slate-100 w-full flex justify-center p-[4px] cursor-pointer" onClick={() => onDeletePoster(img)}><IconDelete style={{ filter: 'opacity(0.6)' }} /></div>
                      </div>
                    ))
                  )
                }
              </div>
              {
                (mode === modeMap.add ? fileList : record?.heroImage)?.length as number < 3 &&
                <Upload
                  accept='.jpg,.jpeg,.png'
                  fileList={fileList}
                  onChange={onFileChange}
                  multiple
                  imagePreview
                  listType='picture-card'
                  limit={3}
                  onExceedLimit={() => {
                    Message.warning('超过上传数量限制！最多上传3个')
                  }}
                  customRequest={customUpload}
                />
              }
            </FormItem>
          </Form>
      </Modal>
    </Card>
  )
}

export default Hero
