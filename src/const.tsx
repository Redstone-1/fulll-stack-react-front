import { Image } from '@arco-design/web-react'

export const tableColumns = [
  {
    title: '英雄名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '上线时间',
    dataIndex: 'date',
    ellipsis: true,
  },
  {
    title: '版本强度',
    dataIndex: 'strongLevel',
    ellipsis: true,
  },
  {
    title: '英雄定位',
    dataIndex: 'position',
    ellipsis: true,
  },
  {
    title: '英雄海报',
    dataIndex: 'poster',
    render: (_: any, record: any) => {
      return <Image src={record.imgUrl || ''} />
    }
  },
]