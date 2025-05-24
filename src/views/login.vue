<template>
  <div class="login">
    <el-form
      ref="loginRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form animated fadeInScale"
    >
      <h3 class="title">鲜果优选--登录</h3>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix
            ><svg-icon icon-class="user" class="el-input__icon input-icon"
          /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix
            ><svg-icon icon-class="password" class="el-input__icon input-icon"
          /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix
            ><svg-icon icon-class="validCode" class="el-input__icon input-icon"
          /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
      </el-form-item>
      <el-checkbox
        v-model="loginForm.rememberMe"
        style="margin: 0px 0px 25px 0px"
        >记住密码</el-checkbox
      >
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width: 100%"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right" v-if="register">
          <router-link class="link-type" :to="'/register'"
            >立即注册</router-link
          >
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2023 freshchoice.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from "@/store/modules/user";

const title = import.meta.env.VITE_APP_TITLE;
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: "",
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(true);
const redirect = ref(undefined);

watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true }
);

/** 处理登录逻辑 */
function handleLogin() {
  // 表单验证
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), {
          expires: 30,
        });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      // userStore为外部导入组件
      userStore
        .login(loginForm.value)
        .then(() => {
          // 获取路由查询参数
          const query = route.query;
          const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
            if (cur !== "redirect") {
              acc[cur] = query[cur];
            }
            return acc;
          }, {});
          // 登陆成功后，根据redirect参数或默认跳转到首页
          router.push({ path: redirect.value || "/", query: otherQueryParams });
        })
        .catch(() => {
          loading.value = false;
          // 重新获取验证码
          if (captchaEnabled.value) {
            getCode();
          }
        });
    }
  });
}

function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password:
      password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  };
}

getCode();
getCookie();
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 调整高度 */
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden; /* 防止动画溢出 */

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 调整遮罩透明度 */
    z-index: 1;
  }
}

.login-form {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.98); /* 调整表单背景透明度 */
  width: 90%; /* 调整表单宽度 */
  max-width: 450px; /* 设置最大宽度 */
  padding: 40px; /* 调整内边距 */
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.4); /* 调整阴影 */
  z-index: 2;
  position: relative;
  animation-duration: 0.8s; /* 动画持续时间 */

  .title {
    margin: 0px auto 40px auto; /* 调整标题下边距 */
    text-align: center;
    color: #333; /* 调整标题颜色 */
    font-size: 30px; /* 调整标题字号 */
    font-weight: bold;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15); /* 添加文字阴影 */
  }

  .el-input {
    height: 55px; /* 调整输入框高度 */
    margin-bottom: 20px; /* 增加输入框间距 */
    input {
      height: 55px; /* 调整输入框内部高度 */
      padding-left: 50px; /* 调整文本左侧内边距 */
      background-color: rgba(255, 255, 255, 0.9); /* 输入框背景 */
      border: 1px solid #dcdfe6; /* 输入框边框 */
      border-radius: 8px; /* 输入框圆角 */
      transition: border-color 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */

      &:focus {
        border-color: #409eff; /* 聚焦时边框颜色 */
        box-shadow: 0 0 8px rgba(64, 158, 255, 0.2); /* 聚焦时阴影 */
      }
    }
  }

  .input-icon {
    height: 55px; /* 调整图标高度 */
    width: 30px; /* 调整图标宽度 */
    margin-left: 15px; /* 调整图标左侧间距 */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606266; /* 图标颜色 */
  }

  .el-form-item {
    margin-bottom: 25px; /* 调整表单项间距 */
  }

  .el-checkbox {
    margin: 0px 0px 25px 0px; /* 调整复选框间距 */
    color: #606266;
    span.el-checkbox__label {
      font-size: 14px; /* 调整复选框文字字号 */
    }
  }

  .el-button {
    height: 55px; /* 调整按钮高度 */
    font-size: 18px; /* 调整按钮字号 */
    letter-spacing: 1px;
    font-weight: bold; /* 按钮文字加粗 */
    border-radius: 8px; /* 按钮圆角 */
    transition: all 0.3s ease; /* 添加过渡效果 */
    background-color: #409eff; /* 按钮背景颜色 */
    border-color: #409eff; /* 按钮边框颜色 */

    &:hover {
      background-color: #66b1ff; /* 悬停时背景颜色 */
      border-color: #66b1ff; /* 悬停时边框颜色 */
      transform: translateY(-2px); /* 悬停时向上移动 */
      box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3); /* 悬停时阴影 */
    }

    &:active {
      transform: translateY(0); /* 点击时恢复位置 */
      box-shadow: none; /* 点击时移除阴影 */
    }
  }

  .link-type {
    margin-top: 15px; /* 调整注册链接上边距 */
    font-size: 14px;
    text-align: center; /* 注册链接居中 */
    a {
      color: #409eff; /* 注册链接颜色 */
      text-decoration: none; /* 移除下划线 */
      transition: color 0.3s ease; /* 添加过渡效果 */

      &:hover {
        color: #66b1ff; /* 悬停时颜色 */
        text-decoration: underline; /* 悬停时添加下划线 */
      }
    }
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
  margin-top: 20px; /* 调整提示文字上边距 */
}

.login-code {
  width: 35%;
  height: 55px; /* 调整验证码区域高度 */
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
    height: 100%;
    border-radius: 8px; /* 验证码图片圆角 */
    border: 1px solid #dcdfe6; /* 验证码图片边框 */
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.95); /* 调整底部文字颜色和透明度 */
  font-family: Arial;
  font-size: 14px; /* 调整底部文字字号 */
  letter-spacing: 1px;
  z-index: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* 添加底部文字阴影 */
}

.login-code-img {
  height: 40px;
  padding-left: 12px;
}

/* 动画效果 */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.fadeInScale {
  animation-name: fadeInScale;
}
</style>
