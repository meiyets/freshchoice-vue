<template>
  <div class="register">
    <el-form
      ref="registerRef"
      :model="registerForm"
      :rules="registerRules"
      class="register-form"
    >
      <h3 class="title">鲜果优选--注册</h3>
      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
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
          v-model="registerForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix
            ><svg-icon icon-class="password" class="el-input__icon input-icon"
          /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix
            ><svg-icon icon-class="password" class="el-input__icon input-icon"
          /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          size="large"
          v-model="registerForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix
            ><svg-icon icon-class="validCode" class="el-input__icon input-icon"
          /></template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" @click="getCode" class="register-code-img" />
        </div>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width: 100%"
          @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right">
          <router-link class="link-type" :to="'/login'"
            >使用已有账户登录</router-link
          >
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>Copyright © 2018-2023 freshchoice.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus";
import { getCodeImg, register } from "@/api/login";

const title = import.meta.env.VITE_APP_TITLE;
const router = useRouter();
const { proxy } = getCurrentInstance();

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: "",
});

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    {
      min: 2,
      max: 20,
      message: "用户账号长度必须介于 2 和 20 之间",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    {
      min: 5,
      max: 20,
      message: "用户密码长度必须介于 5 和 20 之间",
      trigger: "blur",
    },
    {
      pattern: /^[^<>"'|\\]+$/,
      message: "不能包含非法字符：< > \" ' \\\ |",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" },
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
};

const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);

function handleRegister() {
  proxy.$refs.registerRef.validate((valid) => {
    if (valid) {
      loading.value = true;
      register(registerForm.value)
        .then((res) => {
          const username = registerForm.value.username;
          ElMessageBox.alert(
            "<font color='red'>恭喜你，您的账号 " +
              username +
              " 注册成功！</font>",
            "系统提示",
            {
              dangerouslyUseHTMLString: true,
              type: "success",
            }
          )
            .then(() => {
              router.push("/login");
            })
            .catch(() => {});
        })
        .catch(() => {
          loading.value = false;
          if (captchaEnabled) {
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
      registerForm.value.uuid = res.uuid;
    }
  });
}

getCode();
</script>

<style lang="scss" scoped>
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

.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 使用vh确保全屏 */
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

.register-form {
  border-radius: 15px; /* 增加圆角 */
  background: rgba(255, 255, 255, 0.98); /* 调整表单背景为更透明白色 */
  width: 450px; /* 调整表单宽度 */
  max-width: 90%; /* 增加响应式 */
  padding: 50px; /* 增加内边距 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); /* 调整阴影 */
  z-index: 2;
  position: relative;
  animation: fadeInScale 0.6s ease-out; /* 添加进入动画 */

  .title {
    margin: 0px auto 50px auto; /* 调整标题下边距 */
    text-align: center;
    color: #333;
    font-size: 32px; /* 调整标题字号 */
    font-weight: bold;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15); /* 调整文字阴影 */
  }

  .el-input {
    height: 55px; /* 调整输入框高度 */
    margin-bottom: 25px; /* 增加输入框间距 */
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
    margin-left: 18px; /* 调整图标左侧间距 */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606266; /* 图标颜色 */
  }

  .el-form-item {
    margin-bottom: 30px; /* 调整表单项间距 */
  }

  .el-checkbox {
    margin: 0px 0px 30px 0px; /* 调整复选框间距 */
    color: #606266;
    span.el-checkbox__label {
      font-size: 15px; /* 调整复选框文字字号 */
    }
  }

  .el-button {
    height: 55px; /* 调整按钮高度 */
    font-size: 20px; /* 调整按钮字号 */
    letter-spacing: 1.5px; /* 增加文字间距 */
    font-weight: bold;
    border-radius: 8px; /* 按钮圆角 */
    transition: all 0.3s ease; /* 添加过渡效果 */
    background-color: #67c23a; /* 绿色主题 */
    border-color: #67c23a;

    &:hover {
      background-color: #85ce61; /* 悬停时颜色变浅 */
      border-color: #85ce61;
      opacity: 1; /* 悬停时保持不透明 */
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); /* 悬停时阴影 */
      transform: translateY(-2px); /* 悬停时微移 */
    }

    &:active {
      transform: translateY(0); /* 点击时恢复位置 */
    }
  }

  .link-type {
    margin-top: 20px; /* 调整注册链接上边距 */
    font-size: 15px;
    text-align: center;
    a {
      color: #409eff;
      text-decoration: none;
      transition: color 0.3s ease; /* 添加过渡效果 */

      &:hover {
        text-decoration: underline;
        color: #66b1ff; /* 悬停时颜色变浅 */
      }
    }
  }
}

.register-tip {
  font-size: 14px; /* 调整提示文字字号 */
  text-align: center;
  color: #bfbfbf;
  margin-top: 25px; /* 调整提示文字上边距 */
}

.register-code {
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

.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.95); /* 调整底部文字颜色和透明度 */
  font-family: Arial;
  font-size: 14px; /* 调整底部文字字号 */
  letter-spacing: 1.2px; /* 增加文字间距 */
  z-index: 1;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15); /* 调整底部文字阴影 */
}

.register-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
