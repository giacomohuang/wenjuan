<template>
  <component :is="AsyncComponent" :size="size" :color="color" :fill="fill" />
</template>

<script>
import { defineComponent, computed, defineAsyncComponent } from 'vue'

export default defineComponent({
  name: 'Icon',
  props: {
    prefix: {
      type: String,
      default: 'icon'
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#000000'
    },
    size: {
      type: String,
      default: '1.5em'
    },
    fill: {
      type: String,
      default: 'red'
    }
  },

  setup(props) {
    const AsyncComponent = computed(() => defineAsyncComponent(() => import(`../assets/icons/${props.name}.vue`)))

    return { AsyncComponent }
  }
})
</script>
