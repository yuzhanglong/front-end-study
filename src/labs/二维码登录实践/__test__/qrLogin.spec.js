// 没写完。有空补充
const { describe } = require('@jest/globals')
const app = require('../app')
const supertest = require('supertest')
const { verify } = require('../utils/jwt')
const uuid = require('uuid')

const request = supertest(app.listen())

describe('基本接口测试', () => {
  test('模拟获取用户 TOKEN', async () => {
    await request
      .get('/get_token')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        const data = res.body
        expect(data).toBeInstanceOf(Object)
        expect(typeof data.data.token).toEqual('string')
        expect(verify(data.data.token)).toBeTruthy()
      })
  })

  test('模拟获取二维码', async () => {
    // 随机生成一个 uuid
    const path = `/login_qr_code/${uuid.v4()}`
    await request
      .get(path)
      .expect(200)
      .expect('Content-Type', /png/)
      .expect((res) => {
        expect(res).toBeTruthy()
      })
  })
})

describe('登录相关 websocket 接口测试', () => {
  test('尝试建立 WebSocket 连接', async () => {
    const wsPromise = () =>
      new Promise((resolve) => {
        const ws = new WebSocket('ws://localhost:8000')
        expect(ws).toBeTruthy()
        ws.onopen = () => {
          ws.close()
        }
        ws.onclose = () => {
          resolve()
        }
      })
    await wsPromise()
  })

  test('尝试向服务端获取 uid(二维码凭证)', async () => {
    const wsPromise = () =>
      new Promise((resolve) => {
        const ws = new WebSocket('ws://localhost:8000')
        expect(ws).toBeTruthy()
        ws.onopen = () => {
          ws.send('GET_CODE')
        }
        ws.onmessage = (e) => {
          expect(e.data).toBeTruthy()
          const res = JSON.parse(e.data)
          expect(res).toBeTruthy()
          expect(typeof res.data.uuid).toEqual('string')
          ws.close()
          resolve()
        }
      })
    await wsPromise()
  })
})
