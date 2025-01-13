<template>
  <div class="down-auth-app">
    <h1>下载手机动态口令APP</h1>

    <a-row :gutter="20">
      <!-- 腾讯身份验证 -->
      <a-col :span="12">
        <a-card class="app-card">
          <template #title>
            <div class="card-header">
              <h2>腾讯身份宝（中国大陆地区用户推荐下载）</h2>
            </div>
          </template>

          <div class="download-section">
            <div class="platform">
              <h3>iOS版本</h3>
              <a-button type="link" href="https://apps.apple.com/cn/app/id1514916052" target="_blank"> App Store下载 </a-button>
              <a-qrcode :value="'https://apps.apple.com/cn/app/id1514916052'" :size="150" />
            </div>

            <div class="platform">
              <h3>Android版本</h3>
              <a-button type="link" href="https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.authenticator" target="_blank"> 应用宝下载 </a-button>

              <a-qrcode :value="'https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.authenticator'" :size="150" />
            </div>
          </div>
        </a-card>
      </a-col>
      <!-- Google Authenticator -->
      <a-col :span="12">
        <a-card class="app-card">
          <template #title>
            <div class="card-header">
              <h2>Google Authenticator（其他地区用户推荐下载）</h2>
            </div>
          </template>

          <div class="download-section">
            <div class="platform">
              <h3>iOS版本</h3>
              <a-button type="link" href="https://apps.apple.com/cn/app/google-authenticator/id388497605" target="_blank"> App Store下载 </a-button>

              <a-qrcode :value="'https://apps.apple.com/cn/app/google-authenticator/id388497605'" :size="150" />
            </div>

            <div class="platform">
              <h3>Android版本</h3>
              <a-button type="link" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank"> Google Play下载 </a-button>

              <a-qrcode :value="'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'" :size="150" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
  name: 'DownAuthApp'
}
</script>

<style lang="scss" scoped>
.down-auth-app {
  padding: 24px;

  h1 {
    margin-bottom: 32px;
    text-align: center;
    color: rgba(0, 0, 0, 0.85);
  }

  .app-card {
    margin-bottom: 24px;

    .card-header {
      h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }

  .download-section {
    .platform {
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;

      h3 {
        margin: 12px 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }
}
</style>
