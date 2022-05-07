import message, { reload } from './message';
import { parse as parseYaml } from 'yaml';
import { Router } from 'vue-router';

type PageConfigType = "index" | "page" | "scoreboard" | "problem" | "announcements";

export interface PageConfigLink {
    title: string;
    type: PageConfigType;
    path: string;
    id?: string;
}

export interface BaseConfig {
    type: PageConfigType;
    title: string;
    content: string[];
    'content-css'?: string;
    'content-js'?: string;
    links?: PageConfigLink[]
}

export interface IndexConfig extends BaseConfig {
    type: "index";
}

export interface PageConfig extends BaseConfig {
    type: "page";
}

export interface ProblemConfig extends BaseConfig {
    type: "problem";
    'extend-content'?: string[];
    'problem-image'?: string;
    answer: string;
    'additional-answers'?: AdditionalAnswer[];
    tips?: ProblemTips[];
    'answer-analysis'?: string;
}

export interface AdditionalAnswer {
    answer: string;
    message: string;
}

export interface ProblemTips {
    title: string;
    content: string;
}

export interface ScoreboardConfig extends BaseConfig {
    type: "scoreboard";
    scoreboarddata: ScoreboardData;
}

export interface ScoreboardData {
    finished_groups?: GroupInfo[];
    groups?: GroupInfo[];
}

export interface GroupInfo {
    gid: number;
    group_name: string;
    group_profile: string;
    total_time: number;
    score: number;
    finished_puzzle_count: number;
    is_finish: number;
}

export interface AnnouncementsConfig extends BaseConfig {
    type: "announcements";
    announcements: Announcement[];
}

export interface Announcement {
    aid: number;
    update_time: number;
    create_time: number;
    content: string;
}

export type YamlConfig = IndexConfig | PageConfig | ProblemConfig | ScoreboardConfig | AnnouncementsConfig;

export default async function GetPageConfig(configPath: string) {
    const configUrl = `/${configPath}.yaml`;
    try {
        const response = await fetch(configUrl);

        if (!response.ok) {
            message("danger", "无法加载配置文件");
            throw new Error(`${configUrl} not found`);
        }
        const configString = await response.text();
        return parseYaml(configString) as YamlConfig;
    } catch (error) {
        message("danger", "加载配置文件失败：" + error);
        throw error;
    }
}

export async function goLinkButton(link: PageConfigLink, router: Router) {
    let path = `/${link.type}?c=${link.path}`;
    await router.push(path);
    reload();
}