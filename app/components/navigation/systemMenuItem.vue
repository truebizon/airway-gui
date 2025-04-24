<script setup>
const { icon, link } = defineProps({
  icon:
    "flightStatus" |
    "route" |
    "create" |
    "reservation" |
    "aircraft" |
    "port" |
    "occulusion" |
    "dips" |
    "notification" |
    "login",
  link: "#"
});
</script>

<template>
  <!-- 選択状態 -->
  <!-- 通常状態 -->
  <li class="c-systemMenuItem">
    <a :class="`e-systemMenuItem-${icon}`" :href="link" style="z-index: 99"><slot>ラベル</slot></a>
  </li>
</template>
