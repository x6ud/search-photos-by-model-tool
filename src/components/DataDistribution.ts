import Vue, {PropType} from 'vue';
import {degEulerToQuaternion} from '../utils/quaternion';

export default class DataDistribution extends Vue.extend({
    props: {
        width: Number,
        height: Number,
        data: Array as PropType<{ rx: number, ry: number, rz: number }[]>
    },
    mounted() {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        (this as DataDistribution).ctx = canvas.getContext('2d')!;
        this.render();
    },
    watch: {
        data() {
            this.render();
        }
    },
    methods: {
        render() {
            const ctx = (this as DataDistribution).ctx;
            if (!ctx) {
                return;
            }
            ctx.fillStyle = '#f2f2f2';
            ctx.fillRect(0, 0, this.width, this.height);
            const cx = this.width / 2;
            const cy = this.height / 2;
            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(this.width, cy);
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, this.height);
            ctx.strokeStyle = '#999';
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.fillText('front', this.width - 28, cy + 3);
            ctx.fillText('back', 6, cy + 3);
            ctx.fillText('up', cx - 6, 12);
            ctx.fillText('down', cx - 12, this.height - 6);
            const size = this.width / 2 * .75;
            this.data?.forEach(item => {
                const quaternion = degEulerToQuaternion(item.rx + 180, item.ry + 180, item.rz + 180);
                ctx.beginPath();
                ctx.arc(
                    cx + (1 - Math.abs(quaternion.z) * 2) * size,
                    cy + quaternion.y * size,
                    1,
                    0,
                    Math.PI * 2
                );
                ctx.strokeStyle = '#000';
                ctx.stroke();
            });
        }
    }
}) {
    ctx?: CanvasRenderingContext2D;
}
