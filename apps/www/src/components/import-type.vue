<template>
    <p>import type should be removed without side-effect</p>
</template>

<script setup lang="ts">
    import { Foo } from '../types';
    const msg: Foo = {};
</script>
