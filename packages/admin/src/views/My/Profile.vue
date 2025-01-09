<template>
  <div class="card">hello</div>
  <div class="card">hello</div>
  <div class="card">hello</div>
  <div class="card">hello</div>
  <div class="card">hello</div>
</template>
<style lang="scss" scoped>
.card {
  position: relative;
  overflow: hidden;
  transition-duration: 0.3s;
  margin-bottom: 10px;
  width: 200px;
  height: 100px;
  background-color: #ffaa00;
}
.card:before {
  content: '';
  position: absolute;
  left: -665px;
  top: -460px;
  width: 300px;
  height: 15px;
  background-color: rgba(255, 255, 255, 0.5);
  transform: rotate(-45deg);
  animation: searchLights 2s ease-in 0s infinite;
}
@keyframes searchLights {
  0% {
  }
  75% {
    left: -100px;
    top: 0;
  }
  100% {
    left: 120px;
    top: 100px;
  }
}
</style>
