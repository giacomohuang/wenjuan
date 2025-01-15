<template>
  <context-holder />
  <div class="main" v-show="!globalLoading">
    <a-card :title="t('my.authentication.pwd')">
      <template #extra>
        <a-button @click.stop="state.toggleChangePwd = !state.toggleChangePwd">{{ state.toggleChangePwd ? t('my.authentication.hide') : t('my.authentication.cpwd') }}</a-button>
      </template>
      <div class="tips">{{ t('my.authentication.syaeyps') }}</div>
      <div v-if="state.toggleChangePwd" class="content">
        <a-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }" @validate="handlePwdValidate" @finish="handleUpdatePwd">
          <a-form-item has-feedback :label="t('my.authentication.oldpwd')" name="oldPassword">
            <a-input-password v-model:value="pwdForm.oldPassword" autocomplete="new-password" />
          </a-form-item>
          <a-form-item has-feedback :label="t('my.authentication.newpwd')" name="newPassword">
            <PasswordStrength v-show="pwdForm.newPassword" v-model:value="state.strength" :password="pwdForm.newPassword"></PasswordStrength>
            <a-input-password v-model:value="pwdForm.newPassword" autocomplete="new-password" />
          </a-form-item>
          <a-form-item has-feedback :label="t('my.authentication.cfpwd')" name="confirmPassword">
            <a-input-password v-model:value="pwdForm.confirmPassword" autocomplete="new-password" />
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 6 }">
            <a-button type="ghost" @click="handleResetPwdForm">{{ t('common.reset') }}</a-button>
            <a-button type="primary" html-type="submit" style="margin-left: 10px">{{ t('common.submit') }}</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
    <a-card :title="t('my.authentication.mobi')">
      <div class="tips">{{ t('my.authentication.enhphone') }}</div>
      <div class="item">
        <label>{{ phoneForm.phone ? (phoneForm.areacode ? phoneForm.areacode + ' ' : '') + helper.obfuscate('phone', phoneForm.phone) : t('my.authentication.notset') }}</label>
        <a-button @click="state.setPhoneVisible = true">{{ phoneForm.phone ? t('my.authentication.edit') : t('my.authentication.set') }}</a-button>
      </div>
      <a-modal v-model:open="state.setPhoneVisible" :title="phoneForm.phone ? t('my.authentication.editphone') : t('my.authentication.setphone')" :footer="null" @cancel="handleCancelSet" width="530px">
        <a-form style="margin-top: 40px" ref="phoneFormRef" layout="inline" :model="phoneForm">
          <a-form-item :label="t('my.authentication.phonead')">
            <a-select show-search v-model:value="phoneForm.areacodeNew" style="width: 100px" :placeholder="t('my.authentication.areacode')" allowClear :dropdown-match-select-width="false">
              <a-select-option v-for="(item, index) in areaCode" :key="index" :value="item.code">{{ item.code }}({{ item[locale] }})</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item has-feedback name="phoneNew" :rules="phoneRules">
            <a-input v-model:value="phoneForm.phoneNew" style="width: 140px" type="tel" />
          </a-form-item>
          <a-form-item>
            <a-button @click="handleSendSMS" v-if="!phoneState.isCountDown" :loading="state.loading" class="resend" type="link">{{ t('my.authentication.svcode') }}</a-button>
            <span class="resend resend-hint" v-if="phoneState.isCountDown">{{ t('my.authentication.resendin', phoneState.countDownTime) }}</span>
          </a-form-item>
        </a-form>
        <div class="flex-item-c verifycode flex-col" v-if="phoneState.isSend">
          <div class="hint">{{ t('my.authentication.rsvphone') }}</div>
          <VerifyInput v-model="phoneState.verifyCode" :autofocus="true" :digits="6" @finish="handleUpdatePhone"></VerifyInput>
        </div>
      </a-modal>
    </a-card>
    <a-card :title="t('my.authentication.email')">
      <div class="tips">{{ t('my.authentication.enhemail') }}</div>
      <div class="item">
        <label>{{ emailForm.email ? helper.obfuscate('email', emailForm.email) : t('my.authentication.notset') }}</label>
        <a-button @click="state.setEmailVisible = true">{{ emailForm.email ? t('my.authentication.edit') : t('my.authentication.set') }}</a-button>
      </div>
      <a-modal v-model:open="state.setEmailVisible" :title="emailForm.email ? t('my.authentication.editemail') : t('my.authentication.setemail')" :footer="null" @cancel="handleCancelSet">
        <a-form style="margin-top: 40px" ref="emailFormRef" :model="emailForm" layout="inline">
          <a-form-item has-feedback :label="t('my.authentication.emailad')" name="emailNew" :rules="emailRules">
            <a-input v-model:value="emailForm.emailNew" />
          </a-form-item>
          <a-form-item>
            <a-button @click="handleSendEmail" v-if="!emailState.isCountDown" :loading="state.loading" type="link" class="resend">{{ t('my.authentication.svcode') }}</a-button>
            <span class="resend resend-hint" v-if="emailState.isCountDown">{{ t('my.authentication.resendin', emailState.countDownTime) }}</span>
          </a-form-item>
        </a-form>
        <div class="verifycode" v-if="emailState.isSend">
          <div class="hint">{{ t('my.authentication.rsvemail') }}</div>
          <VerifyInput v-model="emailState.verifyCode" :autofocus="true" :digits="6" @finish="handleUpdateEmail"></VerifyInput>
        </div>
      </a-modal>
    </a-card>
    <a-card :title="t('my.authentication.totp')">
      <div class="tips">{{ t('my.authentication.enhtotp') }}</div>
      <div class="item">
        <label>{{ totpForm.totpSecret ? t('my.authentication.havset') : t('my.authentication.notset') }}</label>
        <a-button @click="handleGenerateTotpSecret">{{ totpForm.totpSecret ? t('my.authentication.edit') : t('my.authentication.set') }}</a-button>
      </div>
      <a-modal v-model:open="state.setTotpVisible" :title="t('my.authentication.settotp')" :footer="null" @cancel="handleCancelSet" width="500px">
        <div class="step">
          <div class="title"><span class="badage">1</span>{{ t('my.authentication.scanQRCode') }}</div>
          <div class="hint">
            {{ t('my.authentication.scanQRCodeHint') }} <a href="/downauthapp" target="_blank">{{ t('my.authentication.downloadApp') }}</a>
          </div>
          <div style="margin-top: 20px; display: flex; justify-content: center">
            <div style="border-radius: 8px; width: fit-content; height: fit-content"><a-qrcode v-if="totpState.activationUrl" :value="totpState.activationUrl" /></div>
          </div>
        </div>
        <div class="step">
          <div class="title"><span class="badage">2</span>{{ t('my.authentication.enterVerificationCode') }}</div>
          <div class="hint">{{ t('my.authentication.enterVerificationCodeHint') }}</div>
          <VerifyInput style="margin: 10px 0 30px 30px" v-model:value="totpState.verifyCode" :autofocus="true" @finish="handleUpdateTotpSecret" :digits="6"></VerifyInput>
        </div>
      </a-modal>
    </a-card>
    <a-card :title="t('my.authentication.2fa')">
      <div class="tips">{{ t('my.authentication.enh2fa') }}</div>
      <div class="item">
        <label>{{ state.enable2FA ? t('common.enabled') : t('common.disabled') }}</label>
        <a-switch v-model:checked="state.enable2FA" @change="handleToggle2FA" />
      </div>
      <div class="item">
        <a-alert :message="t('my.authentication.2faWarning')" type="warning" show-icon v-if="!(emailForm.email || phoneForm.phone || totpForm.totpSecret)" />
      </div>
    </a-card>
  </div>
</template>

<script setup>
// common
import { inject, toRefs, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/stores/stores'
import { message } from 'ant-design-vue'
import API from '../../api/API'

import helper from '../../js/helper'
import VerifyInput from '../../components/VerifyInput.vue'
import areaCode from '../../js/areacode'
import PasswordStrength from '../../components/PasswordStrength.vue'

const { t, locale } = useI18n()
const store = useStore()
const { accountname } = toRefs(store)
const [messageApi, contextHolder] = message.useMessage()
const globalLoading = inject('globalLoading')

const state = reactive({
  toggleChangePwd: false,
  strength: 0,
  setEmailVisible: false,
  setPhoneVisible: false,
  setTotpVisible: false,
  loading: false,
  enable2FA: undefined,
  twoFALoading: false
})

const pwdFormRef = ref()
const emailFormRef = ref()
const phoneFormRef = ref()

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const emailForm = reactive({
  email: '',
  emailNew: ''
})

const phoneForm = reactive({
  areacode: null,
  phone: '',
  areacodeNew: null,
  phoneNew: null
})

const totpForm = reactive({
  totpSecret: ''
})

const emailState = reactive({
  isCountDown: false,
  countDownTime: 0,
  isSend: false,
  verifyCode: ''
})

const phoneState = reactive({
  isCountDown: false,
  countDownTime: 0,
  isSend: false,
  verifyCode: ''
})

const totpState = reactive({
  activationUrl: '',
  secret: '',
  verifyCode: ''
})

// 倒计时
let emailInterval,
  phoneInterval = undefined

const vPwd = async (_rule, value) => {
  // state.strength
  if (value === pwdForm.oldPassword) {
    return Promise.reject(t('my.authentication.samepwd'))
  } else if (value === '') {
    return Promise.reject(t('my.authentication.pep'))
  } else if (state.strength < 2) {
    return Promise.reject()
  } else if (pwdForm.confirmPassword !== '') {
    pwdFormRef.value.validateFields('confirmPassword')
  }
  return Promise.resolve()
}
const vConfirmPwd = async (_rule, value) => {
  if (value === '') {
    return Promise.reject(t('my.authentication.pepa'))
  } else if (value !== pwdForm.newPassword) {
    return Promise.reject(t('my.authentication.pnm'))
  } else {
    return Promise.resolve()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: t('my.authentication.pep') }],
  newPassword: [{ validator: vPwd, trigger: 'change' }],
  confirmPassword: [{ validator: vConfirmPwd, trigger: 'change' }]
}

const vEmail = async (_rule, value) => {
  if (value && value === emailForm.email) {
    return Promise.reject()
  } else {
    return Promise.resolve()
  }
}
const emailRules = [
  { required: true, message: t('my.authentication.peemail'), trigger: 'blur' },
  { type: 'email', message: t('my.authentication.pecemail'), trigger: 'blur' },
  { validator: vEmail, message: t('my.authentication.pedemail'), trigger: 'blur' }
]

const vPhone = async (_rule, value) => {
  console.log(value)
  const cnPhoneRegex = /^1[3-9]\d{9}$/
  const internationalPhoneRegex = /^\+\d{1,3}\d{5,14}$/
  // 如果手机号与之前相同
  if (!value) {
    return Promise.reject(t('my.authentication.pephone'))
  } else if (phoneForm.areacodeNew + value === phoneForm.areacode + phoneForm.phone) {
    return Promise.reject(t('my.authentication.pedphone'))
  }
  // 验证手机号码格式
  if (!cnPhoneRegex.test(value) && !internationalPhoneRegex.test(value)) {
    return Promise.reject(t('my.authentication.pecphone'))
  } else {
    return Promise.resolve()
  }
}

const phoneRules = [{ validator: vPhone, trigger: 'blur' }]

const handlePwdValidate = (...args) => {
  console.log('handle', args)
}
const handleResetPwdForm = () => {
  pwdFormRef.value.resetFields()
}

const handleCancelSet = () => {
  console.log('cancel')
  state.verifyCode = ''
}

const handleUpdatePwd = async () => {
  try {
    const resp = await API.account.updatePassword(pwdForm.oldPassword, pwdForm.newPassword)
    if (resp.result) {
      messageApi.success(t('my.authentication.pwdUpdateSuccess'))
      pwdFormRef.value.resetFields()
      state.toggleChangePwd = !state.toggleChangePwd
    } else {
      messageApi.success(t('my.authentication.pwdUpdateError'))
    }
  } catch (err) {
    console.log(err)
    return
  }
}

const handleSendEmail = async () => {
  emailState.isSend = false
  // 表单验证
  try {
    await emailFormRef.value.validateFields()
  } catch (err) {
    console.log(err)
    return
  }

  // 向指定邮箱发送验证邮件
  try {
    state.loading = true
    const resp = await API.verification.sendCodeByEmail(emailForm.emailNew, store.accountid)
    console.log(resp)
    // 启动倒计时
    emailState.isSend = true
    countDown(emailState, emailForm.emailNew, emailInterval, 'email', store.accountid)
  } catch (err) {
    if (err?.data?.code === 102) {
      messageApi.warning(t('my.authentication.sendTooFrequent'))
    } else {
      messageApi.error(t('my.authentication.emailSendFailed'))
    }
  } finally {
    state.loading = false
  }
}

const handleUpdateEmail = async (callback) => {
  console.log('finish')
  try {
    //do verify email code
    //if sccuess
    const resp = await API.account.updateEmail(emailState.verifyCode, emailForm.emailNew)
    if (resp.result) {
      callback(true)
      emailForm.email = emailForm.emailNew
      emailForm.emailNew = ''
      localStorage.removeItem('emailCDT')
      localStorage.removeItem('cur_email')
      state.setEmailVisible = false
      emailState.isSend = false
      emailState.countDownTime = 60
      emailState.isCountDown = false
      clearInterval(emailInterval)
    } else {
      callback(false)
    }
  } catch (e) {
    console.log(e)
    return
  }
}

//   // 向指定邮箱发送验证邮件
//   try {
//     state.loading = true
//     const resp = await API.verification.sendCodeByEmail(emailForm.emailNew)
//     console.log(resp)
//     // 启动倒计时
//     emailState.isSend = true
//     countDown(emailState, emailInterval, 'email')
//   } catch (err) {
//     if (err?.data?.code === 102) {
//       messageApi.warning('发送过于频繁，请稍后再试')
//     } else {
//       messageApi.error('邮件发送失败, 请重试')
//     }
//   } finally {
//     state.loading = false
//   }
// }

const handleSendSMS = async () => {
  phoneState.isSend = false
  try {
    await phoneFormRef.value.validateFields()
  } catch (err) {
    console.log(err)
    return
  }

  // 向指定手机发送验证短信
  try {
    state.loading = true
    const resp = await API.verification.sendCodeBySMS(phoneForm.areacode, phoneForm.phoneNew, store.accountid)
    console.log(resp)
    // 启动倒计时
    phoneState.isSend = true
    countDown(phoneState, `${phoneForm.areacode}~${phoneForm.phoneNew}`, phoneInterval, 'phone')
  } catch (err) {
    if (err?.data?.code === 104) {
      messageApi.warning(t('my.authentication.sendTooFrequent'))
    } else {
      messageApi.error(t('my.authentication.sendFailed'))
    }
  } finally {
    state.loading = false
  }
}

const handleUpdatePhone = async (callback) => {
  try {
    const resp = await API.account.updatePhone(phoneState.verifyCode, phoneForm.areacodeNew, phoneForm.phoneNew)
    if (resp.result) {
      callback(true)
      phoneForm.phone = phoneForm.phoneNew
      phoneForm.areacode = phoneForm.areacodeNew
      phoneForm.phoneNew = ''
      phoneForm.areacodeNew = ''
      localStorage.removeItem('phoneCDT')
      localStorage.removeItem('cur_phone')
      state.setPhoneVisible = false
      phoneState.isSend = false
      phoneState.countDownTime = 60
      phoneState.isCountDown = false
      clearInterval(phoneInterval)
    } else {
      callback(false)
    }
  } catch (e) {
    callback(false)
    console.log(e)
    return
  }
}

const handleGenerateTotpSecret = async () => {
  state.setTotpVisible = true
  // console.log(accountname.value)
  const { url, secret } = await API.account.generateTotpSecret({ accountname: accountname.value })
  totpState.activationUrl = url
  totpState.secret = secret
}

const handleUpdateTotpSecret = async (callback) => {
  try {
    const data = await API.account.verifyTotp({ secret: totpState.secret, token: totpState.verifyCode })
    console.log(data.result)
    if (data.result) {
      const resp = await API.account.updateTotpSecret({ totpSecret: totpState.secret })
      if (resp.result) {
        state.setTotpVisible = false
        totpState.activationUrl = ''
        totpState.secret = ''
        totpForm.totpSecret = '*'
        callback(true)
      }
    } else {
      callback(false)
    }
  } catch (err) {
    callback(false)
  }
}
const handleToggle2FA = async () => {
  try {
    const resp = await API.account.update2FA({ enable2FA: state.enable2FA })
    if (!resp.result) {
      messageApi('error', t('my.authentication.update2FAFailed'))
      state.enable2FA = !state.enable2FA
    }
  } catch (err) {
    state.enable2FA = !state.enable2FA
  }
}

const countDown = (state, data, intv, type) => {
  let startTime = localStorage.getItem(type + 'CDT')
  let nowTime = new Date().getTime()
  if (startTime) {
    let surplus = 60 - parseInt((nowTime - startTime) / 1000, 10)
    state.countDownTime = surplus <= 0 ? 0 : surplus
  } else {
    state.countDownTime = 60
    localStorage.setItem(type + 'CDT', nowTime)
    localStorage.setItem('cur_' + type, data)
  }
  state.isCountDown = true
  intv = setInterval(() => {
    state.countDownTime--
    if (state.countDownTime <= 0) {
      localStorage.removeItem(type + 'CDT')
      localStorage.removeItem('cur_' + type)
      clearInterval(intv)
      intv = undefined
      state.countDownTime = 60
      state.isCountDown = false
    }
  }, 1000)
}

emailForm.emailNew = localStorage.getItem('cur_email')
if (localStorage.getItem('emailCDT')) {
  emailState.isSend = true
  countDown(emailState, emailForm.emailNew, emailInterval, 'email')
}

const fullPhone = localStorage.getItem('cur_phone')
if (fullPhone) [phoneForm.areacode, phoneForm.phoneNew] = fullPhone.split('~')
if (localStorage.getItem('phoneCDT')) {
  phoneState.isSend = true
  countDown(phoneState, fullPhone, phoneInterval, 'phone')
}

// 本页面初始数据准备
const getMyAuthInfo = async () => {
  globalLoading.value = true
  const resp = await API.account.getAuthInfo()
  // console.log(resp)
  emailForm.email = resp.email
  phoneForm.areacode = resp.areacode
  phoneForm.phone = resp.phone
  totpForm.totpSecret = resp.totpSecret
  globalLoading.value = false
  state.enable2FA = resp.enable2FA
}

getMyAuthInfo()

onUnmounted(() => {
  clearInterval(phoneInterval)
  clearInterval(emailInterval)
})
</script>
<style lang="scss" scoped>
.main {
  padding: 20px;

  .title {
    border-bottom: 1px solid var(--border-medium);
    padding-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .content {
    margin: 40px 0;
  }
  .tips {
    color: var(--text-secondary);
    margin: 12px 0;
    font-size: 14px;
  }
  .item {
    color: var(--text-primary);
    margin: 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    label {
      font-weight: 500;
    }
  }
  :deep(.ant-card) {
    max-width: 700px;
    min-width: 400px;
    margin-bottom: 20px;
  }
}

.resend {
  font-size: 12px;
  // padding-left: 12px;
}
.resend-hint {
  color: var(--text-secondary);
}

.verifycode {
  margin: 20px 0 20px 0;
  .hint {
    font-size: 12px;
    // text-align: center;
    padding: 12px;
  }
}

.badage {
  margin-right: 10px;
  border-radius: 100%;
  display: inline-block;
  height: 24px;
  width: 24px;
  line-height: 24px;
  vertical-align: middle;
  font-size: 14px;
  text-align: center;
  background-color: var(--c-brand);
  color: var(--c-white);
  font-weight: 600;
}

.step {
  margin: 40px 0 0 0;
  .title {
    display: flex;
    align-items: center;
    font-weight: 20px;
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 800;
    margin: 5px 0;
  }
  .hint {
    color: var(--text-secondary);
    margin-left: 35px;
  }
}
</style>
