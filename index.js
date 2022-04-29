const fs = require('fs')
const path = require('path')
const pa11y = require('pa11y')

let enArticles = [],
    titles = []
const enDir = './theme-articles-list/en-trim-wiki',
      theme = 'dark',
      time = 1000


fs.readdirSync(enDir)
    .filter(name => path.extname(name) === '.json')
    .map(name => {
        let json = require(`${enDir}/${name}`)
        enArticles = enArticles.concat(json.query.search)
})

enArticles.map((item) => {
    let title = item.title.replace(' ', '_')
    title = title.replace("'", '%27')
    titles.push(title)
})

async function pause(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

(async () => {
    try {
        for (const title of titles) {
            const results = await pa11y(`https://en.wikipedia.org/api/rest_v1/page/mobile-html/${title}?theme=${theme}`)
            let themeIssuesCount = 0
            if (results.issues) {
                results.issues.forEach((issue) => {
                    if (issue.code.includes('G18')) {
                        // console.log(issue.context) -- related dom node
                        themeIssuesCount++
                    }
                })
            }
            console.log(`Contrast ratio issues count is ${themeIssuesCount} for article ${title} with ${theme} theme.`)
            await pause(time)
        }
    } catch (error) {
        console.log('Error: ', error);
    }
})()
