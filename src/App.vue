<script setup lang="ts">
import { useDateFormat, useIntervalFn, useNow, useTitle, useWebNotification } from '@vueuse/core'
import axios from 'axios';
import { onMounted, ref } from 'vue';

axios.defaults.withCredentials = true
const ticket_list = ref<Map<number, Record<string, any>>>(new Map()) // 票列表
useTitle('会员购票监控')

// 消息显示
const body = ref<string>('')
const {
  show,
} = useWebNotification({
  title: '有票啦！',
  body: body.value,
  renotify: true,
  tag: '测试',
})
const showMessage = () => {
  show({ body: body.value })
}


const loading = ref<boolean>(false)
const latest_refresh = ref<string>('') // 最近一次刷新时间
const now = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss') // 当前时间
// 获取票列表
const refresh = () => {
  loading.value = true
  axios.get('/api/ticket/project/get?version=134&id=74313&project_id=74313', {}).then(res => {
    const screen_list = res.data.data.screen_list
    for (let i in screen_list) {
      for (let j in screen_list[i]['ticket_list']) {
        let ticket = screen_list[i]['ticket_list'][j]
        ticket['price'] = ticket['price'] / 100 // 价格单位处理
        ticket_list.value.set(ticket.id, ticket) // 更新票列表
        if (ticket['clickable'] && !(ticket['desc'].includes('牌区'))) {
          // 可点击且不是牌区
          body.value = `${ticket['desc']}, ${ticket['screen_name']}, ${ticket['price']}元`
          showMessage()
        }
      }
    }
    latest_refresh.value = now.value
    loading.value = false
  })
}

// 定时获取
const delay = ref<number>(5 * 1000)
useIntervalFn(refresh, delay, { immediate: true })

onMounted(() => {
  // 测试消息发送
  if (Notification.permission === "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "denied") {
        alert("无法创建通知");
      }
    });
  }
  body.value = '测试消息'
  showMessage()
  // 立即刷新
  refresh()
})
</script>

<template>
  <p>最近刷新时间: {{ latest_refresh }}  {{ loading ? `刷新中` : `` }}</p>
  <a href="https://show.bilibili.com/platform/detail.html?id=74313&from=pc_search_sug">会员购地址</a>
  <table>
    <tr>
      <th>票ID</th>
      <th>票名</th>
      <th>日期</th>
      <th>价格</th>
      <th>状态</th>
    </tr>
    <tr v-for="[_, ticket] in ticket_list" :key="ticket.id" :class="{ 'bg-amber-100': ticket.clickable }">
      <td>{{ ticket.id }}</td>
      <td>{{ ticket.desc }}</td>
      <td>{{ ticket.screen_name }}</td>
      <td>{{ ticket.price }}</td>
      <td>{{ ticket.clickable ? `可购买` : `不可购买` }}</td>
    </tr>
  </table>
</template>

<style scoped>
td {
  @apply border-b border-gray-300 text-left p-2;
}

th {
  @apply border-b-2 border-gray-300 pl-2 text-left;
}
</style>
