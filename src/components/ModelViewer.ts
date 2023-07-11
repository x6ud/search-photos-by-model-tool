import * as THREE from 'three';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import Vue from 'vue';

const DEG_2_RAD = 1 / 180 * Math.PI;
const RAD_2_DEG = 1 / Math.PI * 180;
const ZOOM_MAX = 20;
const FPS = 30;

export default class ModelViewer extends Vue.extend({
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
            default: 0xf1f3f4
        },
        modelUrl: String,
        gizmo: {
            type: Boolean,
            default: true,
        },
    },
    watch: {
        modelUrl() {
            this.loadModel();
        },
        rotateX(val) {
            const modelViewer = this as ModelViewer;
            if (modelViewer.control?.dragging) {
                return;
            }
            const model = modelViewer.model;
            if (model) {
                model.rotation.setFromVector3(
                    new THREE.Vector3(
                        this.rotateX * DEG_2_RAD,
                        this.rotateY * DEG_2_RAD,
                        this.rotateZ * DEG_2_RAD
                    ));
            }
        },
        rotateY(val) {
            const modelViewer = this as ModelViewer;
            if (modelViewer.control?.dragging) {
                return;
            }
            const model = modelViewer.model;
            if (model) {
                model.rotation.setFromVector3(
                    new THREE.Vector3(
                        this.rotateX * DEG_2_RAD,
                        this.rotateY * DEG_2_RAD,
                        this.rotateZ * DEG_2_RAD
                    ));
            }
        },
        rotateZ(val) {
            const modelViewer = this as ModelViewer;
            if (modelViewer.control?.dragging) {
                return;
            }
            const model = modelViewer.model;
            if (model) {
                model.rotation.setFromVector3(
                    new THREE.Vector3(
                        this.rotateX * DEG_2_RAD,
                        this.rotateY * DEG_2_RAD,
                        this.rotateZ * DEG_2_RAD
                    ));
            }
        },
        zoom(val) {
            const modelViewer = this as ModelViewer;
            const camera = modelViewer.camera;
            if (camera) {
                camera.position.z = ZOOM_MAX - val;
            }
        },
        gizmo(val) {
            const modelViewer = this as ModelViewer;
            modelViewer.control!.visible = modelViewer.control!.enabled = val;
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
    mounted(): void {
        const modelViewer = this as ModelViewer;
        (window as any).modelViewer = this;
        const renderer = modelViewer.renderer = new THREE.WebGLRenderer({
            canvas: this.$refs.canvas as HTMLCanvasElement
        });
        renderer.setClearColor(this.clearColor);

        const scene = modelViewer.scene = new THREE.Scene();

        const camera = modelViewer.camera = new THREE.PerspectiveCamera(45, this.width / this.height);
        camera.position.set(0, 0, ZOOM_MAX - this.zoom);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        scene.add(camera);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 5, 5);
        scene.add(light);

        const control = modelViewer.control = new TransformControls(camera, this.$refs.canvas as HTMLElement);
        control.setSpace('local');
        control.setMode('rotate');
        control.setSize(2);
        control.visible = control.enabled = this.gizmo;
        control.addEventListener('dragging-changed', () => {
            const model = modelViewer.model;
            if (model) {
                this.$emit('update:rotateX', Math.round(model.rotation.x * RAD_2_DEG));
                this.$emit('update:rotateY', Math.round(model.rotation.y * RAD_2_DEG));
                this.$emit('update:rotateZ', Math.round(model.rotation.z * RAD_2_DEG));
            }
        });
        scene.add(control);

        const iid = setInterval(this.render, 1000 / FPS);
        window.addEventListener('mouseup', this.dragStop);
        window.addEventListener('touchend', this.dragStop);
        this.$on('hook:beforeDestroy', () => {
            clearInterval(iid);
            window.removeEventListener('mouseup', this.dragStop);
            window.removeEventListener('touchend', this.dragStop);
        });

        modelViewer.loader = new OBJLoader();
        if (this.modelUrl) {
            this.loadModel();
        }
    },
    methods: {
        loadOBJ(url: string): Promise<THREE.Group> {
            const modelViewer = this as ModelViewer;
            return new Promise((resolve, reject) => {
                if (!modelViewer.loader) {
                    throw new Error('Not initialized');
                }
                modelViewer.loader.load(
                    url,
                    resolve,
                    undefined,
                    reject
                );
            });
        },
        async loadModel() {
            try {
                this.loading = true;
                const group = await this.loadOBJ(this.modelUrl);

                const modelViewer = this as ModelViewer;

                // remove existed
                if (modelViewer.model) {
                    modelViewer.control!.detach();
                    modelViewer.scene!.remove(modelViewer.model);
                    modelViewer.model = undefined;
                }

                // double side material
                group.traverse((obj) => {
                    if (obj instanceof THREE.Mesh) {
                        const material = (obj as THREE.Mesh).material;
                        if (material instanceof THREE.Material) {
                            material.side = THREE.DoubleSide;
                        } else {
                            material.forEach(material => {
                                material.side = THREE.DoubleSide;
                            });
                        }
                    }
                });

                const mesh = group.children[0];

                // resize
                const size = new THREE.Vector3();
                new THREE.Box3().setFromObject(group).getSize(size);
                const scale = this.preferSize / Math.max(size.x, size.y, size.z);
                mesh.scale.set(scale, scale, scale);

                // center
                const center = new THREE.Vector3();
                new THREE.Box3().setFromObject(group).getCenter(center);
                mesh.position.set(-center.x, -center.y, -center.z);

                group.rotation.set(this.rotateX * DEG_2_RAD, this.rotateY * DEG_2_RAD, this.rotateZ * DEG_2_RAD);

                modelViewer.model = group;
                modelViewer.scene!.add(group);

                modelViewer.control!.attach(group);
            } finally {
                this.loading = false;
            }
        },
        render() {
            const modelViewer = this as ModelViewer;
            modelViewer.renderer!.render(modelViewer.scene!, modelViewer.camera!);
        },
        dragStart(e: MouseEvent & TouchEvent) {
            if (this.gizmo) {
                return;
            }
            this.dragging = true;
            this.dragStartX = e.clientX || e.touches && e.touches[0].clientX;
            this.dragStartY = e.clientY || e.touches && e.touches[0].clientY;
        },
        dragStop() {
            this.dragging = false;
        },
        dragMove(e: MouseEvent & TouchEvent) {
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
        mouseWheel(e: WheelEvent) {
            const delta = Math.max(-1, Math.min(1, -e.deltaY));
            this.$emit('update:zoom', Math.min(ZOOM_MAX, Math.max(0, this.zoom + delta)));
        }
    }
}) {
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.Camera;
    loader?: OBJLoader;
    model?: THREE.Group;
    control?: TransformControls;
}
