<script setup lang="ts">
import { useDateFormat, useIntervalFn, useNow, useRefHistory, useTitle, useWebNotification } from '@vueuse/core'
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
  title: 'B站会员购监控',
  body: body.value,
  renotify: true,
  tag: '测试',
})
const showMessage = () => {
  show({ body: body.value, title: title.value || '会员购票监控' })
}


const loading = ref<boolean>(false)
const latest_refresh = ref<string>('') // 最近一次刷新时间
const now = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss') // 当前时间
// 展览名称
const exhibition_name = ref<string>('')
// 展览ID 从路由id参数获取
const exhibition_id = useRouteParams('id', 74313)

// 进度条
const jinduen = ref(false)

// 获取票列表
const refresh = () => {
  jinduen.value = false
    setTimeout(() => {
      jinduen.value = true
    }, 10)
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
        // 检测票数据不同
        if(ticket_list.value.get(ticket.id) !== undefined){ // 检测空白
          if(ticket_list.value.get(ticket.id)!['clickable'] !== ticket['clickable']){
            // 与票的上一次状态不一样，且可购买
            body.value = `类型:${ticket['desc']}\n日期:${ticket['screen_name']}\n状态:${ticket['clickable']}`
          }
        }
        ticket_list.value.set(ticket.id, ticket) // 更新票列表
      }
    }
    latest_refresh.value = now.value
    loading.value = false
  })
}

// 定时获取
const delay = ref<number>(5 * 1000)
useIntervalFn(refresh, delay, { immediate: true })

// 报错
const err = ref(false)

// 挂载
onMounted(() => {
  // 测试消息发送
  if (Notification.permission === "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "denied") {
        // 无法发送通知
        err.value = true
        // alert("无法创建通知");
      }
    });
  }
  body.value = '测试消息\n换行'
  showMessage()
  // 立即刷新
  refresh()
})
</script>

<template>
  <!-- 展览名字 -->
  <p class="text-center text-3xl mt-3 mb-3">{{ exhibition_name }}</p>
  <!-- 报错 无法发送通知 -->
  <div class="mx-auto w-fit bg-red-200 rounded border-2 border-red-300 px-4 py-2 text-lg"
    v-if="err">无法发送通知</div>
  <!-- 最近刷新时间 -->
  <p class="text-center mb-3">最近刷新时间: {{ latest_refresh }}</p>
  <!-- 小小的进度条 :) -->
  <div class="mx-auto flex flex-auto rounded-full bg-slate-100 w-1/3">
    <div class="h-2 w-[--jindu] flex-none rounded-l-full rounded-r-[1px] bg-blue-500"
      :class="{jindu: jinduen}"></div>
  </div>
  <!-- 票列表 -->
  <ul>
    <li v-for="[_, ticket] in ticket_list" :key="ticket.id"
      class="py-3 px-2 mx-11 border-b-2 border-b-slate-200 flex"
      :class="{ 'bg-green-50': ticket.clickable }">
      <!-- 左侧内容 -->
      <div class="grow">
        <p class="md:text-3xl">{{ ticket.screen_name }} {{ ticket.desc }}
          <div class="inline md:text-2xl"
            :class="{ 'text-red-400': !ticket.clickable, 'text-green-400': ticket.clickable }">
            {{ ticket.clickable ? `可购买` : `不可购买` }}
          </div>
        </p>
        <p class="text-slate-500">Ticket_ID: {{ ticket.id }} 开始售票时间: {{ ticket.sale_start }}</p>
      </div>
      <!-- 右侧内容 -->
      <div class="flex-none">
        <p class="text-red-400 text-2xl relative right-0 w-fit">￥{{ ticket.price }}</p>
      </div>
    </li>
  </ul>
</template>
<style scoped>
.jindu {
  animation: myfirst 5s linear;
  width: 0%
}
@keyframes myfirst
{
    from {width:0%}
    to {width: 100%}
}
</style>
