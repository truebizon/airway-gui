<script setup>
  definePageMeta({
    // define middleware as a function
    middleware: [
      function (to, from) {
        const {status} = useAuth();
        console.log(`pages_index get auth status : ${status.value}`);
        if (status.value === 'authenticated') {
          // ログイン後はairwayStatusへリダイレクト
          console.log(`pages_index redirect airwayStatus.`);
          return navigateTo('/airwayStatus');
        }
      }
    ],
  })
</script>
