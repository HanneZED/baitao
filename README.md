# 肥窝 | 水汽白桃&温尔文雅

这是一个可爱风、个人用、二次元风格的静态个人网站，网站所有者为“水汽白桃”。网站用于展示橱窗作品、收藏攻略、整理手帐式记录，并且包含真实可跳转的攻略详情子页面。

## 页面结构

```text
kawaii-atelier/
├── index.html
├── styles.css
├── app.js
├── README.md
├── assets/
│   ├── mascot-card.svg
│   ├── work-archive.svg
│   ├── work-guide.svg
│   ├── work-illustration.svg
│   └── work-room.svg
├── img/
│   ├── icon.jpg
│   ├── cc1/
│   │   ├── cc1_1.jpg
│   │   ├── cc1_2.jpg
│   │   └── cc1_3.jpg
│   └── cc2/
│       ├── cc2_1.jpg
│       ├── cc2_2.jpg
│       ├── cc2_3.jpg
│       └── cc2_4.jpg
├── sound/
│   └── BGM/
│       ├── 2：23 AM.ogg
│       └── サンタは中央線でやってくる.flac
└── guides/
    ├── archive-tags.html
    ├── brush-workflow.html
    ├── cozy-desk.html
    └── starlight-route.html
```

## 已完成内容

- 首页首屏：肥窝品牌、水汽白桃介绍、`cc1` 橱窗图片自动轮播，用户不需要操作。
- 左上角圆形头像：使用 `img/icon.jpg`，保留原有呼吸动效。
- 作品橱窗：
  - `【洛克王国】二值笔全身qq人+精灵`，40 RMB，跳转画加橱窗。
- 橱窗卡片：保留一张洛克王国橱窗卡，读取 `img/cc1/`，使用相纸叠放式慢速轮播，底部按钮可手动切换图片。
- 实用信息卡：自动显示当前时间、今日日期和联网天气；浏览器允许定位时显示附近天气，不允许定位时默认显示上海天气。
- 背景音乐：右下角简约播放控制器，读取 `sound/BGM/サンタは中央線でやってくる.flac` 和 `sound/BGM/2：23 AM.ogg`，用户点击后播放，可切歌、可调节音量。
- 攻略区：搜索、分类筛选、四张攻略卡。
- 攻略详情页：四个可跳转的说明子页面。
- 联系方式：
  - QQ：727880194
  - 最终幻想14：水汽白桃@沃仙曦染
  - 闲鱼：乐座灯草
  - 小红书：暴击单盾，点击跳转到 https://www.xiaohongshu.com/user/profile/601e59e000000000010098f1
  - 画加：https://huajia.163.com/main/profile/VEgXGxbr
  - bilibili：https://space.bilibili.com/7315220?spm_id_from=333.337.0.0
- 明暗模式：右上角按钮切换，使用 `localStorage` 保存。

## 动效与交互

- Lenis：丝滑滚动。
- GSAP + ScrollTrigger：滚动入场、视差和页面节奏。
- Anime.js：悬浮小装饰、品牌头像呼吸动效、鼠标星点拖尾。
- 原生 CSS 过渡：首屏自动轮播、橱窗相纸叠放轮播和底部切换按钮。
- 背景音乐控制器：默认静音式等待用户点击，避免浏览器自动播放限制；音量会保存在浏览器里。
- CSS View Transitions：明暗模式切换时的柔和过渡。
- 卡片倾斜、磁吸按钮、滚动进度条、数字计数动效。
- 支持 `prefers-reduced-motion`，用户减少动态时会自动降低动画。

## 设计依据

根据 `ui-ux-pro-max` 的规则处理了这些点：

- 使用 Portfolio/Personal + Motion-Driven 作为基础信息架构。
- 结合 Handwritten Charm、Soft UI、Aurora、Claymorphism 的年轻女性向可爱氛围。
- 配色和描边贴近橱窗作品：奶油白底、粉色外描边、巧克力色线稿、柔黄高光、粉蓝点缀。
- 保证文本对比度、可见焦点、44px 以上触控目标和移动端响应式。
- 动效主要使用 `transform` 和 `opacity`，减少布局抖动。

## 如何修改内容

### 修改个人信息

在 `index.html` 中搜索并替换：

- `肥窝`
- `水汽白桃`
- `QQ：727880194`
- `最终幻想14：水汽白桃@沃仙曦染`
- `闲鱼：乐座灯草`
- `小红书：暴击单盾`
- 小红书链接
- 画加链接
- bilibili 链接

### 修改橱窗卡

橱窗卡位于 `index.html` 的 `#works` 区域。目前只保留洛克王国橱窗卡，图片使用 `img/cc1/`。

如果要给橱窗卡增加图片，把新图片放进对应文件夹，再在卡片里的 `<div class="showcase-carousel">...</div>` 内新增一行 `<img class="showcase-slide" ... />`。底部切换按钮会由 `app.js` 自动生成，点按钮只会切换图片，点卡片其他区域才会跳转到橱窗链接。

### 修改背景音乐

当前背景音乐文件在 `sound/BGM/` 文件夹。现在已经接入：

- `サンタは中央線でやってくる.flac`
- `2：23 AM.ogg`

如果之后要继续添加新音乐：

1. 把新的音乐文件放进 `kawaii-atelier/sound/BGM/`。
2. 打开 `app.js`。
3. 搜索 `tracks`。
4. 在 `tracks` 数组里复制一段：

```js
{
  title: "2：23 AM",
  src: "./sound/BGM/2：23 AM.ogg",
},
```

5. 把 `title` 改成播放器上想显示的名字，把 `src` 改成新音乐路径。

浏览器通常不会允许网页一打开就自动播放音乐，所以这个网站设计为用户点击右下角播放按钮后再播放。

## 攻略后台怎么更新

这个网站目前是“静态网站”，没有真正的后台管理页面。可以把它理解成：网页内容都写在文件里，改文件就是更新网站。下面按技术小白也能照着做的方式说明。

### 新增一篇攻略

1. 打开 `kawaii-atelier/guides/` 文件夹。
2. 复制任意一个现有攻略页面，例如 `starlight-route.html`。
3. 把复制出来的新文件改名，建议用英文或拼音，例如 `my-new-guide.html`。
4. 用编辑器打开这个新文件。
5. 修改页面标题，也就是 `<title>...</title>` 里面的文字。
6. 修改大标题，也就是 `<h1 id="guide-title"...>` 里面的文字。
7. 修改正文内容，主要改每个 `<article class="article-panel">...</article>` 里的标题和段落。
8. 保存文件。
9. 打开 `kawaii-atelier/index.html`，找到 `id="guide-grid"` 的攻略列表。
10. 复制一整段 `<a class="guide-card ...">...</a>`。
11. 把复制出来的新卡片里的 `href` 改成你的新页面路径，例如 `./guides/my-new-guide.html`。
12. 修改卡片标题、简介和 `data-tags` 标签。

### 修改已有攻略

1. 打开 `kawaii-atelier/guides/`。
2. 找到要修改的攻略文件。
3. 直接修改里面的标题、说明、步骤和检查清单。
4. 如果首页攻略卡片的标题或简介也要改，再打开 `kawaii-atelier/index.html`，在 `id="guide-grid"` 里改对应卡片。

### 删除一篇攻略

1. 先打开 `kawaii-atelier/index.html`。
2. 找到 `id="guide-grid"` 里的对应攻略卡片。
3. 删除整段 `<a class="guide-card ...">...</a>`。
4. 再去 `kawaii-atelier/guides/` 里删除对应的攻略页面文件。

### 攻略标签怎么写

攻略卡片上有一段类似这样的内容：

```html
data-tags="game route collect openworld"
```

这些标签会影响搜索和筛选。常用标签可以这样写：

- 游戏攻略：`game`
- 绘画攻略：`art`
- 生活记录：`life`
- 资料归档：`archive`

如果你新增了一个游戏攻略，至少要保留 `game`，这样点击“游戏”筛选时才能出现。

### 更新后怎么检查

1. 双击打开 `kawaii-atelier/index.html`。
2. 点一下新增或修改的攻略卡片。
3. 确认能跳到对应详情页。
4. 回到首页，试一下搜索框能不能搜到它。
5. 点分类筛选，确认它出现在正确分类里。

### 新增攻略详情页

1. 复制 `guides/starlight-route.html`。
2. 修改标题、说明、目录和正文内容。
3. 在 `index.html` 的攻略库新增一张 `guide-card`。
4. 把新卡片的 `href` 指向新页面。

## 部署

这个站点没有构建步骤，部署到 Vercel 时保留整个项目目录即可。部署后访问：

```text
/kawaii-atelier/
```
