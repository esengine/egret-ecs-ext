module es {
    /**
     *  全局核心类
     */
    export class Core extends egret.DisplayObjectContainer {
        /**
         * 对图形设备的全局访问
         */
        public static graphicsDevice: GraphicsDevice;
        /**
         * 核心发射器。只发出核心级别的事件
         */
        public static emitter: Emitter<CoreEvents>;
        /**
         * 启用/禁用焦点丢失时的暂停。如果为真，则不调用更新或渲染方法
         */
        public static pauseOnFocusLost = true;
        /**
         * 是否启用调试渲染
         */
        public static debugRenderEndabled = false;
        /**
         * 简化对内部类的全局内容实例的访问
         */
        public static _instance: Core;

        private _scene: Scene;
        private _nextScene: Scene;
        public _sceneTransition: SceneTransition;
        /**
         * 用于凝聚GraphicsDeviceReset事件
         */
        private _graphicsDeviceChangeTimer: ITimer;
        /**
         * 全局访问系统
         */
        private _globalManagers: GlobalManager[] = [];
        private _coroutineManager: CoroutineManager = new CoroutineManager();
        private _timerManager: TimerManager = new TimerManager();

        constructor() {
            super();

            Core._instance = this;
            Core.emitter = Framework.emitter;

            Core.registerGlobalManager(this._coroutineManager);
            Core.registerGlobalManager(this._timerManager);

            this.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.initialize, this);
        }

        /**
         * 提供对单例/游戏实例的访问
         * @constructor
         */
        public static get Instance() {
            return this._instance;
        }

        private _frameCounterElapsedTime: number = 0;
        private _frameCounter: number = 0;
        private _totalMemory: number = 0;
        public _titleMemory: (totalMemory: number, frameCounter: number) => void;

        /**
         * 当前活动的场景。注意，如果设置了该设置，在更新结束之前场景实际上不会改变
         */
        public static get scene() {
            if (!this._instance)
                return null;
            return this._instance._scene;
        }

        /**
         * 当前活动的场景。注意，如果设置了该设置，在更新结束之前场景实际上不会改变
         * @param value
         */
        public static set scene(value: Scene) {
            if (!value) {
                console.error("场景不能为空");
                return;
            }

            if (this._instance._scene == null) {
                this._instance._scene = value;
                this._instance.onSceneChanged();
                this._instance._scene.begin();
            } else {
                this._instance._nextScene = value;
            }
        }

        /**
         * 添加一个全局管理器对象，它的更新方法将调用场景前的每一帧。
         * @param manager
         */
        public static registerGlobalManager(manager: es.GlobalManager) {
            this._instance._globalManagers.push(manager);
            manager.enabled = true;
        }

        /**
         * 删除全局管理器对象
         * @param manager
         */
        public static unregisterGlobalManager(manager: es.GlobalManager) {
            new linq.List(this._instance._globalManagers).remove(manager);
            manager.enabled = false;
        }

        /**
         * 获取类型为T的全局管理器
         * @param type
         */
        public static getGlobalManager<T extends es.GlobalManager>(type): T {
            for (let i = 0; i < this._instance._globalManagers.length; i++) {
                if (this._instance._globalManagers[i] instanceof type)
                    return this._instance._globalManagers[i] as T;
            }
            return null;
        }

        /**
         * 启动一个coroutine。Coroutine可以将number延时几秒或延时到其他startCoroutine.Yielding 
         * null将使coroutine在下一帧被执行。
         * @param enumerator 
         */
        public static startCoroutine(enumerator): ICoroutine {
            return this._instance._coroutineManager.startCoroutine(enumerator);
        }

        /**
         * 调度一个一次性或重复的计时器，该计时器将调用已传递的动作
         * @param timeInSeconds
         * @param repeats
         * @param context
         * @param onTime
         */
        public static schedule(timeInSeconds: number, repeats: boolean = false, context: any = null, onTime: (timer: ITimer) => void) {
            return this._instance._timerManager.schedule(timeInSeconds, repeats, context, onTime);
        }

        public onOrientationChanged() {
            Core.emitter.emit(CoreEvents.orientationChanged);
        }

        public startDebugDraw() {
            this._frameCounter++;
            this._frameCounterElapsedTime += Time.deltaTime;
            if (this._frameCounterElapsedTime >= 1) {
                let memoryInfo = window.performance["memory"];
                if (memoryInfo != null) {
                    this._totalMemory = Number((memoryInfo.totalJSHeapSize / 1048576).toFixed(2));
                }
                if (this._titleMemory) this._titleMemory(this._totalMemory, this._frameCounter);
                this._frameCounter = 0;
                this._frameCounterElapsedTime -= 1;
            }
        }

        /**
         * 在一个场景结束后，下一个场景开始之前调用
         */
        public onSceneChanged() {
            Core.emitter.emit(CoreEvents.sceneChanged);
            Time.sceneChanged();
        }

        /**
         * 暂时运行SceneTransition，让一个场景通过自定义效果平滑地过渡到另一个场景
         * @param sceneTransition 
         */
        public static startSceneTransition<T extends SceneTransition>(sceneTransition: T): T {
            Insist.isNull(this._instance._sceneTransition, "在上一个场景转换完成之前，您不能启动新的场景转换");
            this._instance._sceneTransition = sceneTransition;
            return sceneTransition;
        }

        /**
         * 当屏幕大小发生改变时调用
         */
        protected onGraphicsDeviceReset() {
            // 我们用这些来避免垃圾事件的发生
            if (this._graphicsDeviceChangeTimer != null) {
                this._graphicsDeviceChangeTimer.reset();
            } else {
                this._graphicsDeviceChangeTimer = Core.schedule(0.05, false, this, t => {
                    (t.context as Core)._graphicsDeviceChangeTimer = null;
                    Core.emitter.emit(CoreEvents.graphicsDeviceReset);
                });
            }
        }

        protected initialize() {
            Core.graphicsDevice = new GraphicsDevice(this.stage.stageWidth, this.stage.stageHeight);
            Graphics.instance = new Graphics();
            PlatformEvent.initialize();
        }

        protected async update() {
            Time.update(egret.getTimer());
            if (this._scene != null) {
                for (let i = this._globalManagers.length - 1; i >= 0; i--) {
                    if (this._globalManagers[i].enabled)
                        this._globalManagers[i].update();
                }

                if (this._sceneTransition == null ||
                    (this._sceneTransition != null &&
                        (!this._sceneTransition._loadsNewScene || this._sceneTransition._isNewSceneLoaded))) {
                    this._scene.update();
                }

                if (this._nextScene != null) {
                    this._scene.end();

                    this._scene = this._nextScene;
                    this._nextScene = null;
                    this.onSceneChanged();

                    this._scene.begin();
                }
            }

            this.draw();
        }

        protected draw() {
            this.startDebugDraw();

            if (this._sceneTransition != null)
                this._sceneTransition.preRener(Graphics.instance.batcher);

            // 如果有的话，我们会对SceneTransition进行特殊处理。我们要么渲染SceneTransition，要么渲染Scene的
            if (this._sceneTransition != null) {
                if (this._scene != null && this._sceneTransition.wantsPreviousSceneRender &&
                    !this._sceneTransition.hasPreviousSceneRender) {
                    this._scene.render();
                    this._scene.postRender(this._sceneTransition.previousSceneRender);
                    Core.startCoroutine(this._sceneTransition.onBeginTransition());
                } else if (this._scene != null && this._sceneTransition._isNewSceneLoaded) {
                    this._scene.render();
                    this._scene.postRender();
                }

                this._sceneTransition.render(Graphics.instance.batcher);
            } else if (this._scene != null) {
                this._scene.render();

                this._scene.postRender();
            }
        }
    }
}
