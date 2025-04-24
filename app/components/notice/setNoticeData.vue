  <script setup>
import { useGetNotice } from '@/composables/getNoticeMqtt'
  
  try {
    const { data } = useGetNotice();
  console.log("data4",data);
} catch (error) {
  console.log(error);
}
  
  </script>
  
  
  <template>
  </template>
    
  <style scoped>
  </style>
    