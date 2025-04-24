<script setup>
const { icon } = defineProps({
  icon: "notification" | "account" | "config",
});
</script>

<template>
  <li class="c-systemSettingListItem">
    <a :class="`e-systemSettingLink-${icon}`" href="#"><slot>ラベル</slot></a>
  </li>
</template>
