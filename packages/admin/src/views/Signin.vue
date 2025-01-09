<template>
  <div class="signin-container radial-gradient">
    <context-holder />
    <header class="header">
      <div class="logo-container">
        <a href="/" class="logo-link">
          <img src="@/assets/logo.svg" />
          <div class="app-name">{{ t('common.appname') }}</div>
        </a>
      </div>

      <div class="language-selector">
        <a-dropdown>
          <a @click.prevent> <Icon name="global" /></a>
          <template #overlay>
            <a-menu @click="onChangeLocale">
              <a-menu-item key="zh-CN"><a-tag color="blue">ZH</a-tag>简体中文</a-menu-item>
              <a-menu-item key="en"><a-tag color="blue">EN</a-tag>English</a-menu-item>
              <a-menu-item key="ar"><a-tag color="blue">AR</a-tag>العربية</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <div class="theme-selector">
        <Icon name="theme-light" class="icon light" @click="store.changeTheme('light')" :class="{ active: store.theme === 'light' }"></Icon>
        <Icon name="theme-dark" class="icon dark" @click="store.changeTheme('dark')" :class="{ active: store.theme === 'dark' }"></Icon>
        <Icon name="theme-system" class="icon system" @click="store.changeTheme('system')" :class="{ active: store.theme === 'system' }"></Icon>
      </div>
    </header>
    <section class="form-section" v-if="state.method === 'pwd'">
      <a-form :model="signinForm" @finish="handleSignin" autocomplete="off" :label-col="{ span: 6 }">
        <h3 class="form-title">{{ t('signin.title') }}</h3>
        <a-form-item :label="t('signin.accountname')" name="accountname" :rules="[{ required: true, message: t('signin.peya') }]">
          <a-input autocomplete="off" size="large" large v-model:value="signinForm.accountname" />
          <!-- placeholder="请填写用于登录的邮箱" -->
        </a-form-item>
        <a-form-item :label="t('signin.password')" name="password" :rules="[{ required: true, message: t('signin.peypwd') }]">
          <a-input-password autocomplete="new-password" size="large" v-model:value="signinForm.password" />
          <!-- placeholder="密码" -->
        </a-form-item>
        <a-form-item class="form-buttons">
          <a-button type="primary" :loading="state.loading" html-type="submit" class="primary-btn">
            {{ t('signin.signin') }}
          </a-button>
          <a href="####" @click="state.method = 'resetPwd'" class="link-btn">{{ t('signin.forgotpwd') }}</a>
        </a-form-item>
      </a-form>
      <!-- <div style="margin: 0 0 0 90px; font-size: 12px">30天内没有访问将重新登录</div> -->
    </section>

    <section class="form-section" v-if="state.method == 'totp'">
      <div class="verify-container">
        <h3 class="verify-title">使用动态口令App进行两步验证</h3>
        <div class="verify-desc">请查看动态口令App中的6位动态数字口令，并在下面的的框中输入</div>
        <div class="verify-input-wrapper">
          <VerifyInput v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA" />
        </div>
        <div class="other-methods">
          <template v-if="state.methodBit == 7"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a> </template>
          <template v-if="state.methodBit == 5"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a></template>
          <template v-if="state.methodBit == 6"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a></template>
        </div>
      </div>
    </section>

    <section class="form-section" v-if="state.method == 'email'">
      <h3 class="section-title">使用电子邮件进行两步验证</h3>
      <div class="flex items-center justify-center" style="margin-top: 40px">
        <h4 class="ml-5 p-0 text-lg/none">{{ helper.obfuscate('email', state.email) }}</h4>
        <div v-if="emailState.isCountDown">{{ emailState.countDownTime }}秒后可重新发送</div>
        <a-button type="primary" v-else="!emailState.isCountDown" @click="handleSendEmail">发送验证码</a-button>
      </div>
      <div v-if="emailState.isSent" style="margin: 30px 0">
        <div class="m-3 text-sm/normal text-primary">一封验证邮件已经发送到你的邮箱，请查看邮件中的6位数字验证码，并在下面的的框中输入</div>
        <VerifyInput style="width: 100%" class="flex items-center justify-center" v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
      </div>
      <div class="section-title">
        <template v-if="state.methodBit == 7"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a> </template>
        <template v-else-if="state.methodBit == 6"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a> </template>
        <template v-else-if="state.methodBit == 3"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('phone')">手机短信验证</a> </template>
      </div>
    </section>

    <section class="form-section" v-if="state.method == 'phone'">
      <h3 class="section-title">使用手机短信进行两步验证</h3>
      <div class="flex items-center justify-center" style="margin-top: 40px">
        <h4 class="ml-5 p-0 text-lg/none">{{ helper.obfuscate('phone', state.phone) }}</h4>
        <div v-if="phoneState.isCountDown">{{ phoneState.countDownTime }}秒后可重新发送</div>
        <a-button type="primary" v-else="!phoneState.isCountDown" @click="handleSendPhone">发送验证码</a-button>
      </div>
      <div v-if="phoneState.isSent" style="margin: 30px 0">
        <div class="m-3 text-sm/normal text-primary">已向你的手机发送了一条验证短信，请查看手机短信中的6位数字验证码，并在下面的的框中输入</div>
        <VerifyInput style="width: 100%" class="flex items-center justify-center" v-model:value="state.code" :autofocus="true" :digits="6" @finish="handleSignin2FA"></VerifyInput>
      </div>
      <div class="section-title">
        <template v-if="state.methodBit == 7"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a>&nbsp | &nbsp<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a> </template>
        <template v-else-if="state.methodBit == 5"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('totp')">动态口令App验证(推荐)</a> </template>
        <template v-else-if="state.methodBit == 3"> 使用其他方式验证：<a href="####" @click="handleChangeMethod('email')">电子邮件验证</a> </template>
      </div>
    </section>

    <section class="form-section" v-if="state.method == 'initPwd'">
      <h3 class="section-title">需要更新密码</h3>
      <div class="m-3 text-sm/normal text-primary">首次登录或长时间没有修改密码，需要重新设置密码</div>
      <a-form ref="pwdFormRef" style="margin-top: 30px" :model="pwdForm" :rules="pwdRules" :label-col="{ span: 6 }" @finish="handleInitPwd">
        <a-form-item has-feedback :label="t('signin.newpwd')" name="newPassword">
          <PasswordStrength v-if="pwdForm.newPassword" v-model:value="state.strength" :password="pwdForm.newPassword" style="position: absolute; top: -20px"></PasswordStrength>
          <a-input-password autocomplete="new-password" size="large" v-model:value="pwdForm.newPassword" />
        </a-form-item>
        <a-form-item has-feedback :label="t('signin.cfpwd')" name="confirm">
          <a-input-password autocomplete="new-password" size="large" v-model:value="pwdForm.confirm" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 6 }">
          <a-button type="ghost" @click="handleResetPwdForm">{{ t('common.reset') }}</a-button>
          <a-button type="primary" html-type="submit" style="margin-left: 10px">{{ t('common.submit') }}</a-button>
        </a-form-item>
      </a-form>
    </section>

    <section class="form-section" v-if="state.method == 'resetPwd'">
      <h3 class="section-title">重置密码</h3>
      使用以下方式接收临时密码，使用临时密码登录后，再设置新的密码。
      <a-form-item>
        <a-radio-group v-model:value="state.resetPwdMethod">
          <a-radio value="email">{{ t('signin.email') }}</a-radio>
          <a-radio value="phone">{{ t('signin.phone') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="state.resetPwdMethod">
        <a-input size="large" placeholder="请输入与账号绑定的电子邮件地址" v-if="state.resetPwdMethod === 'email'"></a-input>
        <a-input size="large" placeholder="请输入与账号绑定的手机号" v-if="state.resetPwdMethod === 'phone'"></a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleSendTempPwd">{{ t('common.send') }}</a-button>
      </a-form-item>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { changeLocale } from '../js/i18n'
import { useStore } from '@/stores/stores'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
import helper from '../js/helper'
import VerifyInput from '../components/VerifyInput.vue'
import API from '../api/API'
import PasswordStrength from '../components/PasswordStrength.vue'

const store = useStore()
const router = useRouter()
const state = reactive({
  loading: false,
  activationUrl: '',
  code: '',
  method: 'pwd',
  email: '',
  phone: '',
  areacode: '',
  accountid: '',
  strength: 0,
  enable2FA: true,
  methodBit: 0,
  resetPwdMethod: ''
})
const pwdFormRef = ref(null)

const vPwd = async (_rule, value) => {
  if (value === signinForm.password) {
    return Promise.reject(t('signin.samepwd'))
  } else if (value === '') {
    return Promise.reject(t('signin.pep'))
  } else if (state.strength < 2) {
    return Promise.reject()
  } else if (pwdForm.confirm !== '') {
    pwdFormRef.value.validateFields('confirm')
  }
  return Promise.resolve()
}

const vConfirmPwd = async (_rule, value) => {
  if (value === '') {
    return Promise.reject(t('signin.pepa'))
  } else if (value !== pwdForm.newPassword) {
    return Promise.reject(t('signin.pnm'))
  } else {
    return Promise.resolve()
  }
}

const pwdForm = reactive({
  newPassword: '',
  confirm: ''
})

const pwdRules = {
  newPassword: [{ validator: vPwd, trigger: 'change' }],
  confirm: [{ validator: vConfirmPwd, trigger: 'change' }]
}

const emailState = reactive({
  isSent: false,
  isCountDown: false,
  countDownTime: 0
})

const phoneState = reactive({
  isSent: false,
  isCountDown: false,
  countDownTime: 0
})

const signinForm = reactive({
  accountname: '',
  password: ''
})

const totpCode = ref('')
const isVerifyError = ref(false)
let totpSecret = ''

const [messageApi, contextHolder] = message.useMessage()

const handleChangeMethod = (method) => {
  state.method = method
}

const onChangeLocale = ({ key }) => {
  changeLocale(key)
}

const handleSignin = async (values) => {
  state.loading = true
  try {
    let data = await API.account.signin(values)
    state.accountid = data._id
    state.email = data.email
    state.areacode = data.areacode
    state.phone = data.phone
    state.enable2FA = data.enable2FA
    state.totpSecret = data.totpSecret
    state.methodBit = state.methodBit | (data.phone ? 1 : 0) | (data.email ? 2 : 0) | (data.totpSecret ? 4 : 0)
    console.log(data)

    // 未激活，跳转去激活
    if (!data.initPwd) {
      state.method = 'initPwd'
    }
    // 如果不需要两步验证
    else if (!data.enable2FA) {
      console.log('no 2da', data)
      helper.setToken(data)
      router.replace('/')
    }
    // 如果需要两步验证
    else {
      //TODO 根据已有的验证方式跳转：优先级：totp > phone > email
      if (state.methodBit & 4) {
        state.method = 'totp'
      } else if (state.methodBit & 1) {
        state.method = 'phone'
      } else if (state.methodBit & 2) {
        state.method = 'email'
      }
    }
  } catch (err) {
    if (err.status == 400) {
      messageApi.error(t('signin.error'))
    } else {
      messageApi.error('系统内部错误')
    }
  } finally {
    state.loading = false
  }
}

const handleSignin2FA = async (callback) => {
  try {
    console.log('code', state.code)
    let data = await API.account.signin2FA({ accountname: signinForm.accountname, password: signinForm.password, authMethod: state.method, code: state.code })
    helper.setToken(data)
    callback(true)
    emailState.isSent = false
    emailState.isCountDown = false
    phoneState.isSent = false
    phoneState.isCountDown = false
    localStorage.removeItem('phoneCDT')
    localStorage.removeItem('emailCDT')
    clearInterval(emailInterval)
    clearInterval(phoneInterval)
    router.replace('/')
  } catch (err) {
    if (err.status == 400) {
      messageApi.error('动态口令输入错误')
      callback(false)
    } else {
      messageApi.error('系统内部错误')
      callback(false)
    }
  }
}

const handleSendEmail = async () => {
  try {
    let result = await API.verification.sendCodeByEmail(state.email, state.accountid)
    if (result) {
      emailState.isSent = true
      countDown(emailState, emailInterval, 'email')
    }
  } catch (err) {
    if (err.data.code === 102) {
      messageApi.warning('发送太频繁，请稍后再试')
    } else {
      messageApi.error('系统内部错误')
    }
  }
}

const handleSendPhone = async () => {
  try {
    let result = await API.verification.sendCodeBySMS(state.areacode, state.phone, state.accountid)
    if (result) {
      phoneState.isSent = true
      countDown(phoneState, phoneInterval, 'phone')
    }
  } catch (err) {
    if (err.data.code === 104) {
      messageApi.warning('发送太频繁，请稍后再试')
    } else {
      messageApi.error('系统内部错误')
    }
  }
}

const handleResetPwdForm = () => {
  pwdFormRef.value.resetFields()
}

const handleInitPwd = async () => {
  try {
    const resp = await API.account.initPassword(signinForm.password, pwdForm.newPassword, state.accountid)
    if (resp.result) {
      messageApi.success('密码更新成功，请重新登录!')
      pwdFormRef.value.resetFields()
      state.method = 'pwd'
    } else {
      messageApi.error('初始密码错误，请重试')
    }
  } catch (err) {
    console.log(err)
    return
  }
}

// 倒计时
let emailInterval,
  phoneInterval = undefined

const countDown = (state, intv, type) => {
  let startTime = localStorage.getItem(type + 'CDT')
  let nowTime = new Date().getTime()
  if (startTime) {
    let surplus = 60 - parseInt((nowTime - startTime) / 1000, 10)
    state.countDownTime = surplus <= 0 ? 0 : surplus
  } else {
    state.countDownTime = 60
    localStorage.setItem(type + 'CDT', nowTime)
  }
  state.isCountDown = true
  intv = setInterval(() => {
    state.countDownTime--
    if (state.countDownTime <= 0) {
      localStorage.removeItem(type + 'CDT')
      clearInterval(intv)
      intv = undefined
      state.countDownTime = 60
      state.isCountDown = false
    }
  }, 1000)
}

if (localStorage.getItem('emailCDT')) {
  emailState.isSent = true
  countDown(emailState, emailInterval, 'email')
}

if (localStorage.getItem('phoneCDT')) {
  phoneState.isSent = true
  countDown(phoneState, phoneInterval, 'phone')
}
</script>

<style lang="scss" scoped>
.signin-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  align-items: flex-start;
  justify-content: center;
}

.header {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  height: 64px;
  align-items: center;
  padding: 0 12px;
  background-color: #ffffff40;
  gap: 20px;

  .logo-container {
    flex-shrink: 0;
    flex-grow: 1;
    white-space: nowrap;
    padding: 0 20px;

    .logo-link {
      display: flex;

      img {
        margin-right: 16px;
        height: 24px;
        width: 24px;
      }

      .app-name {
        font-size: 1.5em;
        line-height: 1;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  .language-selector {
    margin: 0 12px;
  }

  .theme-selector {
    margin-right: 12px;
    display: none;
    cursor: pointer;
    flex-wrap: nowrap;
    color: var(--text-tertiary);
    gap: 12px;
    @media (min-width: 768px) {
      display: flex;
    }

    .icon {
      &:hover {
        color: var(--c-brand);
      }
      &.light {
        color: var(--c-orange);
      }
      &.dark {
        color: var(--c-blue);
      }
      &.system {
        color: var(--c-black);
      }
    }
  }
}

.form-section {
  margin-top: 240px;
  display: block;
  width: 500px;
  border-radius: 4px;
  padding: 40px;
  background-color: #ffffffa0;
  backdrop-filter: blur(8px);

  .section-title {
    margin: 8px;
    display: flex;
    align-items: center;
    font-size: 1.125em;
    font-weight: 600;
    color: var(--text-primary);
  }
  .section-content {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40px;
  }

  // 验证相关样式
  .verify-container {
    margin-top: 40px;

    .verify-title {
      font-size: 1.125em;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      margin: 8px;
    }

    .verify-desc {
      font-size: 0.875em;
      line-height: normal;
      color: var(--text-primary);
      margin: 12px;
    }

    .verify-input-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  // 发送验证码区域
  .send-code-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40px;

    .contact-info {
      margin-left: 20px;
      padding: 0;
      font-size: 1.125em;
      line-height: 1;
    }

    .countdown {
      margin-left: 12px;
    }
  }

  // 其他验证方式
  .other-methods {
    margin: 12px;
    font-size: 0.875em;
    line-height: normal;
    color: var(--text-primary);
    margin-top: 40px;

    a {
      color: var(--c-brand);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  // 密码重置表单
  .pwd-reset-form {
    margin-top: 30px;

    .pwd-strength {
      position: absolute;
      top: -20px;
    }
  }

  // 重置密码说明
  .reset-pwd-desc {
    margin: 12px 0;
    font-size: 0.875em;
    line-height: normal;
    color: var(--text-primary);
  }

  // 表单按钮
  .form-buttons {
    margin-left: 90px;

    .primary-btn {
      margin-right: 20px;
    }

    .link-btn {
      color: var(--c-brand);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

[data-theme='light'] {
  .radial-gradient {
    --bg-main-transparent: rgba(255, 255, 255, 0.5);
    --bg-shadow: rgba(0, 0, 0, 0.07);
    background-color: #a0a4a8;
    background-image: radial-gradient(closest-side, rgb(135, 208, 221), rgba(235, 105, 78, 0)), radial-gradient(closest-side, rgb(7, 62, 92), rgba(243, 11, 164, 0)), radial-gradient(closest-side, rgb(30, 5, 82), rgba(102, 8, 126, 0)), radial-gradient(closest-side, rgb(195, 111, 0), rgba(170, 142, 245, 0));
    background-size:
      130vw 130vh,
      120vw 120vh,
      100vw 150vh,
      120vw 130vh;
    background-position:
      -80vw -80vh,
      30vw -20vh,
      -20vw 20vh,
      30vw 20vh;
    background-repeat: no-repeat;
    animation: 15s moiveAnimation infinite;
  }
}

[data-theme='dark'] {
  .radial-gradient {
    --bg-main-transparent: rgba(0, 0, 0, 0.2);
    --bg-shadow: rgba(0, 0, 0, 0.07);
    background-color: #443f3f;
    background-image: radial-gradient(closest-side, rgb(7, 46, 66), rgba(235, 105, 78, 0)), radial-gradient(closest-side, rgb(67, 0, 77), rgba(243, 11, 164, 0)), radial-gradient(closest-side, rgb(53, 14, 145), rgba(254, 234, 131, 0)), radial-gradient(closest-side, rgb(89, 50, 0), rgba(170, 142, 245, 0));
    background-size:
      130vw 130vh,
      120vw 120vh,
      100vw 150vh,
      120vw 130vh;
    background-position:
      -80vw -80vh,
      30vw -20vh,
      -20vw 20vh,
      30vw 20vh;
    background-repeat: no-repeat;
    animation: 15s moiveAnimation infinite;
  }
}

@keyframes moiveAnimation {
  0%,
  100% {
    background-size:
      130vw 130vh,
      120vw 120vh,
      100vw 150vh,
      120vw 130vh;
    background-position:
      -80vw -80vh,
      30vw -20vh,
      -20vw 20vh,
      30vw 20vh;
  }
  25% {
    background-size:
      120vw 120vh,
      130vw 150vh,
      130vw 120vh,
      100vw 110vh;
    background-position:
      -30vw -30vh,
      40vw -10vh,
      0vw 10vh,
      -10vw 20vh;
  }
  50% {
    background-size:
      130vw 130vh,
      140vw 100vh,
      100vw 150vh,
      90vw 110vh;
    background-position:
      10vw -60vh,
      20vw 10vh,
      10vw 30vh,
      10vw -20vh;
  }
  75% {
    background-size:
      140vw 140vh,
      100vw 130vh,
      100vw 150vh,
      130vw 110vh;
    background-position:
      -70vw -70vh,
      0vw -10vh,
      30vw -20vh,
      20vw 30vh;
  }
}
</style>
