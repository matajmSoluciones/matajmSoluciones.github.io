<template>
	<div :class="{ 'modal': true, 'is-active' : isActive }" :id="id">
        <div class="modal-background" @click="hiden()"></div>
        <div class="modal-content">
            <!-- Any other Bulma elements you want -->
            <slot></slot>
        </div>
        <button class="modal-close is-large" aria-label="close" @click="hiden()"></button>
    </div>
</template>

<script>
export default {
  name: 'modal-pay',
  props: {
    id: {
      type: String,
      required: true
    },
    closed: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      rendered: false,
      isActive: !this.closed
    };
  },
  components: {},
  methods: {
    hiden() {
      this.isActive = false;
      console.log(this.isActive);
      this.$emit('closed');
    }
  },
  watch: {
    closed(val) {
      console.log(val);
      if (this.rendered && val) {
        this.$emit('opened');
      }
      this.isActive = !this.closed;
    }
  },
  mounted () {
    this.rendered = true;
  }
}
</script>