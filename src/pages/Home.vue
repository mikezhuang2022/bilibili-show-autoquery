<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const url = '/api/ticket/project/listV2?version=134&page=1&pagesize=16&area=440100&filter=&platform=web&p_type=%E5%B1%95%E8%A7%88'
const exhibitions = ref<Array<any>>([])
axios.get(url).then(res => {
  exhibitions.value = res.data.data.result
})
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
        <p class="text-red-400 text-2xl relative right-0 w-fit">￥{{ exhibition.price_low / 100 }}-{{ exhibition.price_high / 100 }}</p>
        <!-- <a :href="'https://show.bilibili.com/platform/detail.html?id=' + exhibition.project_id">会展票地址</a> -->
        <button class="right-0 bottom-0">B站会员购</button>
      </div>
    </li>
  </ul>
</template>