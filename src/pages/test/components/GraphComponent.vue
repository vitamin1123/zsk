<template>
  <div id="container"></div>
</template>

<script lang="ts" setup>
import { Graph } from '@antv/g6';
import { onMounted } from 'vue';

interface GraphData {
  nodes: Array<{ id: string; label: string; group: string }>;
  edges: Array<{ source: string; target: string }>;
}

onMounted(async () => {
  const response = await fetch('https://assets.antv.antgroup.com/g6/graph.json');
  const data: GraphData = await response.json();

  const graph = new Graph({
    container: 'container',
    // autoFit: true,
    data,
    node: {
      style: {
        size: 10,
      },
      palette: {
        field: 'group',
        color: 'tableau',
      },
    },
    layout: {
      type: 'd3-force',
      manyBody: {},
      x: {},
      y: {},
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
  });

  graph.render();
});
</script>
