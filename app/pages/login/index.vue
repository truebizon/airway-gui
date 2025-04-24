<script setup>
  import CommonDialog from '~/components/dialogs/CommonDialog.vue';
  import LoginHeader from "~/components/navigation/loginHeader.vue";

  definePageMeta({ auth: false });

  const {signIn, status} = useAuth();

  const userId = ref('');
  const password = ref('');

  const { constants } = useMyConstant();

  // ダイアログ表示フラグ
  const LoginFailedDialogVisible = ref(false);
  const dialogMessage = ref('');

  const login = async (userId, password) => {
    // signin
    await signIn({userId, password}, { callbackUrl: 'login/selectRole'});
    console.log(`LogIn status: ${status.value}`);
    if (status.value == 'unauthenticated') {
      LoginFailedDialogVisible.value = true;
      dialogMessage.value = "ログインに失敗しました。ユーザID、パスワードに誤りがないかご確認ください。";
    }
  }

  onMounted(() => {
    localStorage.setItem('notificationBadge', String(''));
    localStorage.setItem('noticeDB', String(''));
  });
</script>

<template>
  <!-- グローバルナビゲーション -->
  <LoginHeader />
  <!-- コンテンツ -->
  <main id="main" class="b-pageMain b-login">
    <section class="b-loginContent">
      <div class="b-loginForm">
        <h3 class="u-invisible">ログインフォーム</h3>
        <form @submit.prevent="login(userId, password)">
          <div class="c-formItem">
            <label 
              class="e-fieldLabel-login"
              for="loginUserId">
              ユーザー<span lang="en">ID</span>
            </label>
            <input
              id="loginUserId"
              v-model="userId"
              class="e-textField-login"
              required
            />
          </div>
          <div class="c-formItem">
            <label for="loginPassword" class="e-fieldLabel-login">パスワード</label>
            <input
              v-model="password"
              id="loginPassword"
              class="e-textField-login"
              type="password"
              required
            />
          </div>
          <input type="submit" class="e-button-login" value="ログイン" />
        </form>
      </div>
    </section>
    <!-- ログイン失敗モーダルダイアログ -->
    <CommonDialog
      v-model:dialog-visible="LoginFailedDialogVisible"
      :message="dialogMessage"
      :dialog-type="constants.dialogType.error"
    />
  </main>
</template>

<style>
.e-loginTitle{
  color:#AF0075;
  font-size: 36px;
  top: 76px;
  left: 32px;
  width: 236px;
  height: 82px;
  border: 1px solid var(--unnamed-color-707070);
  opacity: 1;
  padding: 1rem;
}
</style>