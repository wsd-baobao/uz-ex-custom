// ignore
//@name:[禁] 好好j
//@version:2
//@webSite:https://hohoj.tv
//@remark:
//@type:100
//@instance:hohoj20240626
//@isAV:1
//@order: E
import { } from '../../core/uzVideo.js'
import { } from '../../core/uzHome.js'
import { } from '../../core/uz3lib.js'
import { } from '../../core/uzUtils.js'
// ignore

class hohojClass extends WebApiBase {
    /**
     *
     */
    constructor() {
        super();
        this.url = 'https://hohoj.tv'
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            'Host': "www.hohoj.tv",
        }
    }

    /**
     * 异步获取分类列表的方法。
     * @param {UZArgs} args
     * @returns {Promise<RepVideoClassList>}
     */
    async getClassList(args) {
        let webUrl = args.url
        // 如果通过首页获取分类的话，可以将对象内部的首页更新
        this.webSite = this.removeTrailingSlash(webUrl)
        let backData = new RepVideoClassList()

        try {
            const pro = await req(webUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data

            if (proData) {
                let document = parse(proData)
                let allClass = document.querySelectorAll('.navbar-nav.flex-row a.nav-link')
                let list = []
                for (let index = 0; index < allClass.length; index++) {
                    const element = allClass[index]
                    // let isIgnore = this.isIgnoreClassName(element.text)
                    // if (isIgnore) {
                    //     continue
                    // }
                    let type_name = element.text
                    let url = element.attributes['href']
                    if (url.length > 0 && type_name.length > 0) {
                        let videoClass = new VideoClass()
                        videoClass.type_id = url
                        videoClass.type_name = type_name
                        list.push(videoClass)
                    }
                }
                backData.data = list
            }
        } catch (error) {
            backData.error = '获取分类失败～' + error.message
        }
        return JSON.stringify(backData)
    }

    /**
     * 获取分类视频列表
     * @param {UZArgs} args
     * @returns {Promise<RepVideoList>}
     */
    async getVideoList(args) {
        let listUrl = this.removeTrailingSlash(args.url) + '&p=' + args.page
        let backData = new RepVideoList()
        try {
            let pro = await req(listUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let allVideo = document.querySelector('.video-list').querySelectorAll('.video-item')
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
            backData.error = '获取列表失败～' + error.message
        }
        return JSON.stringify(backData)
    }

    /**
     * 获取视频详情
     * @param {UZArgs} args
     * @returns {Promise<RepVideoDetail>}
     */
    async getVideoDetail(args) {
        let backData = new RepVideoDetail()
        try {
            let webUrl = args.url
            let pro = await req(webUrl, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let vod_content = ''
                let vod_pic = document.querySelector('.img-placeholder')?.attributes['src'] ?? ''
                let vod_name = document.querySelector('.article-title')?.text ?? ''
                let vod_year = ''
                let vod_director = ''
                let vod_actor = ''
                let vod_area = ''
                let vod_lang = ''
                let vod_douban_score = ''
                let type_name = document.querySelector('#latest-jav-carousel > div.glide__track > ul > li.glide__slide.glide__slide--active > div > div:nth-child(1) > a > div.video-item-title.mt-1')?.text ?? ''

                let detModel = new VideoDetail()
                detModel.vod_year = vod_year
                detModel.type_name = type_name
                detModel.vod_director = vod_director
                detModel.vod_actor = vod_actor
                detModel.vod_area = vod_area
                detModel.vod_lang = vod_lang
                detModel.vod_douban_score = vod_douban_score
                detModel.vod_content = vod_content.trim()
                detModel.vod_pic = vod_pic
                detModel.vod_name = vod_name
                detModel.vod_play_url = `$${webUrl}#`
                detModel.vod_id = webUrl

                backData.data = detModel
            }
        } catch (error) {
            backData.error = '获取视频详情失败' + error.message
        }

        return JSON.stringify(backData)
    }

    /**
     * 获取视频的播放地址
     * @param {UZArgs} args
     * @returns {Promise<RepVideoPlayUrl>}
     */
    async getVideoPlayUrl(args) {
        let backData = new RepVideoPlayUrl()
        let url = args.url
        try {
            let html = await req(url, { headers: this.headers })
            backData.error = html.error
            let document = parse(html.data)

            let w = document.querySelector('body > div.container.mt-3 > div > div.col.player-col > iframe').getAttribute('src')
            let dash = UZUtils.getHostFromURL(w)
            let dashResp = (await req(w, { headers: this.headers })).data
            let dashHtml = parse(dashResp)
            let html2 = dashHtml.querySelectorAll('body script')[5].text
            let token = html2.match(/var token = (.+);/)[1]
            let m3u8 = html2.match(/var m3u8 = (.+);/)[1]

            let play_url = dash + m3u8 + '?token=' + token

            backData.data = play_url.replace(/'|"/gm, '')
        } catch (error) {
            backData.error = error.message
        }
        return JSON.stringify(backData)
    }

    /**
     * 搜索视频
     * @param {UZArgs} args
     * @returns {Promise<RepVideoList>}
     */
    async searchVideo(args) {
        let backData = new RepVideoList()
        let url = this.removeTrailingSlash(this.webSite) + `/search?text=${args.searchWord}`

        try {
            let pro = await req(url, { headers: this.headers })
            backData.error = pro.error
            let proData = pro.data
            if (proData) {
                let document = parse(proData)
                let allVideo = document.querySelector('body > div.search.container.mt-4 > div.video-list > div:nth-child(1)').querySelectorAll('div.video-item')
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
        } catch (e) {
            backData.error = e.message
        }

        return JSON.stringify(backData)
    }

    ignoreClassName = ['首页', '其他', '热门标签', '筛选']

    combineUrl(url) {
        if (url === undefined) {
            return ''
        }
        if (url.indexOf(this.webSite) !== -1) {
            return url
        }
        if (url.startsWith('/')) {
            return this.webSite + url
        }
        return this.webSite + '/' + url
    }

    isIgnoreClassName(className) {
        for (let index = 0; index < this.ignoreClassName.length; index++) {
            const element = this.ignoreClassName[index]
            if (className.indexOf(element) !== -1) {
                return true
            }
        }
        return false
    }

    removeTrailingSlash(str) {
        if (str.endsWith('/')) {
            return str.slice(0, -1)
        }
        return str
    }
}
var hohoj20240626 = new hohojClass()
