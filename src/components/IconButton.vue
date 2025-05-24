<template>
  <button @click="handleClick" class="icon-button">
    <svg class="icon">
      <use :xlink:href="iconPath"></use>
    </svg>
  </button>
</template>

<script>
export default {
  props: {
    iconName: String,
  },
  computed: {
    iconPath() {
      return `#icon-${this.iconName}`;
    },
  },
  methods: {
    handleClick() {
      this.$emit("click");
    },
  },
};
</script>

<style scoped>
.icon-button {
  border: none;
  background: none;
  cursor: pointer;
  /* Add more button styles as needed */
}

.icon {
  /* Add SVG icon styles here */
  width: 24px;
  height: 24px;
  fill: currentColor;
}
</style>
