<template>
    <naco-head>
        <title>About - Home</title>
        <meta name="description" content="站点描述" />
        <meta name="keywords" content="关键字1,关键字2,关键字3" />
    </naco-head>
    <h1>{{ msg }}</h1>
</template>

<script>
export default {
    async setup() {
        return {
            msg: 'About'
        }
    }
}
</script>

<style scoped>
h1 {
    color: red;
}
</style>
