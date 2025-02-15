import GetPageConfig from '../../utils/PageConfig'

export async function puzzleBackend(key: string, data: any) {
    //获取本地状态（正式比赛时在用户浏览器存储的数据）
    let status = getPuzzleBackendLocalStatus(key);

    //执行脚本
    const response = await callPuzzleBackendScript(key, data, status);

    //更新本地状态
    updatePuzzleBackendLocalStatus(key, response.stores);

    return response.data;
}

function getPuzzleBackendLocalStatus(key: string) {
    let status = localStorage.getItem(`puzzleBackendStatus-${key}`);
    if (status === null) {
        return {};
    }
    return JSON.parse(status);
}

function updatePuzzleBackendLocalStatus(key: string, stores: any) {
    localStorage.setItem(`puzzleBackendStatus-${key}`, JSON.stringify(stores));
}

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
async function callPuzzleBackendScript(key: string, data: any, status: any) {
    //读取url的?c=xxx参数
    const url = new URL(window.location.href);
    const projectPath = url.hash.match(/c=([^&]*)/)?.[1];
    if (projectPath === null) {
        throw new Error("projectPath not found in url.");
    }
    const projectHome = projectPath?.split("/")[0];
    if (projectHome === undefined) {
        throw new Error("projectHome not found in projectPath.");
    }

    //加载对应的脚本
    const scriptUrl = `${projectHome}/scripts/${key}`;
    const script = await GetPageConfig(scriptUrl);
    if (script.type !== "backend_script") {
        throw new Error("script type error.");
    }

    const sandBoxScript = new AsyncFunction('ctx', `
        with(ctx) {
            ${script.script}
        }
        return ctx;
    `);

    //准备ctx
    const requestString = JSON.stringify(data);
    const problemStatusStore = localStorage.getItem(`puzzleBackendStatus-${projectHome}-problemStatus`);
    const problemStatus = problemStatusStore === null ? {} : JSON.parse(problemStatusStore);
    const ctx = new PuzzleScriptContext(projectHome, status, requestString, problemStatus);

    //执行脚本
    const response = await sandBoxScript(ctx);

    //更新problemStatus
    if (ctx.__isStatusChanged) {
        localStorage.setItem(`puzzleBackendStatus-${projectHome}-problemStatus`, JSON.stringify(problemStatus));
    }
    const responseData = JSON.parse(ctx.__response);

    
    return {
        data: responseData,
        stores: ctx.__store
    }
}

class PuzzleScriptContext {
    __projectHome: string;
    __store: any;
    __problemStatus: any;
    __isStatusChanged: boolean = false;
    __response: any;

    request?: string;
    uid: number = 0xccbc;
    username: string = "CCBCArchives";
    gid: number = 1;

    constructor(projectHome: string, store: any, request: string, problemStatus: any) {
        this.__projectHome = projectHome;
        this.__store = store;
        this.__problemStatus = problemStatus;
        this.request = request;
    }

    getStatus(key: string) {
        return this.__store[key];
    }
    setStatus(key: string, value: any) {
        this.__store[key] = value;
    }
    response(data: string) {
        this.__response = data;
    }
    getProgress(pid: number, key: string) {
        return this.__problemStatus[pid]?.progress[key];
    }
    setProgress(pid: number, key: string, value: any) {
        if (this.__problemStatus[pid] === undefined) {
            this.__problemStatus[pid] = { progress: {} };
        }
        this.__problemStatus[pid].progress[key] = value;
        this.__isStatusChanged = true;
    }
    async getPuzzleData(pid: number) {
        //读取指定pid的题目
        //首先读取map来确定题目路径
        const mapUrl = `${this.__projectHome}/problems/map`;
        const mapConfig = await GetPageConfig(mapUrl);
        if (mapConfig.type !== "map") {
            throw new Error("map type error.");
        }
        const problemPath = mapConfig.map[pid];
        if (problemPath === undefined) {
            throw new Error("problem not found.");
        }
        const problemUrl = `${this.__projectHome}/problems/${problemPath}`;
        const problemConfig = await GetPageConfig(problemUrl);
        if (problemConfig.type !== "problem") {
            throw new Error("problem type error.");
        }
        //从题目中html段提取<data></data>中的数据
        const data = problemConfig.vue_template?.match(/<data>([\s\S]*?)<\/data>/)?.[1];
        return data;
    }
    getStorage(key: string) {
        return localStorage.getItem(`puzzleGlocalServerBackendStorage-${key}`);
    }
    setStorage(key: string, value: string) {
        localStorage.setItem(`puzzleGlocalServerBackendStorage-${key}`, value);
    }
    getGroupName(gid: number) {
        return "CCBCArchives";
    }
    getRankAndWinner(gid: number) {
        return { rank: 8888, champion: "CCBC Champion" };
    }
    async httpPostForm(url: string, form: {[key: string]: string}, headers: object) {
        //使用fetch发送post请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...headers
            },
            body: new URLSearchParams(form).toString()
        });
        //return string
        return await response.text();
    }

}