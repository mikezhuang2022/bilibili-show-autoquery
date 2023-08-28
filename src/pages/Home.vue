<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios'

const url = '/api/ticket/project/listV2?version=134&page=1&pagesize=20&area=440100&filter=&platform=web&p_type=%E5%B1%95%E8%A7%88'
const exhibitions = ref<Array<any>>([])
axios.get(url).then(res => {
  exhibitions.value = res.data.data.result
})

const tiaozhuan = (id: number) => {
  window.open('https://show.bilibili.com/platform/detail.html?id=' + id)
}

const router = useRouter()
const project = (id: number) => {
  const url = router.resolve({ name: 'project', params: { id } }).href
  window.open(url)
}
</script>
<template>
  <!-- 显示展览信息 -->
  <h2 class="text-2xl text-center mt-3">展览列表</h2>
  <p class="mb-4 text-center">共{{ exhibitions.length }}个展览</p>
  <ul>
    <li v-for="exhibition in exhibitions" :key="exhibition.project_id" class="mb-3 mx-11 border-b-2 border-b-slate-200 p-2 flex">
      <div class="grow">
        <p class="text-3xl">{{ exhibition.project_name }}
          <div class="inline" 
            :class="{ 'text-red-400': exhibition.sale_flag === '不可售', 'text-green-400': exhibition.sale_flag === '预售中' }">{{ exhibition.sale_flag }}</div>
        </p>
        <p class="text-slate-500">{{ exhibition.venue_name }} ID:{{ exhibition.project_id }} {{ exhibition.start_time }}-{{ exhibition.end_time }}</p>
      </div>
      <div class="flex-none">
        <p class="text-red-400 text-2xl relative right-0 w-fit mr-0 ml-auto" :class="{ 'text-white': exhibition.price_low === 0 }">￥{{ exhibition.price_low / 100 }}-{{ exhibition.price_high / 100 }}</p>
        <!-- <a :href="'https://show.bilibili.com/platform/detail.html?id=' + exhibition.project_id">会展票地址</a> -->
        <button class="right-0 bottom-0 bg-pink-400 text-white font-bold" @click="tiaozhuan(exhibition.project_id)">
          B站会员购
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 inline">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path>
          </svg>
        </button>
        <button class="ml-2 right-0 bottom-0 bg-pink-400 text-white font-bold" @click="project(exhibition.project_id)">
          蹲票
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 inline">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path>
          </svg>
        </button>
      </div>
    </li>
  </ul>
</template>
<style>
p {
  @apply leading-9;
}
</style>