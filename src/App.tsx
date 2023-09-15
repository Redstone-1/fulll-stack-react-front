import { useState, useEffect } from 'react'
import { Card, Form, Button, Table, Input, DatePicker, Radio, Image } from '@arco-design/web-react'
import { Checkbox, Space, Select, Popconfirm, Upload, Modal, Message } from '@arco-design/web-react'
import type { UploadItem } from '@arco-design/web-react/es/Upload'
import { tableColumns } from './const'
import './App.css'

interface SearchFormProps {
  name: string,
  date: string,
  strongLevel: 'T0' | 'T2' | 'T3' | 'T4',
  position: '1' | '2' | '3' | '4' | '5'
}
interface HeroFormProps extends SearchFormProps {
  poster: any[],
}
interface TableRecordProps extends HeroFormProps {}

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

const modeMap = {
  add: '新增',
  update: '更新'
}

function App() {
  const [searchForm] = Form.useForm<SearchFormProps>();
  const [heroForm] = Form.useForm<HeroFormProps>();
  const [mode, setMode] = useState(modeMap.add);
  const [record, setRecord] = useState<TableRecordProps>();
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadItem[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10,
  });
  const modeText = `${mode === modeMap.add ? modeMap.add : modeMap.update}`;

  const onFinalDelete = (record: TableRecordProps) => {
    console.log(record);
    
  }

  const mergedTableColumns = [
    ...tableColumns,
    {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      render: (_: string, record: TableRecordProps) => {
        return (
          <Space>
            <Button type='primary' onClick={() => {
              const { name, date, strongLevel, position, poster } = record;
              setMode(modeMap.update)
              setRecord(record)
              heroForm.setFieldsValue({ name, date, strongLevel, position, poster })
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

  const onSearch = () => {
    searchForm.validate((errors, values) => {
      if (!errors) {
        console.log(
          '%c log-by-xier %c values ',
          'background: #41b883; padding: 6px; border-radius: 1px 0 0 1px;  color: #fff',
          'background: #35495e; padding: 6px; border-radius: 0 1px 1px 0;  color: #fff',
          values
        );
      }
    })
  }
  const onAddHero = () => {
    heroForm.validate((errors, values) => {
      if (!errors) {
        console.log(
          '%c log-by-xier %c values ',
          'background: #41b883; padding: 6px; border-radius: 1px 0 0 1px;  color: #fff',
          'background: #35495e; padding: 6px; border-radius: 0 1px 1px 0;  color: #fff',
          values
        );
      }
    })
  }

  const onPageChange = (pageNumber: number, pageSizer: number) => {
    setPagination({
      ...pagination,
      current: pageNumber,
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
          field='name'
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
            <Button type='primary' onClick={onSearch}>查询</Button>
            <Button
              type='primary'
              onClick={() => searchForm.resetFields([
                'name',
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
          <Button type='primary' onClick={() => setVisible(true)}>新增</Button>
        </Space>
      </div>
      <Table
        stripe
        virtualized
        data={[
          {
            name: '程咬金',
            key: '程咬金',
            date: '2022-09-01',
            strongLevel: 'T2',
            position: '4',
          }
        ]}
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
        onOk={() => onAddHero()}
        onCancel={() => {
          setVisible(false);
          heroForm.resetFields([
            'name',
            'date',
            'strongLevel',
            'position',
          ])
          setFileList([])
          setRecord({})
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
              field='name'
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
              rules={[
                {
                  validator: (value, callback) => {
                    if (!fileList.length) {
                      return callback('英雄海报必须上传！')
                    }
                    callback()
                  }
                },
              ]}
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
                  Message.warning('超过上传数量限制！最多上传3个');
                }}
              />
            </FormItem>
          </Form>
      </Modal>
    </Card>
  )
}

export default App
