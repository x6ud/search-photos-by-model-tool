<template>
    <a-spin :style="{width: width+'px', height: height+'px'}"
            :spinning="loading"
            style="position: relative"
    >
        <canvas ref="canvas" :width="width" :height="height"
                style="cursor: grab;"
                @contextmenu.prevent
                @mousedown="dragStart" @touchstart.passive="dragStart"
                @mousemove="dragMove" @touchmove.passive="dragMove"
                @mousewheel="mouseWheel"
        ></canvas>
        <slot/>
    </a-spin>
</template>

<script>
    import * as THREE from 'three'
    import OBJLoader from 'three-obj-loader'

    OBJLoader(THREE);

    const DEG_2_RAD = 1 / 180 * Math.PI;
    const ZOOM_MAX = 20;
    const FPS = 25;

    export default {
        props: {
            width: {
                type: Number,
                default: 420
            },
            height: {
                type: Number,
                default: 420
            },
            preferSize: {
                type: Number,
                default: 6.5
            },
            zoom: {
                type: Number
            },
            rotateX: {
                type: Number
            },
            rotateY: {
                type: Number
            },
            rotateZ: {
                type: Number
            },
            clearColor: {
                type: Number,
                default: 0xf2f2f2
            },
            model: String
        },
        watch: {
            model(model) {
                this.loadObject(model);
            },
            rotateX(val) {
                const model = this._model;
                if (model) {
                    model.rotation.x = val * DEG_2_RAD;
                }
            },
            rotateY(val) {
                const model = this._model;
                if (model) {
                    model.rotation.y = val * DEG_2_RAD;
                }
            },
            rotateZ(val) {
                const model = this._model;
                if (model) {
                    model.rotation.z = val * DEG_2_RAD;
                }
            },
            zoom(val) {
                if (this._camera) {
                    this._camera.position.z = ZOOM_MAX - val;
                }
            }
        },
        data() {
            return {
                loading: false,
                dragging: false,
                dragStartX: 0,
                dragStartY: 0
            };
        },
        mounted() {
            const renderer = this._renderer = new THREE.WebGLRenderer({
                canvas: this.$refs.canvas
            });
            renderer.setClearColor(this.clearColor);

            const scene = this._scene = new THREE.Scene();

            const camera = this._camera = new THREE.PerspectiveCamera(45, this.width / this.height);
            camera.position.set(0, 0, ZOOM_MAX - this.zoom);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            scene.add(camera);

            const light = new THREE.DirectionalLight(0xffffff);
            light.position.set(0, 5, 5);
            scene.add(light);

            this._loader = new THREE.OBJLoader();
            if (this.model) {
                this.loadObject(this.model);
            }

            // drag event
            this._iid = setInterval(() => {
                this.render();
            }, 1000 / FPS);
            window.addEventListener('mouseup', this.dragStop);
            window.addEventListener('touchend', this.dragStop);
        },
        beforeDestroy() {
            clearInterval(this._iid);
            window.removeEventListener('mouseup', this.dragStop);
            window.removeEventListener('touchend', this.dragStop);
        },
        methods: {
            loadObject(path) {
                this.loading = true;
                this._loader.load(
                    path,
                    (obj) => {
                        this.loading = false;

                        if (this._model) {
                            this._scene.remove(this._model);
                        }

                        // double side material
                        obj.traverse((node) => {
                            if (node.material) {
                                node.material.side = THREE.DoubleSide;
                            }
                        });

                        // center
                        const mesh = obj.children[0];
                        const box = new THREE.Box3().setFromObject(obj);

                        const center = box.getCenter();
                        mesh.position.set(-center.x, -center.y, -center.z);

                        // resize
                        const size = box.getSize();
                        const scale = this.preferSize / Math.max(size.x, size.y, size.z);
                        mesh.scale.set(scale, scale, scale);

                        obj.rotation.set(this.rotateX * DEG_2_RAD, this.rotateY * DEG_2_RAD, this.rotateZ * DEG_2_RAD);

                        this._model = obj;
                        this._scene.add(obj);
                    },
                    null,
                    () => {
                        this.loading = false;
                    }
                );
            },
            render() {
                this._renderer.render(this._scene, this._camera);
            },
            dragStart(e) {
                this.dragging = true;
                this.dragStartX = e.clientX || e.touches && e.touches[0].clientX;
                this.dragStartY = e.clientY || e.touches && e.touches[0].clientY;
            },
            dragStop() {
                this.dragging = false;
            },
            dragMove(e) {
                if (!this.dragging) {
                    return;
                }
                const x0 = this.dragStartX,
                    y0 = this.dragStartY,
                    x1 = e.clientX || e.touches && e.touches[0].clientX,
                    y1 = e.clientY || e.touches && e.touches[0].clientY,
                    dx = x1 - x0,
                    dy = y1 - y0;
                let rotateX = this.rotateX,
                    rotateY = this.rotateY;
                this.dragStartX = x1;
                this.dragStartY = y1;
                rotateX += dy;
                if (rotateX < -180) {
                    rotateX += 360;
                } else if (rotateX > 180) {
                    rotateX -= 360;
                }
                rotateY += dx;
                if (rotateY < -180) {
                    rotateY += 360;
                } else if (rotateY > 180) {
                    rotateY -= 360;
                }
                this.$emit('update:rotateX', rotateX | 0);
                this.$emit('update:rotateY', rotateY | 0);
            },
            mouseWheel(e) {
                const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                this.$emit('update:zoom', Math.min(ZOOM_MAX, Math.max(0, this.zoom - delta)));
            }
        }
    };
</script>