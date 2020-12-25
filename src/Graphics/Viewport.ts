module es {
    /** 描述渲染目标表面的视图边界 */
    export class Viewport {
        public x: number;
        public y: number;
        public width: number;
        public height: number;
        public minDepth: number;
        public maxDepth: number;

        /**
         * 该视口的长宽比，即宽度/高度
         */
        public get aspectRatio(): number {
            if ((this.height != 0) && (this.width != 0)) {
                return this.width / this.height;
            }

            return 0;
        }

        /**
         * 获取或设置该视口的边界
         */
        public get bounds(): Rectangle {
            return new Rectangle(this.x, this.y, this.width, this.height);
        }

        public set bounds(value: Rectangle) {
            this.x = value.x;
            this.y = value.y;
            this.width = value.width;
            this.height = value.height;
        }

        /**
         * 返回保证在低质量显示器上可见的视口子集
         */
        public get titleSafeArea(): Rectangle {
            return GraphicsDevice.getTitleSafeArea(this.x, this.y, this.width, this.height);
        }

        constructor(x: number, y: number, width: number, height: number) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.minDepth = 0;
            this.maxDepth = 1;
        }
    }
}