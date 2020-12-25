module es {
    /**
     * 便利的子类，有一个单一的属性，可以投递Effect，使配置更简单
     */
    export class Material {
        /** 默认材料实例 */
        public static defaultMaterial: Material = new Material(null);
        /** Batcher为当前RenderableComponent使用的效果 */
        public effect: egret.CustomFilter;

        constructor(effect: egret.CustomFilter) {
            this.effect = effect;
        }

        public dispose() {
            if (this.effect != null) {
                this.effect = null;
            }
        }

        /**
         * 在Batcher.begin开始前初始化设置材质时调用，以允许任何有参数的Effects在必要时根据Camera Matrix进行设置
         * 例如通过Camera.viewProjectionMatrix模仿Batcher的做法设置MatrixTransform。
         * 只有当有一个非空的Effect时才会被调用
         * @param camera 
         */
        public onPreRender(camera: Camera) {

        }

        /**
         * 这里非常基本。我们只检查指针是否相同
         * @param other 
         */
        public compareTo(other: Material) {
            if (other == null)
                return 1;

            if (this == other)
                return 0;

            return -1;
        }

        /**
         * 克隆材料。
         * 请注意，效果不是克隆的。它与原始材料是同一个实例
         */
        public clone(): Material {
            return new Material(this.effect);
        }
    }
}