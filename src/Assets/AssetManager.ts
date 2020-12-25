module es {
    /**
     * 用于管理egret的资源管理器
     * egret因为有分组加载 所以在加载资源前要保证资源组先被加载完成
     */
    export class AssetManager extends GlobalManager {
        /**
         * 加载资源
         * @param name 
         * @param group 
         * @param assetTask
         */
        public async load(name: string, group: string = null, assetTask: AssetTaskProgress = null) {
            // 先检查组是否加载
            if (group) {
                let isLoad = RES.isGroupLoaded(group);
                if (!isLoad) {
                    await RES.loadGroup(group, 0, new AssetTaskReport(assetTask));
                }
            }

            return await RES.getResAsync(name);
        }
    }

    export class AssetTaskReport implements RES.PromiseTaskReporter {
        private assetUserTask: AssetTaskProgress;

        constructor(assetTask?: AssetTaskProgress) {
            this.assetUserTask = assetTask;
        }

        public onProgress(current: number, total: number, resItem: RES.ResourceInfo | undefined) {
            this.assetUserTask && this.assetUserTask(current, total, resItem);
        }
    }

    export type AssetTaskProgress = (current: number, total: number, resItem: RES.ResourceInfo | undefined) => void;
    export type AssetComplete = (res: any) => void;
}