"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

interface Field3DProps {
  image: string;
  index: number;
}

const Field3D: React.FC<Field3DProps> = ({ image, index }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Thiết lập scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      1, // Tỷ lệ khung hình 1:1 cho ảnh vuông
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(112, 100); // Kích thước ảnh trong danh sách
    mountRef.current.appendChild(renderer.domElement);

    // Tạo plane với texture từ ảnh
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    camera.position.z = 2;

    // Hiệu ứng xoay khi rê chuột
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener("mousemove", onMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Xoay plane dựa trên vị trí chuột
      plane.rotation.y = mouseX * 0.5;
      plane.rotation.x = mouseY * 0.5;

      renderer.render(scene, camera);
    };
    animate();

    // Dọn dẹp khi component unmount
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
      scene.remove(plane);
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [image]);

  return <div ref={mountRef} style={{ width: 112, height: 100 }} />;
};

export default Field3D;
