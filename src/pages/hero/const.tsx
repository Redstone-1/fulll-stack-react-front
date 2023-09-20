export const tableColumns = [
  {
    title: '英雄名称',
    key: 'heroName',
    dataIndex: 'heroName',
    ellipsis: true,
  },
  {
    title: '上线时间',
    key: 'date',
    dataIndex: 'date',
    ellipsis: true,
  },
  {
    title: '版本强度',
    key: 'strongLevel',
    dataIndex: 'strongLevel',
    ellipsis: true,
  },
  {
    title: '英雄定位',
    key: 'position',
    dataIndex: 'position',
    render: (value: string) => {
      const positionMap = new Map([
        ['1', '射手'],
        ['2', '辅助'],
        ['3', '中路'],
        ['4', '边路'],
        ['5', '打野'],
      ])
      return positionMap.get(value)
    }
  }
]
