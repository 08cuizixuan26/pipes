import axios from 'axios'

export const service = axios.create({
    baseURL: custom_config.server_ip
})

export const serviceWithoutIp = axios.create({
})


