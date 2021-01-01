var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var es;
(function (es) {
    /**
     *  全局核心类
     */
    var Core = /** @class */ (function (_super) {
        __extends(Core, _super);
        function Core() {
            var _this = _super.call(this) || this;
            /**
             * 全局访问系统
             */
            _this._globalManagers = [];
            _this._coroutineManager = new es.CoroutineManager();
            _this._timerManager = new es.TimerManager();
            _this._frameCounterElapsedTime = 0;
            _this._frameCounter = 0;
            _this._totalMemory = 0;
            Core._instance = _this;
            Core.emitter = es.Framework.emitter;
            Core.registerGlobalManager(_this._coroutineManager);
            Core.registerGlobalManager(_this._timerManager);
            _this.addEventListener(egret.Event.ENTER_FRAME, _this.update, _this);
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.initialize, _this);
            return _this;
        }
        Object.defineProperty(Core, "Instance", {
            /**
             * 提供对单例/游戏实例的访问
             * @constructor
             */
            get: function () {
                return this._instance;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Core, "scene", {
            /**
             * 当前活动的场景。注意，如果设置了该设置，在更新结束之前场景实际上不会改变
             */
            get: function () {
                if (!this._instance)
                    return null;
                return this._instance._scene;
            },
            /**
             * 当前活动的场景。注意，如果设置了该设置，在更新结束之前场景实际上不会改变
             * @param value
             */
            set: function (value) {
                if (!value) {
                    console.error("场景不能为空");
                    return;
                }
                if (this._instance._scene == null) {
                    this._instance._scene = value;
                    this._instance.onSceneChanged();
                    this._instance._scene.begin();
                }
                else {
                    this._instance._nextScene = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加一个全局管理器对象，它的更新方法将调用场景前的每一帧。
         * @param manager
         */
        Core.registerGlobalManager = function (manager) {
            this._instance._globalManagers.push(manager);
            manager.enabled = true;
        };
        /**
         * 删除全局管理器对象
         * @param manager
         */
        Core.unregisterGlobalManager = function (manager) {
            new linq.List(this._instance._globalManagers).remove(manager);
            manager.enabled = false;
        };
        /**
         * 获取类型为T的全局管理器
         * @param type
         */
        Core.getGlobalManager = function (type) {
            for (var i = 0; i < this._instance._globalManagers.length; i++) {
                if (this._instance._globalManagers[i] instanceof type)
                    return this._instance._globalManagers[i];
            }
            return null;
        };
        /**
         * 启动一个coroutine。Coroutine可以将number延时几秒或延时到其他startCoroutine.Yielding
         * null将使coroutine在下一帧被执行。
         * @param enumerator
         */
        Core.startCoroutine = function (enumerator) {
            return this._instance._coroutineManager.startCoroutine(enumerator);
        };
        /**
         * 调度一个一次性或重复的计时器，该计时器将调用已传递的动作
         * @param timeInSeconds
         * @param repeats
         * @param context
         * @param onTime
         */
        Core.schedule = function (timeInSeconds, repeats, context, onTime) {
            if (repeats === void 0) { repeats = false; }
            if (context === void 0) { context = null; }
            return this._instance._timerManager.schedule(timeInSeconds, repeats, context, onTime);
        };
        Core.prototype.onOrientationChanged = function () {
            Core.emitter.emit(es.CoreEvents.orientationChanged);
        };
        Core.prototype.startDebugDraw = function () {
            this._frameCounter++;
            this._frameCounterElapsedTime += es.Time.deltaTime;
            if (this._frameCounterElapsedTime >= 1) {
                var memoryInfo = window.performance["memory"];
                if (memoryInfo != null) {
                    this._totalMemory = Number((memoryInfo.totalJSHeapSize / 1048576).toFixed(2));
                }
                if (this._titleMemory)
                    this._titleMemory(this._totalMemory, this._frameCounter);
                this._frameCounter = 0;
                this._frameCounterElapsedTime -= 1;
            }
        };
        /**
         * 在一个场景结束后，下一个场景开始之前调用
         */
        Core.prototype.onSceneChanged = function () {
            Core.emitter.emit(es.CoreEvents.sceneChanged);
            es.Time.sceneChanged();
        };
        /**
         * 暂时运行SceneTransition，让一个场景通过自定义效果平滑地过渡到另一个场景
         * @param sceneTransition
         */
        Core.startSceneTransition = function (sceneTransition) {
            es.Insist.isNull(this._instance._sceneTransition, "在上一个场景转换完成之前，您不能启动新的场景转换");
            this._instance._sceneTransition = sceneTransition;
            return sceneTransition;
        };
        /**
         * 当屏幕大小发生改变时调用
         */
        Core.prototype.onGraphicsDeviceReset = function () {
            // 我们用这些来避免垃圾事件的发生
            if (this._graphicsDeviceChangeTimer != null) {
                this._graphicsDeviceChangeTimer.reset();
            }
            else {
                this._graphicsDeviceChangeTimer = Core.schedule(0.05, false, this, function (t) {
                    t.context._graphicsDeviceChangeTimer = null;
                    Core.emitter.emit(es.CoreEvents.graphicsDeviceReset);
                });
            }
        };
        Core.prototype.initialize = function () {
            Core.graphicsDevice = new es.GraphicsDevice(this.stage.stageWidth, this.stage.stageHeight);
            es.Graphics.instance = new es.Graphics();
            es.PlatformEvent.initialize();
        };
        Core.prototype.update = function () {
            return __awaiter(this, void 0, void 0, function () {
                var i;
                return __generator(this, function (_a) {
                    es.Time.update(egret.getTimer());
                    if (this._scene != null) {
                        for (i = this._globalManagers.length - 1; i >= 0; i--) {
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
                    return [2 /*return*/];
                });
            });
        };
        Core.prototype.draw = function () {
            this.startDebugDraw();
            if (this._sceneTransition != null)
                this._sceneTransition.preRener(es.Graphics.instance.batcher);
            // 如果有的话，我们会对SceneTransition进行特殊处理。我们要么渲染SceneTransition，要么渲染Scene的
            if (this._sceneTransition != null) {
                if (this._scene != null && this._sceneTransition.wantsPreviousSceneRender &&
                    !this._sceneTransition.hasPreviousSceneRender) {
                    this._scene.render();
                    this._scene.postRender(this._sceneTransition.previousSceneRender);
                    Core.startCoroutine(this._sceneTransition.onBeginTransition());
                }
                else if (this._scene != null && this._sceneTransition._isNewSceneLoaded) {
                    this._scene.render();
                    this._scene.postRender();
                }
                this._sceneTransition.render(es.Graphics.instance.batcher);
            }
            else if (this._scene != null) {
                this._scene.render();
                this._scene.postRender();
            }
        };
        /**
         * 启用/禁用焦点丢失时的暂停。如果为真，则不调用更新或渲染方法
         */
        Core.pauseOnFocusLost = true;
        /**
         * 是否启用调试渲染
         */
        Core.debugRenderEndabled = false;
        return Core;
    }(egret.DisplayObjectContainer));
    es.Core = Core;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * 这里存放专门处理平台用的事件
     */
    var PlatformEvent = /** @class */ (function () {
        function PlatformEvent() {
        }
        PlatformEvent.initialize = function () {
            es.Screen.width = es.Core.Instance.stage.stageWidth;
            es.Screen.height = es.Core.Instance.stage.stageHeight;
            es.Core.emitter.addObserver(es.CoreEvents.clearGraphics, this.clearGraphics, this);
            es.Core.emitter.addObserver(es.CoreEvents.addDefaultRender, this.addDefaultRenderer, this);
            es.Core.emitter.addObserver(es.CoreEvents.createRenderTarget, this.createRenderTarget, this);
            es.Core.emitter.addObserver(es.CoreEvents.disposeRenderTarget, this.disposeRenderTarget, this);
            es.Core.emitter.addObserver(es.CoreEvents.setRenderTarget, this.setRenderTarget, this);
            es.Core.emitter.addObserver(es.CoreEvents.resolutionOffset, this.setResolutionOffset, this);
            es.Core.emitter.addObserver(es.CoreEvents.resolutionScale, this.setResuolutionScale, this);
            es.Core.emitter.addObserver(es.CoreEvents.createCamera, this.createCamera, this);
            es.Framework.batcher = es.Graphics.instance.batcher;
        };
        PlatformEvent.addDefaultRenderer = function () {
            es.Core.scene.addRenderer(new es.DefaultRenderer());
        };
        PlatformEvent.clearGraphics = function () {
        };
        PlatformEvent.createRenderTarget = function (texture, width, height) {
            texture.value = new egret.RenderTexture();
            texture.value.drawToTexture(es.Core.Instance, new egret.Rectangle(0, 0, width, height));
        };
        PlatformEvent.disposeRenderTarget = function (texture) {
            if (!texture || !texture.value)
                return;
            texture.value.dispose();
            texture.value = null;
        };
        PlatformEvent.setRenderTarget = function (texture) {
            if (!texture)
                texture = new es.Ref(null);
            texture.value = new egret.RenderTexture();
            texture.value.drawToTexture(es.Core.Instance);
        };
        PlatformEvent.setResolutionOffset = function (offset) {
        };
        PlatformEvent.setResuolutionScale = function (scale) {
        };
        PlatformEvent.createCamera = function (scene) {
            var cameraEntity = scene.createEntity("camera");
            scene.camera = cameraEntity.addComponent(new es.Camera());
        };
        return PlatformEvent;
    }());
    es.PlatformEvent = PlatformEvent;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * 用于管理egret的资源管理器
     * egret因为有分组加载 所以在加载资源前要保证资源组先被加载完成
     */
    var AssetManager = /** @class */ (function (_super) {
        __extends(AssetManager, _super);
        function AssetManager() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * 加载资源
         * @param name
         * @param group
         * @param assetTask
         */
        AssetManager.prototype.load = function (name, group, assetTask) {
            if (group === void 0) { group = null; }
            if (assetTask === void 0) { assetTask = null; }
            return __awaiter(this, void 0, void 0, function () {
                var isLoad;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!group) return [3 /*break*/, 2];
                            isLoad = RES.isGroupLoaded(group);
                            if (!!isLoad) return [3 /*break*/, 2];
                            return [4 /*yield*/, RES.loadGroup(group, 0, new AssetTaskReport(assetTask))];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [4 /*yield*/, RES.getResAsync(name)];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        return AssetManager;
    }(es.GlobalManager));
    es.AssetManager = AssetManager;
    var AssetTaskReport = /** @class */ (function () {
        function AssetTaskReport(assetTask) {
            this.assetUserTask = assetTask;
        }
        AssetTaskReport.prototype.onProgress = function (current, total, resItem) {
            this.assetUserTask && this.assetUserTask(current, total, resItem);
        };
        return AssetTaskReport;
    }());
    es.AssetTaskReport = AssetTaskReport;
})(es || (es = {}));
var es;
(function (es) {
    var SpriteAnimation = /** @class */ (function () {
        function SpriteAnimation(sprites, frameRate) {
            if (frameRate === void 0) { frameRate = 10; }
            this.sprites = sprites;
            this.frameRate = frameRate;
        }
        return SpriteAnimation;
    }());
    es.SpriteAnimation = SpriteAnimation;
})(es || (es = {}));
var es;
(function (es) {
    var Camera = /** @class */ (function (_super) {
        __extends(Camera, _super);
        function Camera() {
            var _this = _super.call(this) || this;
            _this._inset = { left: 0, right: 0, top: 0, bottom: 0 };
            _this._bounds = new es.Rectangle();
            _this._transformMatrix = es.Matrix2D.identity;
            _this._inverseTransformMatrix = es.Matrix2D.identity;
            _this._origin = es.Vector2.zero;
            _this._minimumZoom = 0.3;
            _this._zoom = 0;
            _this._maximumZoom = 3;
            _this._areMatrixedDirty = true;
            _this._areBoundsDirty = true;
            _this._isProjectionMatrixDirty = true;
            _this.setZoom(0);
            return _this;
        }
        Object.defineProperty(Camera.prototype, "position", {
            /**
             * 对entity.transform.position的快速访问
             */
            get: function () {
                return this.entity.transform.position;
            },
            /**
             * 对entity.transform.position的快速访问
             * @param value
             */
            set: function (value) {
                this.entity.transform.position = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "rotation", {
            /**
             * 对entity.transform.rotation的快速访问
             */
            get: function () {
                return this.entity.transform.rotation;
            },
            /**
             * 对entity.transform.rotation的快速访问
             * @param value
             */
            set: function (value) {
                this.entity.transform.rotation = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "rawZoom", {
            /**
             * 原始的缩放值。这就是用于比例矩阵的精确值。默认值为1。
             */
            get: function () {
                return this._zoom;
            },
            /**
             * 原始的缩放值。这就是用于比例矩阵的精确值。默认值为1。
             * @param value
             */
            set: function (value) {
                if (value != this._zoom) {
                    this._zoom = value;
                    this._areMatrixedDirty = true;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "zoom", {
            /**
             * 缩放值应该在-1和1之间、然后将该值从minimumZoom转换为maximumZoom。
             * 允许你设置适当的最小/最大值，然后使用更直观的-1到1的映射来更改缩放
             */
            get: function () {
                if (this._zoom == 0)
                    return 1;
                if (this._zoom < 1)
                    return es.MathHelper.map(this._zoom, this._minimumZoom, 1, -1, 0);
                return es.MathHelper.map(this._zoom, 1, this._maximumZoom, 0, 1);
            },
            /**
             * 缩放值应该在-1和1之间、然后将该值从minimumZoom转换为maximumZoom。
             * 允许你设置适当的最小/最大值，然后使用更直观的-1到1的映射来更改缩放
             * @param value
             */
            set: function (value) {
                this.setZoom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "minimumZoom", {
            /**
             * 相机变焦可以达到的最小非缩放值（0-number.max）。默认为0.3
             */
            get: function () {
                return this._minimumZoom;
            },
            /**
             * 相机变焦可以达到的最小非缩放值（0-number.max）。默认为0.3
             * @param value
             */
            set: function (value) {
                this.setMinimumZoom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "maximumZoom", {
            /**
             * 相机变焦可以达到的最大非缩放值（0-number.max）。默认为3
             */
            get: function () {
                return this._maximumZoom;
            },
            /**
             * 相机变焦可以达到的最大非缩放值（0-number.max）。默认为3
             * @param value
             */
            set: function (value) {
                this.setMaximumZoom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "bounds", {
            /**
             * 摄像机的世界空间界限，对裁剪有用。
             */
            get: function () {
                if (this._areMatrixedDirty)
                    this.updateMatrixes();
                if (this._areBoundsDirty) {
                    // 旋转或非旋转的边界都需要左上角和右下角
                    var topLeft = this.screenToWorldPoint(new es.Vector2(this._inset.left, this._inset.top));
                    var bottomRight = this.screenToWorldPoint(new es.Vector2(es.Core.Instance.width - this._inset.right, es.Core.Instance.height - this._inset.bottom));
                    if (this.entity.transform.rotation != 0) {
                        // 特别注意旋转的边界。我们需要找到绝对的最小/最大值并从中创建边界
                        var topRight = this.screenToWorldPoint(new es.Vector2(es.Core.Instance.width - this._inset.right, this._inset.top));
                        var bottomLeft = this.screenToWorldPoint(new es.Vector2(this._inset.left, es.Core.Instance.height - this._inset.bottom));
                        var minX = Math.min(topLeft.x, bottomRight.x, topRight.x, bottomLeft.x);
                        var maxX = Math.max(topLeft.x, bottomRight.x, topRight.x, bottomLeft.x);
                        var minY = Math.min(topLeft.y, bottomRight.y, topRight.y, bottomLeft.y);
                        var maxY = Math.max(topLeft.y, bottomRight.y, topRight.y, bottomLeft.y);
                        this._bounds.location = new es.Vector2(minX, minY);
                        this._bounds.width = maxX - minX;
                        this._bounds.height = maxY - minY;
                    }
                    else {
                        this._bounds.location = topLeft;
                        this._bounds.width = bottomRight.x - topLeft.x;
                        this._bounds.height = bottomRight.y - topLeft.y;
                    }
                    this._areBoundsDirty = false;
                }
                return this._bounds;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "transformMatrix", {
            /**
             * 用于从世界坐标转换到屏幕
             */
            get: function () {
                if (this._areMatrixedDirty)
                    this.updateMatrixes();
                return this._transformMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "inverseTransformMatrix", {
            /**
             * 用于从屏幕坐标到世界的转换
             */
            get: function () {
                if (this._areMatrixedDirty)
                    this.updateMatrixes();
                return this._inverseTransformMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "projectionMatrix", {
            /**
             * 二维摄像机的投影矩阵
             */
            get: function () {
                if (this._isProjectionMatrixDirty) {
                    es.Matrix.createOrthographicOffCenter(0, es.Core.graphicsDevice.viewport.width, es.Core.graphicsDevice.viewport.height, 0, 0, -1, this._projectionMatrix);
                    this._isProjectionMatrixDirty = false;
                }
                return this._projectionMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "viewprojectionMatrix", {
            /**
             * 获取视图-投影矩阵，即变换矩阵*投影矩阵
             */
            get: function () {
                es.Matrix.multiply(es.Matrix2D.toMatrix(this.transformMatrix), this.projectionMatrix);
                return this.projectionMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "origin", {
            get: function () {
                return this._origin;
            },
            set: function (value) {
                if (this._origin != value) {
                    this._origin = value;
                    this._areMatrixedDirty = true;
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 设置用于从视口边缘插入摄像机边界的量
         * @param left
         * @param right
         * @param top
         * @param bottom
         */
        Camera.prototype.setInset = function (left, right, top, bottom) {
            this._inset = { left: left, right: right, top: top, bottom: bottom };
            this._areBoundsDirty = true;
            return this;
        };
        /**
         * 对entity.transform.setPosition快速访问
         * @param position
         */
        Camera.prototype.setPosition = function (position) {
            this.entity.transform.setPosition(position.x, position.y);
            return this;
        };
        /**
         * 对entity.transform.setRotation的快速访问
         * @param rotation
         */
        Camera.prototype.setRotation = function (rotation) {
            this.entity.transform.setRotation(rotation);
            return this;
        };
        /**
         * 设置缩放值，缩放值应该在-1到1之间。然后将该值从minimumZoom转换为maximumZoom
         * 允许您设置适当的最小/最大值。使用更直观的-1到1的映射来更改缩放
         * @param zoom
         */
        Camera.prototype.setZoom = function (zoom) {
            var newZoom = es.MathHelper.clamp(zoom, -1, 1);
            if (newZoom == 0) {
                this._zoom = 1;
            }
            else if (newZoom < 0) {
                this._zoom = es.MathHelper.map(newZoom, -1, 0, this._minimumZoom, 1);
            }
            else {
                this._zoom = es.MathHelper.map(newZoom, 0, 1, 1, this._maximumZoom);
            }
            this._areMatrixedDirty = true;
            return this;
        };
        /**
         * 相机变焦可以达到的最小非缩放值（0-number.max） 默认为0.3
         * @param minZoom
         */
        Camera.prototype.setMinimumZoom = function (minZoom) {
            es.Insist.isTrue(minZoom > 0, "minimumZoom必须大于零");
            if (this._zoom < minZoom)
                this._zoom = this.minimumZoom;
            this._minimumZoom = minZoom;
            return this;
        };
        /**
         * 相机变焦可以达到的最大非缩放值（0-number.max） 默认为3
         * @param maxZoom
         */
        Camera.prototype.setMaximumZoom = function (maxZoom) {
            es.Insist.isTrue(maxZoom > 0, "MaximumZoom必须大于零");
            if (this._zoom > maxZoom)
                this._zoom = maxZoom;
            this._maximumZoom = maxZoom;
            return this;
        };
        /**
         * 这将迫使矩阵和边界变脏
         */
        Camera.prototype.forceMatrixUpdate = function () {
            // 弄脏矩阵也会自动弄脏边界
            this._areMatrixedDirty = true;
        };
        Camera.prototype.onEntityTransformChanged = function (comp) {
            this._areMatrixedDirty = true;
        };
        Camera.prototype.zoomIn = function (deltaZoom) {
            this.zoom += deltaZoom;
        };
        Camera.prototype.zoomOut = function (deltaZoom) {
            this.zoom -= deltaZoom;
        };
        /**
         * 将一个点从世界坐标转换到屏幕
         * @param worldPosition
         */
        Camera.prototype.worldToScreenPoint = function (worldPosition) {
            this.updateMatrixes();
            es.Vector2Ext.transformR(worldPosition, this._transformMatrix, worldPosition);
            return worldPosition;
        };
        /**
         * 将点从屏幕坐标转换为世界坐标
         * @param screenPosition
         */
        Camera.prototype.screenToWorldPoint = function (screenPosition) {
            this.updateMatrixes();
            es.Vector2Ext.transformR(screenPosition, this._inverseTransformMatrix, screenPosition);
            return screenPosition;
        };
        /**
         * 当场景渲染目标尺寸发生变化时，我们会更新摄像机的原点，并调整位置，使其保持在原来的位置
         * @param newWidth
         * @param newHeight
         */
        Camera.prototype.onSceneRenderTargetSizeChanged = function (newWidth, newHeight) {
            this._isProjectionMatrixDirty = true;
            var oldOrigin = this._origin.clone();
            this.origin = new es.Vector2(newWidth / 2, newHeight / 2);
            // 偏移我们的位置，以配合新的中心
            this.entity.position = es.Vector2.add(this.entity.position, es.Vector2.subtract(this._origin, oldOrigin));
        };
        Camera.prototype.updateMatrixes = function () {
            if (!this._areMatrixedDirty)
                return;
            var tempMat;
            this._transformMatrix = es.Matrix2D.createTranslation(-this.entity.transform.position.x, -this.entity.transform.position.y);
            if (this._zoom != 1) {
                tempMat = es.Matrix2D.createScale(this._zoom, this._zoom);
                this._transformMatrix = this._transformMatrix.multiply(tempMat);
            }
            if (this.entity.transform.rotation != 0) {
                tempMat = es.Matrix2D.createRotation(this.entity.transform.rotation);
                this._transformMatrix = this._transformMatrix.multiply(tempMat);
            }
            tempMat = es.Matrix2D.createTranslation(this._origin.x, this._origin.y);
            this._transformMatrix = this._transformMatrix.multiply(tempMat);
            this._inverseTransformMatrix = es.Matrix2D.invert(this._transformMatrix);
            // 无论何时矩阵改变边界都是无效的
            this._areBoundsDirty = true;
            this._areMatrixedDirty = false;
        };
        return Camera;
    }(es.Component));
    es.Camera = Camera;
})(es || (es = {}));
var es;
(function (es) {
    var CameraShake = /** @class */ (function (_super) {
        __extends(CameraShake, _super);
        function CameraShake() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._shakeDirection = es.Vector2.zero;
            _this._shakeOffset = es.Vector2.zero;
            _this._shakeIntensity = 0;
            _this._shakeDegredation = 0.95;
            return _this;
        }
        /**
         * 如果震动已经在运行，只有震动强度>当前shakeIntensity, 将覆盖当前值
         * 如果shake当前不是活动的，它将被启动。
         * @param shakeIntensify 震动强度
         * @param shakeDegredation 较高的值会导致更快的停止震动
         * @param shakeDirection 0只会导致x/y轴上的振动。任何其他的值将导致通过在抖动方向*强度是相机移动偏移
         */
        CameraShake.prototype.shake = function (shakeIntensify, shakeDegredation, shakeDirection) {
            if (shakeIntensify === void 0) { shakeIntensify = 15; }
            if (shakeDegredation === void 0) { shakeDegredation = 0.9; }
            if (shakeDirection === void 0) { shakeDirection = es.Vector2.zero; }
            this.enabled = true;
            if (this._shakeIntensity < shakeIntensify) {
                this._shakeDirection = shakeDirection;
                this._shakeIntensity = shakeIntensify;
                if (shakeDegredation < 0 || shakeDegredation >= 1) {
                    shakeDegredation = 0.95;
                }
                this._shakeDegredation = shakeDegredation;
            }
        };
        CameraShake.prototype.update = function () {
            if (Math.abs(this._shakeIntensity) > 0) {
                this._shakeOffset = this._shakeDirection;
                if (this._shakeOffset.x != 0 || this._shakeOffset.y != 0) {
                    this._shakeOffset.normalize();
                }
                else {
                    this._shakeOffset.x = this._shakeOffset.x + Math.random() - 0.5;
                    this._shakeOffset.y = this._shakeOffset.y + Math.random() - 0.5;
                }
                // TODO: 这需要乘相机变焦
                this._shakeOffset.multiply(new es.Vector2(this._shakeIntensity));
                this._shakeIntensity *= -this._shakeDegredation;
                if (Math.abs(this._shakeIntensity) <= 0.01) {
                    this._shakeIntensity = 0;
                    this.enabled = false;
                }
            }
        };
        return CameraShake;
    }(es.Component));
    es.CameraShake = CameraShake;
})(es || (es = {}));
var es;
(function (es) {
    var CameraStyle;
    (function (CameraStyle) {
        CameraStyle[CameraStyle["lockOn"] = 0] = "lockOn";
        CameraStyle[CameraStyle["cameraWindow"] = 1] = "cameraWindow";
    })(CameraStyle = es.CameraStyle || (es.CameraStyle = {}));
    var FollowCamera = /** @class */ (function (_super) {
        __extends(FollowCamera, _super);
        function FollowCamera(targetEntity, camera, cameraStyle) {
            if (targetEntity === void 0) { targetEntity = null; }
            if (camera === void 0) { camera = null; }
            if (cameraStyle === void 0) { cameraStyle = CameraStyle.lockOn; }
            var _this = _super.call(this) || this;
            /**
             * 如果相机模式为cameraWindow 则会进行缓动移动
             * 该值为移动速度
             */
            _this.followLerp = 0.1;
            /**
             * 在cameraWindow模式下，宽度/高度被用做边界框，允许在不移动相机的情况下移动
             * 在lockOn模式下，只使用deadZone的x/y值 你可以通过直接setCenteredDeadzone重写它来自定义deadZone
             */
            _this.deadzone = new es.Rectangle();
            /**
             * 相机聚焦于屏幕中心的偏移
             */
            _this.focusOffset = es.Vector2.zero;
            /**
             * 如果为true 相机位置则不会超出地图矩形（0, 0, mapwidth, mapheight）
             */
            _this.mapLockEnabled = false;
            _this.mapSize = new es.Rectangle();
            _this._desiredPositionDelta = new es.Vector2();
            _this._worldSpaceDeadZone = new es.Rectangle();
            _this._targetEntity = targetEntity;
            _this._cameraStyle = cameraStyle;
            _this.camera = camera;
            return _this;
        }
        FollowCamera.prototype.onAddedToEntity = function () {
            if (this.camera == null)
                this.camera = this.entity.getOrCreateComponent(es.Camera);
            this.follow(this._targetEntity, this._cameraStyle);
            es.Core.emitter.addObserver(es.CoreEvents.graphicsDeviceReset, this.onGraphicsDeviceReset, this);
        };
        FollowCamera.prototype.onGraphicsDeviceReset = function () {
            // 我们需要这个在下一帧触发 这样相机边界就会更新
            es.Core.schedule(0, false, this, function (t) {
                var self = t.context;
                self.follow(self._targetEntity, self._cameraStyle);
            });
        };
        FollowCamera.prototype.update = function () {
            var halfScreen = es.Vector2.multiply(this.camera.bounds.size, new es.Vector2(0.5));
            this._worldSpaceDeadZone.x = this.camera.position.x - halfScreen.x + this.deadzone.x + this.focusOffset.x;
            this._worldSpaceDeadZone.y = this.camera.position.y - halfScreen.y + this.deadzone.y + this.focusOffset.y;
            this._worldSpaceDeadZone.width = this.deadzone.width;
            this._worldSpaceDeadZone.height = this.deadzone.height;
            if (this._targetEntity)
                this.updateFollow();
            this.camera.position = es.Vector2.lerp(this.camera.position, es.Vector2.add(this.camera.position, this._desiredPositionDelta), this.followLerp);
            this.entity.transform.roundPosition();
            if (this.mapLockEnabled) {
                this.camera.position = this.clampToMapSize(this.camera.position);
                this.entity.transform.roundPosition();
            }
        };
        /**
         * 固定相机 永远不会离开地图的可见区域
         * @param position
         */
        FollowCamera.prototype.clampToMapSize = function (position) {
            var halfScreen = es.Vector2.multiply(this.camera.bounds.size, new es.Vector2(0.5)).add(new es.Vector2(this.mapSize.x, this.mapSize.y));
            var cameraMax = new es.Vector2(this.mapSize.width - halfScreen.x, this.mapSize.height - halfScreen.y);
            return es.Vector2.clamp(position, halfScreen, cameraMax);
        };
        FollowCamera.prototype.follow = function (targetEntity, cameraStyle) {
            if (cameraStyle === void 0) { cameraStyle = CameraStyle.cameraWindow; }
            this._targetEntity = targetEntity;
            this._cameraStyle = cameraStyle;
            var cameraBounds = this.camera.bounds;
            switch (this._cameraStyle) {
                case CameraStyle.cameraWindow:
                    var w = cameraBounds.width / 6;
                    var h = cameraBounds.height / 3;
                    this.deadzone = new es.Rectangle((cameraBounds.width - w) / 2, (cameraBounds.height - h) / 2, w, h);
                    break;
                case CameraStyle.lockOn:
                    this.deadzone = new es.Rectangle(cameraBounds.width / 2, cameraBounds.height / 2, 10, 10);
                    break;
            }
        };
        FollowCamera.prototype.updateFollow = function () {
            this._desiredPositionDelta.x = this._desiredPositionDelta.y = 0;
            if (this._cameraStyle == CameraStyle.lockOn) {
                var targetX = this._targetEntity.transform.position.x;
                var targetY = this._targetEntity.transform.position.y;
                if (this._worldSpaceDeadZone.x > targetX)
                    this._desiredPositionDelta.x = targetX - this._worldSpaceDeadZone.x;
                else if (this._worldSpaceDeadZone.x < targetX)
                    this._desiredPositionDelta.x = targetX - this._worldSpaceDeadZone.x;
                if (this._worldSpaceDeadZone.y < targetY)
                    this._desiredPositionDelta.y = targetY - this._worldSpaceDeadZone.y;
                else if (this._worldSpaceDeadZone.y > targetY)
                    this._desiredPositionDelta.y = targetY - this._worldSpaceDeadZone.y;
            }
            else {
                if (!this._targetCollider) {
                    this._targetCollider = this._targetEntity.getComponent(es.Collider);
                    if (!this._targetCollider)
                        return;
                }
                var targetBounds = this._targetEntity.getComponent(es.Collider).bounds;
                if (!this._worldSpaceDeadZone.containsRect(targetBounds)) {
                    if (this._worldSpaceDeadZone.left > targetBounds.left)
                        this._desiredPositionDelta.x = targetBounds.left - this._worldSpaceDeadZone.left;
                    else if (this._worldSpaceDeadZone.right < targetBounds.right)
                        this._desiredPositionDelta.x = targetBounds.right - this._worldSpaceDeadZone.right;
                    if (this._worldSpaceDeadZone.bottom < targetBounds.bottom)
                        this._desiredPositionDelta.y = targetBounds.bottom - this._worldSpaceDeadZone.bottom;
                    else if (this._worldSpaceDeadZone.top > targetBounds.top)
                        this._desiredPositionDelta.y = targetBounds.top - this._worldSpaceDeadZone.top;
                }
            }
        };
        /**
         * 以给定的尺寸设置当前相机边界中心的死区
         * @param width
         * @param height
         */
        FollowCamera.prototype.setCenteredDeadzone = function (width, height) {
            if (!this.camera) {
                console.error("相机是null。我们不能得到它的边界。请等到该组件添加到实体之后");
                return;
            }
            var cameraBounds = this.camera.bounds;
            this.deadzone = new es.Rectangle((cameraBounds.width - width) / 2, (cameraBounds.height - height) / 2, width, height);
        };
        return FollowCamera;
    }(es.Component));
    es.FollowCamera = FollowCamera;
})(es || (es = {}));
var es;
(function (es) {
    var SpriteRenderer = /** @class */ (function (_super) {
        __extends(SpriteRenderer, _super);
        function SpriteRenderer(sprite) {
            if (sprite === void 0) { sprite = null; }
            var _this = _super.call(this) || this;
            if (sprite instanceof es.Sprite)
                _this.setSprite(sprite);
            else if (sprite instanceof egret.Texture)
                _this.setSprite(new es.Sprite(sprite));
            return _this;
        }
        Object.defineProperty(SpriteRenderer.prototype, "origin", {
            /**
             * 精灵的原点。这是在设置精灵时自动设置的
             */
            get: function () {
                return this._origin;
            },
            /**
             * 精灵的原点。这是在设置精灵时自动设置的
             * @param value
             */
            set: function (value) {
                this.setOrigin(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteRenderer.prototype, "sprite", {
            /**
             * 应该由这个精灵显示的精灵
             * 当设置时，精灵的原点也被设置为精灵的origin
             */
            get: function () {
                return this._sprite;
            },
            /**
             * 应该由这个精灵显示的精灵
             * 当设置时，精灵的原点也被设置为精灵的origin
             * @param value
             */
            set: function (value) {
                this.setSprite(value);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 设置精灵并更新精灵的原点以匹配sprite.origin
         * @param sprite
         */
        SpriteRenderer.prototype.setSprite = function (sprite) {
            this._sprite = sprite;
            if (this._sprite) {
                this._origin = this._sprite.origin;
            }
            return this;
        };
        /**
         * 设置可渲染的原点
         * @param origin
         */
        SpriteRenderer.prototype.setOrigin = function (origin) {
            if (!this._origin.equals(origin)) {
                this._origin = origin;
            }
            return this;
        };
        return SpriteRenderer;
    }(es.Component));
    es.SpriteRenderer = SpriteRenderer;
})(es || (es = {}));
///<reference path="./SpriteRenderer.ts" />
var es;
///<reference path="./SpriteRenderer.ts" />
(function (es) {
    var LoopMode;
    (function (LoopMode) {
        /** 在一个循环序列[A][B][C][A][B][C][A][B][C]... */
        LoopMode[LoopMode["loop"] = 0] = "loop";
        /** [A][B][C]然后暂停，设置时间为0 [A] */
        LoopMode[LoopMode["once"] = 1] = "once";
        /** [A][B][C]。当它到达终点时，它会继续播放最后一帧，并且不会停止播放 */
        LoopMode[LoopMode["clampForever"] = 2] = "clampForever";
        /** 在乒乓循环中永远播放序列[A][B][C][B][A][B][C][B]...... */
        LoopMode[LoopMode["pingPong"] = 3] = "pingPong";
        /** 向前播放一次序列，然后回到起点[A][B][C][B][A]，然后暂停并将时间设置为0 */
        LoopMode[LoopMode["pingPongOnce"] = 4] = "pingPongOnce";
    })(LoopMode = es.LoopMode || (es.LoopMode = {}));
    var State;
    (function (State) {
        State[State["none"] = 0] = "none";
        State[State["running"] = 1] = "running";
        State[State["paused"] = 2] = "paused";
        State[State["completed"] = 3] = "completed";
    })(State = es.State || (es.State = {}));
    /**
     * SpriteAnimator处理精灵的显示和动画
     */
    var SpriteAnimator = /** @class */ (function (_super) {
        __extends(SpriteAnimator, _super);
        function SpriteAnimator(sprite) {
            var _this = _super.call(this, sprite) || this;
            /**
             * 动画播放速度
             */
            _this.speed = 1;
            /**
             * 动画的当前状态
             */
            _this.animationState = State.none;
            _this._elapsedTime = 0;
            _this._animations = new Map();
            return _this;
        }
        Object.defineProperty(SpriteAnimator.prototype, "isRunning", {
            /**
             * 检查当前动画是否正在运行
             */
            get: function () {
                return this.animationState == State.running;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteAnimator.prototype, "animations", {
            /** 提供对可用动画列表的访问 */
            get: function () {
                return this._animations;
            },
            enumerable: true,
            configurable: true
        });
        SpriteAnimator.prototype.update = function () {
            if (this.animationState != State.running || this.currentAnimation == null)
                return;
            var animation = this.currentAnimation;
            var secondsPerFrame = 1 / (animation.frameRate * this.speed);
            var iterationDuration = secondsPerFrame * animation.sprites.length;
            var pingPongInterationDuration = animation.sprites.length < 3 ? iterationDuration : secondsPerFrame * (animation.sprites.length * 2 - 2);
            this._elapsedTime += es.Time.deltaTime;
            var time = Math.abs(this._elapsedTime);
            // Once和PingPongOnce一旦完成，就会重置回时间=0
            if (this._loopMode == LoopMode.once && time > iterationDuration ||
                this._loopMode == LoopMode.pingPongOnce && time > pingPongInterationDuration) {
                this.animationState = State.completed;
                this._elapsedTime = 0;
                this.currentFrame = 0;
                this.sprite = animation.sprites[0];
                this.onAnimationCompletedEvent(this.currentAnimationName);
                return;
            }
            if (this._loopMode == LoopMode.clampForever && time > iterationDuration) {
                this.animationState = State.completed;
                this.currentFrame = animation.sprites.length - 1;
                this.sprite = animation.sprites[this.currentFrame];
                this.onAnimationCompletedEvent(this.currentAnimationName);
                return;
            }
            // 弄清楚我们在哪个坐标系上
            var i = Math.floor(time / secondsPerFrame);
            var n = animation.sprites.length;
            if (n > 2 && (this._loopMode == LoopMode.pingPong || this._loopMode == LoopMode.pingPongOnce)) {
                // pingpong
                var maxIndex = n - 1;
                this.currentFrame = maxIndex - Math.abs(maxIndex - i % (maxIndex * 2));
            }
            else {
                this.currentFrame = i % n;
            }
            this.sprite = animation.sprites[this.currentFrame];
        };
        /**
         * 添加一个SpriteAnimation
         * @param name
         * @param animation
         */
        SpriteAnimator.prototype.addAnimation = function (name, animation) {
            // 如果我们没有精灵，使用我们找到的第一帧
            if (!this.sprite && animation.sprites.length > 0)
                this.setSprite(animation.sprites[0]);
            this._animations[name] = animation;
            return this;
        };
        /**
         * 以给定的名称放置动画。如果没有指定循环模式，则默认为循环
         * @param name
         * @param loopMode
         */
        SpriteAnimator.prototype.play = function (name, loopMode) {
            if (loopMode === void 0) { loopMode = null; }
            this.currentAnimation = this._animations[name];
            this.currentAnimationName = name;
            this.currentFrame = 0;
            this.animationState = State.running;
            this.sprite = this.currentAnimation.sprites[0];
            this._elapsedTime = 0;
            this._loopMode = loopMode || LoopMode.loop;
        };
        /**
         * 检查动画是否在播放（即动画是否处于活动状态，可能仍处于暂停状态）
         * @param name
         */
        SpriteAnimator.prototype.isAnimationActive = function (name) {
            return this.currentAnimation != null && this.currentAnimationName == name;
        };
        /**
         * 暂停动画
         */
        SpriteAnimator.prototype.pause = function () {
            this.animationState = State.paused;
        };
        /**
         * 继续动画
         */
        SpriteAnimator.prototype.unPause = function () {
            this.animationState = State.running;
        };
        /**
         * 停止当前动画并将其设为null
         */
        SpriteAnimator.prototype.stop = function () {
            this.currentAnimation = null;
            this.currentAnimationName = null;
            this.currentFrame = 0;
            this.animationState = State.none;
        };
        return SpriteAnimator;
    }(es.SpriteRenderer));
    es.SpriteAnimator = SpriteAnimator;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * 封装类，它拥有Batcher的实例和助手，因此它可以被传来传去，绘制任何东西
     */
    var Graphics = /** @class */ (function () {
        function Graphics() {
            var web = egret['web'];
            var context = web.WebGLRenderContext.getInstance();
            Graphics.gl = context.context;
            this.batcher = new es.Batcher(es.Core.graphicsDevice);
            var tex = new egret.Texture();
            this.pixelTexture = new es.Sprite(tex, new es.Rectangle(0, 0, 1, 1));
        }
        Graphics.prototype.unload = function () {
            this.batcher.disposed();
            this.batcher = null;
        };
        return Graphics;
    }());
    es.Graphics = Graphics;
})(es || (es = {}));
var es;
(function (es) {
    var GraphicsDevice = /** @class */ (function () {
        function GraphicsDevice(width, height) {
            /**
             * 对全局资源列表使用WeakReference，因为我们不知道资源何时会被处置和收集。
             * 我们不希望通过在该列表中持有强引用来阻止资源被收集
             */
            this._resources = new WeakSet();
            this.setup(width, height);
        }
        GraphicsDevice.prototype.setup = function (width, height) {
            this._viewport = new es.Viewport(0, 0, width, height);
            this._viewport.maxDepth = 1;
            this.effectCache = new Map();
        };
        GraphicsDevice.prototype.dispose = function (disposing) {
            if (!this._isDisposed) {
                if (disposing) {
                    this.effectCache.clear();
                }
                this._isDisposed = true;
            }
        };
        Object.defineProperty(GraphicsDevice.prototype, "viewport", {
            get: function () {
                return this._viewport;
            },
            set: function (value) {
                this._viewport = value;
            },
            enumerable: true,
            configurable: true
        });
        GraphicsDevice.prototype.addResourceReference = function (resourceReference) {
            this._resources.add(resourceReference);
        };
        GraphicsDevice.prototype.removeResourceReference = function (resourceReference) {
            this._resources.delete(resourceReference);
        };
        GraphicsDevice.getTitleSafeArea = function (x, y, width, height) {
            return this.platformGetTitleSafeArea(x, y, width, height);
        };
        GraphicsDevice.platformGetTitleSafeArea = function (x, y, width, height) {
            return new es.Rectangle(x, y, width, height);
        };
        return GraphicsDevice;
    }());
    es.GraphicsDevice = GraphicsDevice;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * 便利的子类，有一个单一的属性，可以投递Effect，使配置更简单
     */
    var Material = /** @class */ (function () {
        function Material(effect) {
            this.effect = effect;
        }
        Material.prototype.dispose = function () {
            if (this.effect != null) {
                this.effect = null;
            }
        };
        /**
         * 在Batcher.begin开始前初始化设置材质时调用，以允许任何有参数的Effects在必要时根据Camera Matrix进行设置
         * 例如通过Camera.viewProjectionMatrix模仿Batcher的做法设置MatrixTransform。
         * 只有当有一个非空的Effect时才会被调用
         * @param camera
         */
        Material.prototype.onPreRender = function (camera) {
        };
        /**
         * 这里非常基本。我们只检查指针是否相同
         * @param other
         */
        Material.prototype.compareTo = function (other) {
            if (other == null)
                return 1;
            if (this == other)
                return 0;
            return -1;
        };
        /**
         * 克隆材料。
         * 请注意，效果不是克隆的。它与原始材料是同一个实例
         */
        Material.prototype.clone = function () {
            return new Material(this.effect);
        };
        /** 默认材料实例 */
        Material.defaultMaterial = new Material(null);
        return Material;
    }());
    es.Material = Material;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * 定义镜像的精灵可视化选项
     */
    var SpriteEffects;
    (function (SpriteEffects) {
        /**
         * 没有指定选项
         */
        SpriteEffects[SpriteEffects["none"] = 0] = "none";
        /**
         * 沿X轴反向渲染精灵
         */
        SpriteEffects[SpriteEffects["flipHorizontally"] = 1] = "flipHorizontally";
        /**
         * 沿Y轴反向渲染精灵
         */
        SpriteEffects[SpriteEffects["flipVertically"] = 2] = "flipVertically";
    })(SpriteEffects = es.SpriteEffects || (es.SpriteEffects = {}));
})(es || (es = {}));
var es;
(function (es) {
    /** 描述渲染目标表面的视图边界 */
    var Viewport = /** @class */ (function () {
        function Viewport(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.minDepth = 0;
            this.maxDepth = 1;
        }
        Object.defineProperty(Viewport.prototype, "aspectRatio", {
            /**
             * 该视口的长宽比，即宽度/高度
             */
            get: function () {
                if ((this.height != 0) && (this.width != 0)) {
                    return this.width / this.height;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewport.prototype, "bounds", {
            /**
             * 获取或设置该视口的边界
             */
            get: function () {
                return new es.Rectangle(this.x, this.y, this.width, this.height);
            },
            set: function (value) {
                this.x = value.x;
                this.y = value.y;
                this.width = value.width;
                this.height = value.height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewport.prototype, "titleSafeArea", {
            /**
             * 返回保证在低质量显示器上可见的视口子集
             */
            get: function () {
                return es.GraphicsDevice.getTitleSafeArea(this.x, this.y, this.width, this.height);
            },
            enumerable: true,
            configurable: true
        });
        return Viewport;
    }());
    es.Viewport = Viewport;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * 这个类的存在只是为了让我们可以偷偷地把Batcher带过去
     */
    var GraphicsResource = /** @class */ (function (_super) {
        __extends(GraphicsResource, _super);
        function GraphicsResource() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._selfReference = new WeakSet();
            return _this;
        }
        Object.defineProperty(GraphicsResource.prototype, "graphicsDevice", {
            get: function () {
                return this._graphicsDevice;
            },
            set: function (value) {
                es.Insist.isTrue(value != null);
                if (this._graphicsDevice == value)
                    return;
                if (this._graphicsDevice != null) {
                    this.updateResourceReference(false);
                    this._selfReference.delete(this);
                }
                this._graphicsDevice = value;
                this._selfReference.add(this);
                this.updateResourceReference(true);
            },
            enumerable: true,
            configurable: true
        });
        GraphicsResource.prototype.dispose = function (disposing) {
            if (!this.isDisposed) {
                if (disposing) {
                    // 释放被管理对象
                }
                // 从全局图形资源列表中删除
                if (this.graphicsDevice != null)
                    this.updateResourceReference(false);
                this._selfReference.delete(this);
                this._graphicsDevice = null;
                this.isDisposed = true;
            }
        };
        GraphicsResource.prototype.updateResourceReference = function (shouldAdd) {
            if (shouldAdd) {
                this.graphicsDevice.addResourceReference(this._selfReference);
            }
            else {
                this.graphicsDevice.removeResourceReference(this._selfReference);
            }
        };
        return GraphicsResource;
    }(egret.DisplayObjectContainer));
    es.GraphicsResource = GraphicsResource;
})(es || (es = {}));
///<reference path="./GraphicsResource.ts" />
var es;
///<reference path="./GraphicsResource.ts" />
(function (es) {
    var Batcher = /** @class */ (function (_super) {
        __extends(Batcher, _super);
        function Batcher(graphicsDevice) {
            var _this = _super.call(this) || this;
            /**
             * 如果为true，则将在绘制目标位置之前将其四舍五入
             */
            _this.shouldRoundDestinations = true;
            _this.MAX_SPRITES = 2048;
            es.Insist.isTrue(graphicsDevice != null);
            _this.graphicsDevice = graphicsDevice;
            _this._textureInfo = new Array(_this.MAX_SPRITES);
            _this._spriteEffect = new es.SpriteEffect();
            _this._projectionMatrix = new es.Matrix();
            _this._projectionMatrix.m11 = 0;
            _this._projectionMatrix.m12 = 0;
            _this._projectionMatrix.m13 = 0;
            _this._projectionMatrix.m14 = 0;
            _this._projectionMatrix.m21 = 0;
            _this._projectionMatrix.m22 = 0;
            _this._projectionMatrix.m23 = 0;
            _this._projectionMatrix.m24 = 0;
            _this._projectionMatrix.m31 = 0;
            _this._projectionMatrix.m32 = 0;
            _this._projectionMatrix.m33 = 1;
            _this._projectionMatrix.m34 = 0;
            _this._projectionMatrix.m41 = -1;
            _this._projectionMatrix.m42 = 1;
            _this._projectionMatrix.m43 = 0;
            _this._projectionMatrix.m44 = 1;
            return _this;
        }
        Object.defineProperty(Batcher.prototype, "transformMatrix", {
            /**
             * 创建投影矩阵时要使用的矩阵
             */
            get: function () {
                return this._transformMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Batcher.prototype.disposed = function () {
            this.dispose(true);
        };
        Batcher.prototype.dispose = function (disposing) {
            if (!this.isDisposed && disposing) {
                this._spriteEffect = null;
            }
            _super.prototype.dispose.call(this, disposing);
        };
        Batcher.prototype.begin = function (effect, transformationMatrix, disableBatching) {
            if (transformationMatrix === void 0) { transformationMatrix = es.Matrix2D.toMatrix(es.Matrix2D.identity); }
            if (disableBatching === void 0) { disableBatching = false; }
            es.Insist.isFalse(this._beginCalled, "在最后一次调用Begin后，在调用End之前已经调用了Begin。在End被成功调用之前，不能再调用Begin");
            this._beginCalled = true;
            this._customEffect = effect;
            this._transformMatrix = transformationMatrix;
            this._disableBatching = disableBatching;
            if (this._disableBatching)
                this.prepRenderState();
            this._displayObject = new egret.DisplayObject();
        };
        Batcher.prototype.end = function () {
            es.Insist.isTrue(this._beginCalled, "End已经被调用，但Begin还没有被调用。在调用End之前，必须先成功调用Begin");
            this._beginCalled = false;
            this._displayObject.cacheAsBitmap = this._disableBatching;
            this.addChild(this._displayObject);
            this._customEffect = null;
        };
        Batcher.prototype.prepRenderState = function () {
            var viewport = this.graphicsDevice.viewport;
            this._projectionMatrix.m11 = 2 / viewport.width;
            this._projectionMatrix.m22 = -2 / viewport.height;
            this._projectionMatrix.m41 = -1 - 0.5 * this._projectionMatrix.m11;
            this._projectionMatrix.m42 = 1 - 0.5 * this._projectionMatrix.m22;
            es.Matrix.multiply(this._transformMatrix, this._projectionMatrix, this._matrixTransformMatrix);
            this._spriteEffect.setMatrixTransform(this._matrixTransformMatrix);
        };
        /**
         * 设置是否应忽略位置舍入。在为调试绘制基元时很有用
         * @param shouldIgnore
         */
        Batcher.prototype.setIgnoreRoundingDestinations = function (shouldIgnore) {
            this._shouldIgnoreRoundingDestinations = shouldIgnore;
        };
        Batcher.prototype.drawHollowRect = function (rect, color, thickness) {
            if (thickness === void 0) { thickness = 1; }
            this.drawHollowBounds(rect.x, rect.y, rect.width, rect.height, color, thickness);
        };
        Batcher.prototype.drawHollowBounds = function (x, y, width, height, color, thickness) {
            if (thickness === void 0) { thickness = 1; }
            var tl = es.Vector2Ext.round(new es.Vector2(x, y));
            var tr = es.Vector2Ext.round(new es.Vector2(x + width, y));
            var br = es.Vector2Ext.round(new es.Vector2(x + width, y + height));
            var bl = es.Vector2Ext.round(new es.Vector2(x, y + height));
            this.setIgnoreRoundingDestinations(true);
            this.drawLine(tl, tr, color, thickness);
            this.drawLine(tr, br, color, thickness);
            this.drawLine(br, bl, color, thickness);
            this.drawLine(bl, tl, color, thickness);
            this.setIgnoreRoundingDestinations(false);
        };
        Batcher.prototype.drawLine = function (start, end, color, thickness) {
            this.drawLineAngle(start, es.MathHelper.angleBetweenVectors(start, end), es.Vector2.distance(start, end), color, thickness);
        };
        Batcher.prototype.drawLineAngle = function (start, radians, length, color, thickness) {
        };
        Batcher.prototype.drawPixel = function (position, color, size) {
            if (size === void 0) { size = 1; }
            var destRect = new es.Rectangle(position.x, position.y, size, size);
            if (size != 1) {
                destRect.x -= size * 0.5;
                destRect.y -= size * 0.5;
            }
        };
        Batcher.prototype.drawPolygon = function (position, points, color, closePoly, thickness) {
            if (closePoly === void 0) { closePoly = true; }
            if (thickness === void 0) { thickness = 1; }
            if (points.length < 2)
                return;
            this.setIgnoreRoundingDestinations(true);
            for (var i = 1; i < points.length; i++)
                this.drawLine(es.Vector2.add(position, points[i - 1]), es.Vector2.add(position, points[i]), color, thickness);
            if (closePoly)
                this.drawLine(es.Vector2.add(position, points[points.length - 1]), es.Vector2.add(position, points[0]), color, thickness);
            this.setIgnoreRoundingDestinations(false);
        };
        Batcher.prototype.drawCircle = function (position, radius, color, thickness, resolution) {
            if (thickness === void 0) { thickness = 1; }
            if (resolution === void 0) { resolution = 12; }
            var last = es.Vector2.unitX.multiply(new es.Vector2(radius));
            var lastP = es.Vector2Ext.perpendicularFlip(last);
            this.setIgnoreRoundingDestinations(true);
            for (var i = 1; i <= resolution; i++) {
                var at = es.MathHelper.angleToVector(i * es.MathHelper.PiOver2 / resolution, radius);
                var atP = es.Vector2Ext.perpendicularFlip(at);
                this.drawLine(es.Vector2.add(position, last), es.Vector2.add(position, at), color, thickness);
                this.drawLine(es.Vector2.subtract(position, last), es.Vector2.subtract(position, at), color, thickness);
                this.drawLine(es.Vector2.add(position, lastP), es.Vector2.add(position, atP), color, thickness);
                this.drawLine(es.Vector2.subtract(position, lastP), es.Vector2.subtract(position, atP), color, thickness);
                last = at;
                lastP = atP;
            }
            this.setIgnoreRoundingDestinations(false);
        };
        Batcher.prototype.draw = function (texture, position, color, rotation, origin, scale, effects) {
            if (color === void 0) { color = 0xffffff; }
            if (rotation === void 0) { rotation = 0; }
            if (origin === void 0) { origin = es.Vector2.zero; }
            if (scale === void 0) { scale = es.Vector2.one; }
            if (effects === void 0) { effects = 0; }
            this.checkBegin();
            this.pushSprite(texture, null, position.x, position.y, scale.x, scale.y, color, origin, rotation, 0, effects & 0x03, 0, 0, 0, 0);
        };
        Batcher.prototype.checkBegin = function () {
            if (!this._beginCalled)
                throw new Error("Begin还没有被叫到。在你画画之前，必须先调用Begin");
        };
        Batcher.prototype.pushSprite = function (texture, sourceRectangle, destinationX, destinationY, destinationW, destinationH, color, origin, rotation, depth, effects, skewTopX, skewBottomX, skewLeftY, skewRightY) {
            if (sourceRectangle === void 0) { sourceRectangle = null; }
            if (this._numSprites >= this.MAX_SPRITES)
                this.flushBatch();
            if (!this._shouldIgnoreRoundingDestinations && this.shouldRoundDestinations) {
                destinationX = Math.round(destinationX);
                destinationY = Math.round(destinationY);
            }
            var sourceX, sourceY, sourceW, sourceH;
            var originX, originY;
            if (sourceRectangle) {
                var inverseTexW = 1 / texture.textureWidth;
                var inverseTexH = 1 / texture.textureHeight;
                sourceX = sourceRectangle.x * inverseTexW;
                sourceY = sourceRectangle.y * inverseTexH;
                sourceW = sourceRectangle.width * inverseTexW;
                sourceH = sourceRectangle.height * inverseTexH;
                originX = (origin.x / sourceW) * inverseTexW;
                originY = (origin.y / sourceH) * inverseTexH;
            }
            else {
                sourceX = 0;
                sourceY = 0;
                sourceW = 1;
                sourceH = 1;
                originX = origin.x * (1 / texture.textureWidth);
                originY = origin.y * (1 / texture.textureHeight);
            }
            if (this._disableBatching) {
                this.drawPrimitives(texture, 0, 1);
            }
            else {
                this._textureInfo[this._numSprites] = texture;
                this._numSprites += 1;
            }
        };
        Batcher.prototype.flushBatch = function () {
            if (this._numSprites == 0)
                return;
            var offset = 0;
            var curTexture = null;
            this.prepRenderState();
            curTexture = this._textureInfo[0];
            for (var i = 1; i < this._numSprites; i += 1) {
                if (this._textureInfo[i] != curTexture) {
                    this.drawPrimitives(curTexture, offset, i - offset);
                    curTexture = this._textureInfo[i];
                    offset = i;
                }
            }
            this.drawPrimitives(curTexture, offset, this._numSprites - offset);
            this._numSprites = 0;
        };
        Batcher.prototype.drawPrimitives = function (texture, baseSprite, batchSize) {
            var bitmap = new egret.Bitmap(texture);
            this.addChild(bitmap);
        };
        Batcher._cornerOffsetX = [0, 1, 0, 1];
        Batcher._cornerOffsetY = [0, 0, 1, 1];
        return Batcher;
    }(es.GraphicsResource));
    es.Batcher = Batcher;
})(es || (es = {}));
var es;
(function (es) {
    var SpriteEffect = /** @class */ (function (_super) {
        __extends(SpriteEffect, _super);
        function SpriteEffect() {
            return _super.call(this, SpriteEffect.defaultVert, SpriteEffect.primitive_frag) || this;
        }
        SpriteEffect.prototype.setMatrixTransform = function (matrixTransform) {
            this.uniforms["MatrixTransform"] = matrixTransform;
        };
        SpriteEffect.defaultVert = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\nattribute vec4 aColor;\r\n\r\nuniform vec2 projectionVector;\r\n// uniform vec2 offsetVector;\r\n\r\nvarying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\n\r\nconst vec2 center = vec2(-1.0, 1.0);\r\n\r\nvoid main(void) {\r\n   gl_Position = vec4( (aVertexPosition / projectionVector) + center , 0.0, 1.0);\r\n   vTextureCoord = aTextureCoord;\r\n   vColor = aColor;\r\n}";
        SpriteEffect.primitive_frag = "precision lowp float;\r\nvarying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\n\r\nvoid main(void) {\r\n    gl_FragColor = vColor;\r\n}";
        return SpriteEffect;
    }(egret.CustomFilter));
    es.SpriteEffect = SpriteEffect;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * 渲染器被添加到一个场景中，并处理所有对RenderableComponent.render和Entity.debugRender的实际调用。
     * 一个简单的渲染器可以直接启动Batcher.instanceGraphics.batcher，也可以创建自己的本地Batcher实例
     */
    var Renderer = /** @class */ (function () {
        function Renderer(renderOrder, camera) {
            if (camera === void 0) { camera = null; }
            /** Batcher使用的材料。任何RenderableComponent都可以覆盖它 */
            this.material = es.Material.defaultMaterial;
            /**
             * 指定场景调用渲染器的顺序
             */
            this.renderOrder = 0;
            /**
             * 标志，决定是否要调试渲染。
             * 渲染方法接收一个bool(debugRenderEnabled)让渲染器知道全局调试渲染是否开启/关闭。
             * 然后渲染器使用本地的bool来决定是否应该调试渲染
             */
            this.shouldDebugRender = true;
            this.camera = camera;
            this.renderOrder = renderOrder;
        }
        Object.defineProperty(Renderer.prototype, "wantsToRenderToSceneRenderTarget", {
            /**
             * 如果为true，场景将使用场景RenderTarget调用SetRenderTarget。
             * 如果Renderer有一个renderTexture，默认的实现会返回true
             */
            get: function () {
                return this.renderTexture == null;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 当Renderer被添加到场景中时被调用
         * @param scene
         */
        Renderer.prototype.onAddedToScene = function (scene) {
        };
        /**
         * 当场景结束或该渲染器从场景中移除时，调用该函数，用于清理
         */
        Renderer.prototype.unload = function () {
            this.renderTexture && this.renderTexture.dispose();
        };
        /**
         * 如果使用了RenderTarget，这将会对其进行设置。
         * Batcher也会被启动。传
         * 递进来的Camera将被用来设置ViewPort（如果有ViewportAdapter）和Batcher变换矩阵
         * @param cam
         */
        Renderer.prototype.beginRender = function (cam) {
            // 如果我们有一个renderTarget渲染进去
            if (this.renderTexture != null) {
            }
            this._currentMaterial = this.material;
            es.Graphics.instance.batcher.begin(this._currentMaterial.effect, es.Matrix2D.toMatrix(cam.transformMatrix));
        };
        /**
         * 渲染RenderableComponent冲洗Batcher，并在必要时重置当前材料
         * @param renderable
         * @param cam
         */
        Renderer.prototype.renderAfterStateCheck = function (renderable, cam) {
            if (renderable.material != null && renderable.material != this._currentMaterial) {
                this._currentMaterial = renderable.material;
                if (this._currentMaterial.effect != null)
                    this._currentMaterial.onPreRender(cam);
                this.flushBatch(cam);
            }
            else if (renderable.material == null && this._currentMaterial != this.material) {
                this._currentMaterial = this.material;
                this.flushBatch(cam);
            }
            renderable.render(es.Graphics.instance.batcher, cam);
        };
        /**
         * 通过呼叫结束然后开始，强行刷新Batcher
         * @param cam
         */
        Renderer.prototype.flushBatch = function (cam) {
            es.Graphics.instance.batcher.end();
            es.Graphics.instance.batcher.begin(this._currentMaterial.effect, es.Matrix2D.toMatrix(cam.transformMatrix));
        };
        /**
         * 结束Batcher并清除RenderTarget（如果有RenderTarget）
         */
        Renderer.prototype.endRender = function () {
            es.Graphics.instance.batcher.end();
        };
        /**
         * 默认的debugRender方法只是循环浏览所有实体并调用entity.debugRender。
         * 请注意，此时你正处于一个批次的中间，所以你可能需要调用Batcher.End和Batcher.begin来清除任何等待渲染的材料和项目
         * @param scene
         * @param cam
         */
        Renderer.prototype.debugRender = function (scene, cam) {
            es.Graphics.instance.batcher.end();
            es.Graphics.instance.batcher.begin(null, es.Matrix2D.toMatrix(cam.transformMatrix));
            for (var _i = 0, _a = scene.entities.buffer; _i < _a.length; _i++) {
                var entity = _a[_i];
                if (entity.enabled)
                    entity.debugRender(es.Graphics.instance.batcher);
            }
        };
        /**
         * 当默认的场景RenderTarget被调整大小时，以及在场景已经开始的情况下添加一个Renderer时，会被调用。
         * @param newWidth
         * @param newHeight
         */
        Renderer.prototype.onSceneBackBufferSizeChanged = function (newWidth, newHeight) { };
        Renderer.prototype.compare = function (other) {
            return this.renderOrder - other.renderOrder;
        };
        return Renderer;
    }());
    es.Renderer = Renderer;
})(es || (es = {}));
///<reference path="./Renderer.ts" />
var es;
///<reference path="./Renderer.ts" />
(function (es) {
    var DefaultRenderer = /** @class */ (function (_super) {
        __extends(DefaultRenderer, _super);
        function DefaultRenderer(renderOrder, camera) {
            if (renderOrder === void 0) { renderOrder = 0; }
            if (camera === void 0) { camera = null; }
            return _super.call(this, renderOrder, camera) || this;
        }
        DefaultRenderer.prototype.render = function (scene) {
            var cam = this.camera || scene.camera;
            this.beginRender(cam);
            for (var i = 0; i < scene.renderableComponents.count; i++) {
                var renderable = scene.renderableComponents.get(i);
                if (renderable.enabled && renderable.isVisibleFromCamera(cam))
                    this.renderAfterStateCheck(renderable, cam);
            }
            if (this.shouldDebugRender && es.Core.debugRenderEndabled)
                this.debugRender(scene, cam);
            this.endRender();
        };
        return DefaultRenderer;
    }(es.Renderer));
    es.DefaultRenderer = DefaultRenderer;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * 代表纹理图谱中的单个元素，由纹理和帧的源矩形组成
     */
    var Sprite = /** @class */ (function () {
        function Sprite(texture, sourceRect, origin) {
            if (sourceRect === void 0) { sourceRect = new es.Rectangle(0, 0, texture.textureWidth, texture.textureHeight); }
            if (origin === void 0) { origin = sourceRect.getHalfSize(); }
            /** 纹理区域的UVs */
            this.uvs = new es.Rectangle();
            this.texture2D = texture;
            this.sourceRect = sourceRect;
            this.center = new es.Vector2(sourceRect.width * 0.5, sourceRect.height * 0.5);
            this.origin = origin;
            var inverseTexW = 1 / texture.textureWidth;
            var inverseTexH = 1 / texture.textureHeight;
            this.uvs.x = sourceRect.x * inverseTexW;
            this.uvs.y = sourceRect.y * inverseTexH;
            this.uvs.width = sourceRect.width * inverseTexW;
            this.uvs.height = sourceRect.height * inverseTexH;
        }
        Sprite.prototype.clone = function () {
            return new Sprite(this.texture2D, this.sourceRect, this.origin);
        };
        /**
         * 提供一个Sprites列表，给定一个等行/等列的Sprites图集
         * @param texture
         * @param cellWidth
         * @param cellHeight
         * @param cellOffset 处理时要包含的第一个单元格。基于0的索引
         * @param maxCellsToInclude 包含的最大单元
         */
        Sprite.spritesFromAtlas = function (texture, cellWidth, cellHeight, cellOffset, maxCellsToInclude) {
            if (cellOffset === void 0) { cellOffset = 0; }
            if (maxCellsToInclude === void 0) { maxCellsToInclude = Number.MAX_VALUE; }
            var sprites = [];
            var cols = texture.textureWidth / cellWidth;
            var rows = texture.textureHeight / cellHeight;
            var i = 0;
            var spriteSheet = new egret.SpriteSheet(texture);
            for (var y = 0; y < rows; y++) {
                for (var x = 0; x < cols; x++) {
                    // 跳过第一个cellOffset之前的所有内容
                    if (i++ < cellOffset)
                        continue;
                    var texture_1 = spriteSheet.getTexture(y + "_" + x);
                    if (!texture_1)
                        texture_1 = spriteSheet.createTexture(y + "_" + x, x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                    sprites.push(new Sprite(texture_1));
                    if (sprites.length == maxCellsToInclude)
                        return sprites;
                }
            }
            return sprites;
        };
        return Sprite;
    }());
    es.Sprite = Sprite;
})(es || (es = {}));
var es;
(function (es) {
    /**
     * SceneTransition用于从一个场景过渡到另一个场景或在一个场景内用效果过渡。
     * 如果 sceneLoadAction 为空，框架 将执行场景内的转换，而不是在转换过程中加载一个新的场景。
     *
     * 过渡的一般要领如下。
     * - onBeginTransition将被调用，允许你为多部分转换让步。
     * - 对于带有效果的两部分过渡，你可以在调用TickEffectProgressProperty时让位于第一部分，以遮挡屏幕。
     * - 产生调用loadNextScene来加载新的Scene。
     * - 在TickEffectProgressProperty上再次屈服，以解除对屏幕的遮挡并显示新的场景。
     */
    var SceneTransition = /** @class */ (function () {
        function SceneTransition(sceneLoadAction, wantsPreviousSceneRender) {
            if (sceneLoadAction === void 0) { sceneLoadAction = null; }
            if (wantsPreviousSceneRender === void 0) { wantsPreviousSceneRender = true; }
            this.sceneLoadAction = sceneLoadAction;
            this.wantsPreviousSceneRender = wantsPreviousSceneRender;
            this._loadsNewScene = sceneLoadAction != null;
            // 如果我们需要，可以创建一个RenderTexture，以备以后使用
            if (wantsPreviousSceneRender) {
                this.previousSceneRender = new egret.RenderTexture();
                this.previousSceneRender.drawToTexture(es.Core.Instance);
            }
        }
        Object.defineProperty(SceneTransition.prototype, "hasPreviousSceneRender", {
            /**
             * 在内部用于决定前一个场景是否应该渲染到 previousSceneRender 中。
             * 做双重任务，确保渲染只发生一次。
             */
            get: function () {
                if (!this._hasPreviousSceneRender) {
                    this._hasPreviousSceneRender = true;
                    return false;
                }
                return true;
            },
            enumerable: true,
            configurable: true
        });
        SceneTransition.prototype.loadNextScene = function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.onScreenObscured && this.onScreenObscured();
                        if (!!this._loadsNewScene) return [3 /*break*/, 2];
                        this._isNewSceneLoaded = true;
                        return [4 /*yield*/, 'break'];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this.loadSceneOnBackgroundThread) {
                            Promise.resolve(function () {
                                var scene = _this.sceneLoadAction();
                                es.Core.schedule(0, false, null, function (timer) {
                                    es.Core.scene = scene;
                                    _this._isNewSceneLoaded = true;
                                });
                            });
                        }
                        else {
                            es.Core.scene = this.sceneLoadAction();
                            this._isNewSceneLoaded = true;
                        }
                        _a.label = 3;
                    case 3:
                        if (!!this._isNewSceneLoaded) return [3 /*break*/, 5];
                        return [4 /*yield*/, null];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 5: return [2 /*return*/];
                }
            });
        };
        /**
         * 这时你可以在产生一帧后加载你的新场景（所以第一次渲染调用发生在场景加载之前）
         */
        SceneTransition.prototype.onBeginTransition = function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, null];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, es.Core.startCoroutine(this.loadNextScene())];
                    case 2:
                        _a.sent();
                        this.transitionComplete();
                        return [2 /*return*/];
                }
            });
        };
        /**
         * 在渲染场景之前被调用
         * @param batcher
         */
        SceneTransition.prototype.preRener = function (batcher) {
        };
        /**
         * 在这里做所有的渲染.static 这是一个基本的实现。任何特殊的渲染都应该覆盖这个方法。
         * @param batcher
         */
        SceneTransition.prototype.render = function (batcher) {
            batcher.begin(null, es.Matrix2D.toMatrix(es.Matrix2D.identity), false);
            batcher.draw(this.previousSceneRender, es.Vector2.zero);
            batcher.end();
        };
        /**
         * 当你的转换完成并且新的场景被设置后，这个函数将被调用。
         */
        SceneTransition.prototype.transitionComplete = function () {
            es.Core._instance._sceneTransition = null;
            if (this.previousSceneRender != null) {
                this.previousSceneRender.dispose();
                this.previousSceneRender = null;
            }
            this.onTransitionCompleted && this.onTransitionCompleted();
        };
        /**
         * 最常见的过渡类型似乎是将进度从0-1，如果你的过渡需要在场景加载后有一个_progress属性，这个方法就能帮你解决这个问题
         * @param effect
         * @param duration
         * @param easeType
         * @param reverseDirection
         */
        SceneTransition.prototype.tickEffectProgressProperty = function (effect, duration, easeType, reverseDirection) {
            var start, end, elapsed, step;
            if (easeType === void 0) { easeType = es.EaseType.expoOut; }
            if (reverseDirection === void 0) { reverseDirection = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = reverseDirection ? 1 : 0;
                        end = reverseDirection ? 0 : 1;
                        elapsed = 0;
                        _a.label = 1;
                    case 1:
                        if (!(elapsed < duration)) return [3 /*break*/, 3];
                        elapsed += es.Time.deltaTime;
                        step = es.Lerps.ease(easeType, start, end, elapsed, duration);
                        effect.uniforms['_progress'] = step;
                        return [4 /*yield*/, null];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        };
        return SceneTransition;
    }());
    es.SceneTransition = SceneTransition;
})(es || (es = {}));
///<reference path="./SceneTransition.ts" />
var es;
///<reference path="./SceneTransition.ts" />
(function (es) {
    /**
     * 使用图像来遮蔽部分场景，从最大到最小，然后通过旋转从最小到最大。
     * 过渡将为你卸载它。
     * Texture应该在应该遮蔽的地方是透明的，在应该遮蔽的地方是白色的
     */
    var ImageMaskTransition = /** @class */ (function (_super) {
        __extends(ImageMaskTransition, _super);
        function ImageMaskTransition(sceneLoadAction, maskTexture) {
            var _this = _super.call(this, sceneLoadAction, true) || this;
            /**
             * 出入时间
             */
            _this.duration = 1;
            /**
             * 遮罩后，在标记开始前的延迟时间
             */
            _this.delayBeforeMaskOut = 0.2;
            /**
             * 遮罩的最小比例
             */
            _this.minScale = 0.01;
            /**
             * 遮罩的最大比例
             */
            _this.maxScale = 10;
            /**
             * 用来制作比例动画的简易公式
             */
            _this.scaleEaseType = es.EaseType.expoOut;
            /**
             * 遮罩动画的最小旋转次数
             */
            _this.minRotation = 0;
            /**
             * 遮罩动画的最大旋转次数
             */
            _this.maxRotation = Math.PI * 2;
            /**
             * 用于旋转动画的简易方程
             */
            _this.rotationEaseType = es.EaseType.linear;
            var stage = es.Core.Instance.stage;
            _this._maskPosition = new es.Vector2(stage.stageWidth / 2, stage.stageHeight / 2);
            _this._maskTexture = maskTexture;
            _this._maskOrigin = new es.Vector2(_this._maskTexture.textureWidth / 2, _this._maskTexture.textureHeight / 2);
            return _this;
        }
        ImageMaskTransition.prototype.onBeginTransition = function () {
            var elapsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, null];
                    case 1:
                        _a.sent();
                        elapsed = 0;
                        _a.label = 2;
                    case 2:
                        if (!(elapsed < this.duration)) return [3 /*break*/, 4];
                        elapsed += es.Time.deltaTime;
                        this._renderScale = es.Lerps.ease(this.scaleEaseType, this.maxScale, this.minScale, elapsed, this.duration);
                        this._renderRotation = es.Lerps.ease(this.rotationEaseType, this.minRotation, this.maxRotation, elapsed, this.duration);
                        return [4 /*yield*/, null];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 4: 
                    // 装入新的场景
                    return [4 /*yield*/, es.Core.startCoroutine(this.loadNextScene())];
                    case 5:
                        // 装入新的场景
                        _a.sent();
                        // 处理掉我们之前的SceneRender。我们不再需要它了
                        this.previousSceneRender.dispose();
                        this.previousSceneRender = null;
                        return [4 /*yield*/, es.Coroutine.waitForSeconds(this.delayBeforeMaskOut)];
                    case 6:
                        _a.sent();
                        elapsed = 0;
                        _a.label = 7;
                    case 7:
                        if (!(elapsed < this.duration)) return [3 /*break*/, 9];
                        elapsed += es.Time.deltaTime;
                        this._renderScale = es.Lerps.ease(es.EaseHelper.oppositeEaseType(this.scaleEaseType), this.minScale, this.maxScale, elapsed, this.duration);
                        this._renderRotation = es.Lerps.ease(es.EaseHelper.oppositeEaseType(this.rotationEaseType), this.maxRotation, this.minRotation, elapsed, this.duration);
                        return [4 /*yield*/, null];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 9:
                        this.transitionComplete();
                        return [2 /*return*/];
                }
            });
        };
        ImageMaskTransition.prototype.preRender = function (batcher) {
            batcher.begin(null);
            batcher.draw(this._maskTexture, this._maskPosition, 0xffffff, this._renderRotation, this._maskOrigin, new es.Vector2(this._renderScale), es.SpriteEffects.none);
            batcher.end();
        };
        ImageMaskTransition.prototype.transitionComplete = function () {
            _super.prototype.transitionComplete.call(this);
            this._maskTexture.dispose();
            this._maskRenderTarget.dispose();
        };
        ImageMaskTransition.prototype.render = function (batcher) {
            // 如果我们要放大，我们就不需要再渲染之前的场景，因为我们希望新的场景是可见的
            if (!this._isNewSceneLoaded) {
                batcher.begin(null);
                batcher.draw(this.previousSceneRender, es.Vector2.zero);
                batcher.end();
            }
            batcher.begin(null);
            batcher.draw(this._maskRenderTarget, es.Vector2.zero);
            batcher.end();
        };
        return ImageMaskTransition;
    }(es.SceneTransition));
    es.ImageMaskTransition = ImageMaskTransition;
})(es || (es = {}));
