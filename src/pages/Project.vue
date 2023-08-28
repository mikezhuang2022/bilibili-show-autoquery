<script setup lang="ts">
import { useDateFormat, useIntervalFn, useNow, useTitle, useWebNotification } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'
import { useRouter } from 'vue-router'
import { getExhibition } from '../api'
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

axios.defaults.withCredentials = true
const ticket_list = ref<Map<number, Record<string, any>>>(new Map()) // 票列表
const title = useTitle('会员购票监控')

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
// 展览名称
const exhibition_name = ref<string>('')
// 展览ID 从路由id参数获取
const exhibition_id = useRouteParams('id', 74313)

// 获取票列表
const refresh = () => {
  loading.value = true
  getExhibition(exhibition_id.value).then(res => {
    // 展览名称解析
    exhibition_name.value = res.data.data.name
    title.value = `${exhibition_name.value} - 会员购票监控`
    // 票信息解析
    const screen_list = res.data.data.screen_list
    for (let i in screen_list) {
      for (let j in screen_list[i]['ticket_list']) {
        let ticket = screen_list[i]['ticket_list'][j]
        ticket['price'] = ticket['price'] / 100 // 价格单位处理
        ticket_list.value.set(ticket.id, ticket) // 更新票列表
        // if (ticket['clickable'] && !(ticket['desc'].includes('牌区'))) {
        //   // 可点击且不是牌区
        //   body.value = `${ticket['desc']}, ${ticket['screen_name']}, ${ticket['price']}元`
        //   showMessage()
        // }
      }
    }
    latest_refresh.value = now.value
    loading.value = false
  })
}

// 当id变化时，清空票列表
watch(exhibition_id, () => {
  ticket_list.value.clear()
  refresh()
})

// 定时获取
const delay = ref<number>(5 * 1000)
useIntervalFn(refresh, delay, { immediate: true })

onMounted(() => {
  // 测试消息发送
  if (Notification.permission === "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "denied") {
        // alert("无法创建通知");
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
  <p class="text-center text-3xl mt-3">{{ exhibition_name }}</p>
  <p class="text-center">共{{ ticket_list.size }}个票</p>
  <p class="text-center mb-3">最近刷新时间: {{ latest_refresh }}  {{ loading ? `刷新中` : `` }}</p>
  <ul>
    <li v-for="[_, ticket] in ticket_list" :key="ticket.id"
      class="py-3 px-2 mx-11 border-b-2 border-b-slate-200 flex"
      :class="{ 'bg-green-50': ticket.clickable }">
      <div class="grow">
        <p class="md:text-3xl">{{ ticket.screen_name }} {{ ticket.desc }}
          <div class="inline" 
            :class="{ 'text-red-400': !ticket.clickable, 'text-green-400': ticket.clickable }">{{ ticket.clickable ? `可购买` : `不可购买` }}</div>
        </p>
        <p class="text-slate-500">Ticket_ID: {{ ticket.id }} 开始售票时间: {{ ticket.sale_start }}</p>
      </div>
      <div class="flex-none">
        <p class="text-red-400 text-2xl relative right-0 w-fit">￥{{ ticket.price }}</p>
      </div>
    </li>
  </ul>
</template>
