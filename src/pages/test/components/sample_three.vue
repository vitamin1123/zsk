<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { onMounted, onUnmounted, ref } from 'vue';

// 引用容器
const threeContainer = ref<HTMLDivElement | null>(null);

onMounted(() => {
  // 创建场景
  const scene = new THREE.Scene();

  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75,
    ((window.innerWidth / 5) * 3) / (window.innerHeight / 2),
    0.1,
    1000,
  );
  camera.position.x = 200;

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize((window.innerWidth / 5) * 3, window.innerHeight / 2);
  if (threeContainer.value) {
    threeContainer.value.appendChild(renderer.domElement);
  }

  // 添加 AxesHelper，长度为50
  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);

  // 创建控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.update();

  // 定义直线的长度
  const lineLength = 100;

  // 创建一条不经过原点的垂直于yz平面的线（沿着x轴，偏移位置）
  const lineGeometry = new THREE.BufferGeometry();
  const points: THREE.Vector3[] = [];
  const maxDistance = lineLength;
  const xOffset = 0;
  const yOffset = lineLength;
  const zOffset = 0;

  for (let i = 0; i <= maxDistance; i++) {
    const x = xOffset + i;
    points.push(new THREE.Vector3(x, yOffset, zOffset));
  }

  lineGeometry.setFromPoints(points);

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);

  // 创建发射的点
  const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const spheres: THREE.Mesh[] = [];

  const rotationSpeed = 0.01;
  const framesPerRevolution = (2 * Math.PI) / rotationSpeed;
  const distanceToYZPlane = xOffset + maxDistance + 10;
  const pointSpeed = distanceToYZPlane / framesPerRevolution;

  function createSphere(position: THREE.Vector3) {
    const color = new THREE.Color(`hsl(${(position.x / maxDistance) * 360}, 100%, 50%)`);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(position);
    spheres.push(sphere);
    scene.add(sphere);
    return sphere;
  }

  // 在yz平面上添加一个平面
  const planeGeometry = new THREE.PlaneGeometry(250, 250);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(-10, 0, 0);
  plane.rotation.y = Math.PI / 2;
  scene.add(plane);

  // 创建时钟
  const clock = new THREE.Clock();
  let lastTime = 0;

  function animate() {
    requestAnimationFrame(animate);

    line.rotation.x += rotationSpeed;

    const elapsedTime = clock.getElapsedTime();

    if (elapsedTime - lastTime >= 0.5) {
      lastTime = elapsedTime;
      points.forEach((point) => {
        const rotatedPoint = point.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), line.rotation.x);
        createSphere(rotatedPoint);
      });
    }

    spheres.forEach((sphere, index) => {
      sphere.position.x -= pointSpeed;

      if (sphere.position.x <= -10) {
        scene.remove(sphere);
        spheres.splice(index, 1);
      }
    });

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  const onResize = () => {
    camera.aspect = ((window.innerWidth / 5) * 3) / (window.innerHeight / 2);
    camera.updateProjectionMatrix();
    renderer.setSize((window.innerWidth / 5) * 3, window.innerHeight / 2);
  };

  window.addEventListener('resize', onResize);

  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    controls.dispose();
  });
});
</script>

<style lang="less" scoped>
.three-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
}
</style>
