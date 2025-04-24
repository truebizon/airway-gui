<script setup>
  import LoginHeader from "~/components/navigation/loginHeader.vue";
  import { ref } from "vue"

  const cookie_role = ref(null);
  const role_type = ref(null);
  const role_123 = 7; // 0111 = role[1,2,3]
  const role_12 = 3; // 0011 = role[1,2]
  const role_13 = 5; // 0101 = role[1,3]
  const role_23 = 6; // 0110 = role[2,3]

  const setRoleMask = async () => {
    // role 取得
    const ownpage_role = ["1","2","3"];
    cookie_role.value = await roleVerification_noncheck();
    if (Object.keys(cookie_role).length == 0) {
      console.error(`selectRole get role error.`);
    } else {
      if (cookie_role.value.roleList != undefined) {
        // role = 1:航路運営者 2:運航事業者 3:関係者
        if (cookie_role.value.roleList.includes("1") &&
            cookie_role.value.roleList.includes("2") &&
            cookie_role.value.roleList.includes("3")) {
          role_type.value = role_123;
        } else if (cookie_role.value.roleList.includes("1") &&
                  cookie_role.value.roleList.includes("2")) {
          role_type.value = role_12;
        }  else if (cookie_role.value.roleList.includes("1") &&
                  cookie_role.value.roleList.includes("3")) {
          role_type.value = role_13;
        }  else if (cookie_role.value.roleList.includes("2") &&
                  cookie_role.value.roleList.includes("3")) {
          role_type.value = role_23;
        } else {
          localStorage.setItem('virtualRole', cookie_role.value.roleList[0]);
          // user role を Localsession に設定後にリダイレクト
          location.href="/airwayStatus";
        }
      } else {
        console.error(`selectRole get role error(invalid role).`);
      }
    }
    return;
  }

  const setLocalStorageRole = (role) => {
    try {
      let role_str = "";
      switch (role) {
        case '1':
          role_str = "1";
          break;
        case '2':
          role_str = "2";
          break;
        case '3':
        default:
          role_str = "3";
          break;
      }
      // 選択されたroleをLocalsession設定後にリダイレクト
      localStorage.setItem('virtualRole', role_str);
      location.href="/airwayStatus";
    } catch (error) {
      console.error(`setLocalStorageRole error(${error})`);
    }
  }

  if (process.client) {
    try {
      setRoleMask();
    }  catch (error) {
      console.error(`setRoleMask error(${error})`);
    }
  }
</script>

<template>
  <!-- グローバルナビゲーション -->
  <LoginHeader />
  <!-- コンテンツ -->
  <main id="main" class="b-pageMain b-login">
    <div class="b-loginForm" v-if="role_type == role_123">
      <input type="button" class="e-button" value="航路運営者" @click="setLocalStorageRole('1')" />
      <input type="button" class="e-button" value="運航事業者" @click="setLocalStorageRole('2')" />
      <input type="button" class="e-button" value="　関係者　" @click="setLocalStorageRole('3')" />
    </div>
    <div class="b-loginForm" v-if="role_type == role_12">
      <input type="button" class="e-button" value="航路運営者" @click="setLocalStorageRole('1')" />
      <input type="button" class="e-button" value="運航事業者" @click="setLocalStorageRole('2')" />
    </div>
    <div class="b-loginForm" v-if="role_type == role_13">
      <input type="button" class="e-button" value="航路運営者" @click="setLocalStorageRole('1')" />
      <input type="button" class="e-button" value="　関係者　" @click="setLocalStorageRole('3')" />
    </div>
    <div class="b-loginForm" v-if="role_type == role_23">
      <input type="button" class="e-button" value="運航事業者" @click="setLocalStorageRole('2')" />
      <input type="button" class="e-button" value="　関係者　" @click="setLocalStorageRole('3')" />
    </div>
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

.e-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0px 16px;
  font-size: 18px;
  font-weight: 500;
  border-radius: 50px;
  background-color: #2c69ff;
  color: #ffffff;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
  position: relative; /* 必要に応じて追加 */
  height: 48px !important;
}

</style>