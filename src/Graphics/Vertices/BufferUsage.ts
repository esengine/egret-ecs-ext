module es {
    /**
     * 用于优化图形缓冲区内存位置的使用提示
     */
    export enum BufferUsage {
        /** 无特殊用途 */
        none,
        /** 缓冲区将不可读，将对渲染和写入进行优化 */
        writeOnly,
    }
}