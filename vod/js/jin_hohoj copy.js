// ignore

//@name:[禁] 好好j11
// 网站主页，只有视频源扩展需要
//@webSite:https://hohoj.tv
// 版本号纯数字
//@version:1
// 备注，没有的话就不填
//@remark:这是备注
// 加密 id，没有的话就不填
//@codeID:
// 使用的环境变量，没有的话就不填
//@env:
// 是否是AV 1是  0否
//@isAV:1
//是否弃用 1是  0否
//@deprecated:0

// ignore



// ignore
// 不支持导入，这里只是本地开发用于代码提示
// 如需添加通用依赖，请联系 https://t.me/uzVideoAppbot
import {
    FilterLabel,
    FilterTitle,
    VideoClass,
    VideoSubclass,
    VideoDetail,
    RepVideoClassList,
    RepVideoSubclassList,
    RepVideoList,
    RepVideoDetail,
    RepVideoPlayUrl,
    UZArgs,
    UZSubclassVideoListArgs,
} from '../core/uzVideo.js'

import {
    UZUtils,
    ProData,
    ReqResponseType,
    ReqAddressType,
    req,
    getEnv,
    setEnv,
    goToVerify,
    openWebToBindEnv,
    toast,
    kIsDesktop,
    kIsAndroid,
    kIsIOS,
    kIsWindows,
    kIsMacOS,
    kIsTV,
    kLocale,
    kAppVersion,
    formatBackData,
} from '../core/uzUtils.js'

import { cheerio, Crypto, Encrypt, JSONbig } from '../core/uz3lib.js'
// ignore


//MARK: 注意
// 直接复制该文件进行扩展开发
// 请保持以下 变量 及 函数 名称不变
// 请勿删减，可以新增

const appConfig = {
    _webSite: 'https://hohoj.tv',
    /**
     * 网站主页，uz 调用每个函数前都会进行赋值操作
     * 如果不想被改变 请自定义一个变量
     */
    get webSite() {
        return this._webSite
    },
    set webSite(value) {
        this._webSite = value
    },

    _uzTag: '',
    /**
     * 扩展标识，初次加载时，uz 会自动赋值，请勿修改
     * 用于读取环境变量
     */
    get uzTag() {
        return this._uzTag
    },
    set uzTag(value) {
        this._uzTag = value
    },
    _headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
        'Host': "www.hohoj.tv"
    },
    get headers() {
        return this._headers
    },
}

/**
 * 异步获取分类列表的方法。
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoClassList())>}
 */
async function getClassList(args) {
    var backData = new RepVideoClassList()
    try {
        let manualClassList = [
            { type_name: "无新", type_id: "/search?type=uncensored&order=latest" },
            { type_name: "无热", type_id: "/search?type=uncensored&order=popular" },
            { type_name: "中热", type_id: "/search?type=chinese&order=popular" },
            { type_name: "中新", type_id: "/search?type=chinese&order=latest" },
            { type_name: "有新", type_id: "/search?type=censored&order=latest" },
            { type_name: "欧新", type_id: "/search?type=europe&order=latest" },
            { type_name: "多P", type_id: "/ctg?id=16&name=多P" }
        ];

        let list = []
        for (let i = 0; i < manualClassList.length; i++) {
            const item = manualClassList[i]
            let videoClass = new VideoClass()
            videoClass.type_id = item.type_id
            videoClass.type_name = item.type_name
            list.push(videoClass)
        }
        backData.data = list

    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取二级分类列表筛选列表的方法。
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoSubclassList())>}
 */
async function getSubclassList(args) {
    var backData = new RepVideoSubclassList()
    try {
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取分类视频列表
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function getVideoList(args) {
    var backData = new RepVideoList()
    let listUrl = appConfig.webSite + args.url
    try {
        let pro = await req(listUrl, { headers: appConfig.headers })
        backData.error = pro.error
        let proData = pro.data
        if (proData) {

            if (!proData) {
                throw new Error('请求返回数据为空')
            }

            let document = parse(proData)

            if (document == null) {
                throw new Error('解析HTML失败～' + document)
            }

            let allVideo = document.querySelectorAll('div.video-item')

            if (allVideo.length === 0) {
                throw new Error('未找到视频元素' + allVideo)
            }

            let videos = []
            for (let index = 0; index < allVideo.length; index++) {
                const element = allVideo[index]
                let vodUrl = element.querySelector('a')?.attributes['href'] ?? ''
                let vodPic = element.querySelector('img')?.attributes['src'] ?? ''
                let vodName = element.querySelector('div')?.text ?? ''
                let vodDiJiJi = element.querySelector('.me-2')?.text ?? ''

                let videoDet = {}
                videoDet.vod_id = vodUrl
                videoDet.vod_pic = vodPic
                videoDet.vod_name = vodName
                videoDet.vod_remarks = vodDiJiJi.trim()
                videos.push(videoDet)
            }
            backData.data = videos
        }
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取二级分类视频列表 或 筛选视频列表
 * @param {UZSubclassVideoListArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function getSubclassVideoList(args) {
    var backData = new RepVideoList()
    try {
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取视频详情
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoDetail())>}
 */
async function getVideoDetail(args) {
    var backData = new RepVideoDetail()
    try {
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取视频的播放地址
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoPlayUrl())>}
 */
async function getVideoPlayUrl(args) {
    var backData = new RepVideoPlayUrl()
    try {
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 搜索视频
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function searchVideo(args) {
    var backData = new RepVideoList()
    try {
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}
