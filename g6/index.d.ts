import Behaviors from './behavior';
import Graph from './graph/graph';
import TreeGraph from './graph/tree-graph';
import Shape from './shape';
import Layout from './layout';
import Global from './global';
import Util from './util';
import * as Algorithm from './algorithm';
declare const registerNode: typeof Shape.registerNode;
declare const registerEdge: typeof Shape.registerEdge;
declare const registerCombo: typeof Shape.registerCombo;
declare const registerBehavior: typeof Behaviors.registerBehavior;
declare const registerLayout: <Cfg>(type: string, layout: Partial<import("./interface/layout").ILayout<Cfg>>, layoutCons?: new () => import("./layout/layout").BaseLayout<Cfg>) => void;
declare const Minimap: typeof import("./plugins/minimap").default;
declare const Grid: typeof import("./plugins/grid").default;
declare const Bundling: typeof import("./plugins/bundling").default;
declare const Menu: typeof import("./plugins/menu").default;
declare const Fisheye: typeof import("./plugins/fisheye").default;
declare const ToolBar: typeof import("./plugins/toolBar").default;
declare const Tooltip: typeof import("./plugins/tooltip").default;
declare const TimeBar: typeof import("./plugins/timeBar").default;
declare const ImageMinimap: typeof import("./plugins/imageMinimap").default;
export { registerNode, registerCombo, Graph, TreeGraph, Util, registerEdge, Layout, Global, registerLayout, Minimap, Grid, Bundling, Menu, Fisheye, registerBehavior, Algorithm, ToolBar, Tooltip, TimeBar, ImageMinimap };
declare const _default: {
    version: string;
    Graph: typeof Graph;
    TreeGraph: typeof TreeGraph;
    Util: any;
    registerNode: typeof Shape.registerNode;
    registerEdge: typeof Shape.registerEdge;
    registerCombo: typeof Shape.registerCombo;
    registerBehavior: typeof Behaviors.registerBehavior;
    registerLayout: <Cfg>(type: string, layout: Partial<import("./interface/layout").ILayout<Cfg>>, layoutCons?: new () => import("./layout/layout").BaseLayout<Cfg>) => void;
    Layout: {
        [layoutType: string]: any;
        registerLayout<Cfg>(type: string, layout: Partial<import("./interface/layout").ILayout<Cfg>>, layoutCons?: new () => import("./layout/layout").BaseLayout<Cfg>): void;
    };
    Global: {
        version: string;
        rootContainerClassName: string;
        nodeContainerClassName: string;
        edgeContainerClassName: string;
        comboContainerClassName: string;
        customGroupContainerClassName: string;
        delegateContainerClassName: string;
        defaultShapeFillColor: string;
        defaultShapeStrokeColor: string;
        defaultLoopPosition: string;
        nodeLabel: {
            style: {
                fill: string;
                textAlign: string;
                textBaseline: string;
            };
            offset: number;
        };
        defaultNode: {
            type: string;
            style: {
                fill: string;
                lineWidth: number;
                stroke: string;
            };
            size: number;
            color: string;
        };
        edgeLabel: {
            style: {
                fill: string;
                textAlign: string;
                textBaseline: string;
            };
        };
        defaultEdge: {
            type: string;
            style: {
                stroke: string;
            };
            size: number;
            color: string;
        };
        comboLabel: {
            style: {
                fill: string;
                textBaseline: string;
            };
            refY: number;
            refX: number;
        };
        defaultCombo: {
            type: string;
            style: {
                fill: string;
                lineWidth: number;
                stroke: string;
                opacity: number;
                r: number;
                width: number;
                height: number;
            };
            size: number[];
            color: string;
            padding: number[];
        };
        nodeStateStyle: {};
        delegateStyle: {
            fill: string;
            fillOpacity: number;
            stroke: string;
            strokeOpacity: number;
            lineDash: number[];
        };
    };
    Minimap: typeof import("./plugins/minimap").default;
    Grid: typeof import("./plugins/grid").default;
    Bundling: typeof import("./plugins/bundling").default;
    Menu: typeof import("./plugins/menu").default;
    ToolBar: typeof import("./plugins/toolBar").default;
    Tooltip: typeof import("./plugins/tooltip").default;
    TimeBar: typeof import("./plugins/timeBar").default;
    Fisheye: typeof import("./plugins/fisheye").default;
    ImageMinimap: typeof import("./plugins/imageMinimap").default;
    Algorithm: typeof Algorithm;
    Arrow: {
        triangle: (width?: number, length?: number, d?: number) => string;
        vee: (width?: number, length?: number, d?: number) => string;
        circle: (r?: number, d?: number) => string;
        rect: (width?: number, length?: number, d?: number) => string;
        diamond: (width?: number, length?: number, d?: number) => string;
        triangleRect: (tWidth?: number, tLength?: number, rWidth?: number, rLength?: number, gap?: number, d?: number) => string;
    };
    Marker: {
        collapse: (x: any, y: any, r: any) => any[][];
        expand: (x: any, y: any, r: any) => any[][];
        upTriangle: (x: any, y: any, r: any) => any[][];
        downTriangle: (x: any, y: any, r: any) => any[][];
    };
};
export default _default;
