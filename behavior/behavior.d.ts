import { BehaviorOption } from '../types';
export default class Behavior {
    private static types;
    /**
     * 自定义 Behavior
     * @param type Behavior 名称
     * @param behavior Behavior 定义的方法集合
     */
    static registerBehavior(type: string, behavior: BehaviorOption): void;
    static hasBehavior(type: string): boolean;
    static getBehavior(type: string): any;
}
