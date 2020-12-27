module es {
    export class Game extends egret.DisplayObjectContainer {
        private readonly core: Core;
        /** 对图形设备的全局访问 */
        public static graphicsDevice: GraphicsDevice;

        public constructor() {
            super();

            this.core = new Core(this.stage.stageWidth, this.stage.stageHeight, true);
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        }

        private onAddToStage(event: egret.Event) {
            Game.graphicsDevice = new GraphicsDevice(this.stage.stageWidth, this.stage.stageHeight);

            this.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
        }

        private update() {
            Core.emitter.emit(CoreEvents.FrameUpdated, egret.getTimer());
        }
    }
}