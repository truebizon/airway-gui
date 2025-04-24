// 定数定義
const constants = {
  version: '1.0.0',
  dialogType: {
    confirm: 'confirm',
    info: 'info',
    error: 'error' },
  format: {
    datetime: 'yyyy/MM/dd HH:mm',
    time: 'HH:mm',
    date: 'yyyy/MM/dd',
    datePicker: 'yyyy-MM-dd',
    datetimePicker: `yyyy-MM-dd'T'HH:mm`,
  },
} as const

export { constants }
