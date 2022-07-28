import {service} from '@/utils/request'

export function surfacearea(data) {
  return service({
    responseType: 'arraybuffer',
    url: '/analysis?type=surfacearea&id=',
    method: 'post',
    data
  })
}